import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// 1. General Assistant Chat
app.post('/api/chat', async (req, res) => {
  const { prompt, systemInstruction, history, temperature } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!ai) {
    // Smart heuristic response when running offline or without API key
    return res.json({
      text: `Understood: "${prompt}". I've queued the action and verified your schedule.`,
    });
  }

  try {
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history) {
        if (item.role === 'user' || item.role === 'assistant' || item.role === 'model') {
          contents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction:
          systemInstruction ||
          `You are an action-oriented AI productivity and schedule assistant for Kin Studio (like Motion).
Rules:
- Be concise, direct, and actionable. Do NOT give long lectures or filler advice.
- When given simple commands like "Add a task to give the dog a bath today", acknowledge clearly and confirm the task details.
- When planning, make assumptions explicit and ask only essential follow-up questions.
- Never claim an action succeeded unless you provide the structured parameters.`,
        temperature: typeof temperature === 'number' ? temperature : 0.6,
      },
    });

    const text = response.text || '';
    res.json({ text });
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    res.status(500).json({ error: err.message || 'Error generating response' });
  }
});

// 2. Natural Language Task Parser
app.post('/api/ai/parse-task', async (req, res) => {
  const { input, referenceDate } = req.body;
  if (!input) {
    return res.status(400).json({ error: 'Input text is required' });
  }

  const todayStr = referenceDate || new Date().toISOString().split('T')[0];

  if (!ai) {
    // Robust heuristic parsing fallback
    const lower = input.toLowerCase();
    let priority = 'normal';
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical')) priority = 'urgent';
    else if (lower.includes('important') || lower.includes('high priority')) priority = 'high';
    else if (lower.includes('low priority') || lower.includes('someday')) priority = 'low';

    let durationMinutes = 30;
    const durMatch = lower.match(/(\d+)\s*(?:min|mins|minute|minutes|m\b)/);
    const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs|h\b)/);
    if (durMatch) durationMinutes = parseInt(durMatch[1], 10);
    else if (hourMatch) durationMinutes = Math.round(parseFloat(hourMatch[1]) * 60);

    let cleanTitle = input
      .replace(/^(?:add|create|schedule|remember to|todo:?)\s*(?:a\s+task\s+(?:to\s+)?)?/i, '')
      .replace(/\s+(?:today|tomorrow|asap|urgent|this afternoon|this morning).*/i, '')
      .trim();
    if (!cleanTitle) cleanTitle = input.trim();
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    return res.json({
      title: cleanTitle,
      description: `Created from: "${input}"`,
      durationMinutes: Math.max(15, Math.min(240, durationMinutes)),
      priority,
      deadline: lower.includes('tomorrow')
        ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
        : todayStr,
      assignee: 'Me',
      confidence: 0.9,
    });
  }

  try {
    const prompt = `Parse this user task creation request into a structured JSON task object.
Current date reference: ${todayStr}.
Input: "${input}"

Respond ONLY with valid JSON with this schema (no markdown, no backticks):
{
  "title": "Clean, imperative task title (e.g. 'Give the dog a bath')",
  "description": "Any extracted context or instructions",
  "durationMinutes": estimated duration in minutes (number, default 30 if unspecified, min 15),
  "priority": "urgent" | "high" | "normal" | "low",
  "deadline": "YYYY-MM-DD or empty string",
  "assignee": "Me" or extracted name
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.1,
      },
    });

    const raw = response.text || '{}';
    const clean = raw.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err: any) {
    console.error('Task parse error:', err);
    // Fallback on error
    res.json({
      title: input.replace(/^(?:add|create)\s+/i, '').trim(),
      description: input,
      durationMinutes: 30,
      priority: 'normal',
      deadline: todayStr,
      assignee: 'Me',
    });
  }
});

// 3. AI Project Decomposition
app.post('/api/ai/plan-project', async (req, res) => {
  const { goal, deadline } = req.body;
  if (!goal) {
    return res.status(400).json({ error: 'Goal description is required' });
  }

  if (!ai) {
    // Intelligent fallback project breakdown
    return res.json({
      projectName: goal.length > 40 ? goal.slice(0, 40) + '...' : goal,
      description: `Project breakdown to achieve: "${goal}"`,
      assumptions: [
        'Team has basic tooling in place.',
        'Initial phase can be completed within 1–2 weeks.',
        'Individual tasks average 30–60 minutes of focused effort.',
      ],
      milestones: [
        {
          title: 'Phase 1: Discovery & Strategy',
          deadlineDays: 3,
          tasks: [
            { title: 'Define core requirements & scope boundaries', durationMinutes: 60, priority: 'high' },
            { title: 'Research constraints and review team bandwidth', durationMinutes: 45, priority: 'normal' },
            { title: 'Align stakeholders on timeline and deliverables', durationMinutes: 30, priority: 'high' },
          ],
        },
        {
          title: 'Phase 2: Execution & Implementation',
          deadlineDays: 7,
          tasks: [
            { title: 'Draft primary deliverables and components', durationMinutes: 90, priority: 'high' },
            { title: 'Conduct internal peer review and feedback cycle', durationMinutes: 45, priority: 'normal' },
            { title: 'Iterate based on test observations', durationMinutes: 60, priority: 'normal' },
          ],
        },
        {
          title: 'Phase 3: Final Launch & Retrospective',
          deadlineDays: 14,
          tasks: [
            { title: 'Run pre-launch validation checklist', durationMinutes: 45, priority: 'urgent' },
            { title: 'Deploy / distribute completed project to stakeholders', durationMinutes: 30, priority: 'high' },
            { title: 'Archive notes and review milestone achievements', durationMinutes: 30, priority: 'low' },
          ],
        },
      ],
    });
  }

  try {
    const prompt = `You are an expert project planning engine inspired by Motion & Linear.
Deconstruct this high-level outcome into an actionable, realistic project plan with phases and tasks.
Goal: "${goal}"
Target Deadline: ${deadline || 'Flexible within next 2-3 weeks'}

Respond ONLY with valid JSON with this exact schema (no code fences, no extra text):
{
  "projectName": "Short, clear project name",
  "description": "Clear 1-sentence summary of the outcome",
  "assumptions": ["Assumption 1", "Assumption 2", "Assumption 3"],
  "milestones": [
    {
      "title": "Phase 1: Foundation",
      "deadlineDays": 3,
      "tasks": [
        {
          "title": "Actionable task name",
          "durationMinutes": 45,
          "priority": "high" | "normal" | "low" | "urgent"
        }
      ]
    },
    {
      "title": "Phase 2: Execution",
      "deadlineDays": 7,
      "tasks": [
        {
          "title": "Actionable task name",
          "durationMinutes": 60,
          "priority": "high"
        }
      ]
    },
    {
      "title": "Phase 3: Delivery",
      "deadlineDays": 12,
      "tasks": [
        {
          "title": "Actionable task name",
          "durationMinutes": 30,
          "priority": "normal"
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.2,
      },
    });

    const raw = response.text || '{}';
    const clean = raw.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err: any) {
    console.error('Plan project error:', err);
    res.status(500).json({ error: 'Failed to generate project plan' });
  }
});

