import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';

import ProjectsTasksView from './views/ProjectsTasksView';
import CalendarView from './views/CalendarView';
import AgendaView from './views/AgendaView';
import BookingView from './views/BookingView';
import NotesView from './views/NotesView';
import TutorialsView from './views/TutorialsView';

import TaskDialog from './components/dialogs/TaskDialog';
import ProjectDialog from './components/dialogs/ProjectDialog';
import ProjectPlanDialog from './components/dialogs/ProjectPlanDialog';
import MeetingDialog from './components/dialogs/MeetingDialog';
import NoteDialog from './components/dialogs/NoteDialog';
import ExtractNotesDialog from './components/dialogs/ExtractNotesDialog';
import ConflictResolverDialog from './components/dialogs/ConflictResolverDialog';

import './styles/App.css';

function MainLayout() {
  const { currentView } = useApp();

  return (
    <div className="app-container">
      <Sidebar />

      <main className="motion-main">
        {currentView === 'projects-tasks' && <ProjectsTasksView />}
        {currentView === 'calendar' && <CalendarView />}
        {currentView === 'agenda' && <AgendaView />}
        {currentView === 'team-schedule' && <BookingView />}
        {currentView === 'ai-meeting-notes' && <NotesView />}
        {currentView === 'tutorials' && <TutorialsView />}
      </main>

      {/* Global Dialogs */}
      <TaskDialog />
      <ProjectDialog />
      <ProjectPlanDialog />
      <MeetingDialog />
      <NoteDialog />
      <ExtractNotesDialog />
      <ConflictResolverDialog />

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
