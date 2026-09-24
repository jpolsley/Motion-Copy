import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast() {
  const { toasts } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.isError ? 'error' : ''}`}>
          {toast.isError ? (
            <AlertCircle size={15} style={{ color: '#ef4444' }} />
          ) : (
            <CheckCircle2 size={15} style={{ color: '#10b981' }} />
          )}
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  );
}