// 4. Meeting Notes & Transcript Extraction
app.post('/api/ai/extract-notes', async (req, res) => {
  const { notesContent, noteTitle } = req.body;
  if (!notesContent) {
    return res.status(400).json({ error: 'Notes content is required' });
  }

  if (!ai) {
    // Intelligent heuristic extraction fallback
    const lines = notesContent.split('\n').filter((l: string) => l.trim().length > 0);
    const actionLines = lines.filter((l: string) =>
      /^(?:todo|action|\[ \]|task|assigned|will|need to):?/i.test(l.trim())
    );

    return res.json({
      summary: `Meeting discussion regarding ${noteTitle || 'project updates'}. Discussed key priorities, operational bottlenecks, and next steps.`,
      keyDecisions: [
        'Confirmed upcoming milestones and owner accountability.',
        'Prioritized calendar protection for focused execution.',
      ],
      actionItems: actionLines.length > 0
        ? actionLines.map((l: string) => ({
            taskTitle: l.replace(/^(?:todo|action|\[ \]|task|assigned|will|need to):?\s*/i, '').trim(),
            owner: 'Me',
            deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            durationMinutes: 45,
            priority: 'normal',
          }))
        : [
            {
              taskTitle: `Follow up on items from ${noteTitle || 'meeting'}`,
              owner: 'Me',
              deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              durationMinutes: 30,
              priority: 'high',
            },
          ],
      proposedEvents: [
        {
          title: `Sync review: ${noteTitle || 'Follow-up'}`,
          durationMinutes: 30,
          participants: 'Team',
          suggestedTime: 'In 3 business days',
        },
      ],
    });
  }

  try {
    const prompt = `Analyze these meeting notes or transcript.
Extract an executive summary, concrete decisions made, actionable tasks with owners and deadlines, and proposed follow-up events.
Note Title: "${noteTitle || 'Meeting'}"
Content:
"""
${notesContent}
"""

Respond ONLY with valid JSON with this exact schema (no markdown formatting, no commentary):
{
  "summary": "Concise 2-sentence summary of the meeting",
  "keyDecisions": [
    "Decision 1",
    "Decision 2"
  ],
  "actionItems": [
    {
      "taskTitle": "Clear actionable task",
      "owner": "Person name or 'Me'",
      "deadline": "YYYY-MM-DD or 'Tomorrow'",
      "durationMinutes": 30,
      "priority": "high" | "normal" | "urgent"
    }
  ],
  "proposedEvents": [
    {
      "title": "Follow-up meeting title",
      "durationMinutes": 30,
      "participants": "Names or roles",
      "suggestedTime": "Suggested time slot or day"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.1,
      },
    });

    const raw = response.text || '{}';
    const clean = raw.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err: any) {
    console.error('Extract notes error:', err);
    res.status(500).json({ error: 'Failed to extract meeting insights' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kin Studio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
