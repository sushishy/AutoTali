import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function NewFileModal({ isOpen, onClose, onCreate }) {
  const [newFileName, setNewFileName] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    const trimmed = newFileName.trim();
    if (trimmed && onCreate) {
      onCreate(trimmed);
    }
    setNewFileName('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 24px 20px',
          width: 320,
          maxWidth: '92vw',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.04em' }}>
            New Questionnaire File
          </span>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', padding: 4, color: 'var(--text-secondary)' }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: -6 }}>
          Enter filename for the new blank Excel questionnaire.
        </p>

        <input
          type="text"
          placeholder="name.xlsx"
          value={newFileName}
          autoFocus
          onChange={(e) => setNewFileName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate();
            if (e.key === 'Escape') onClose();
          }}
          style={{
            padding: '10px 12px',
            fontSize: '0.95rem',
            fontWeight: 600,
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-sm)',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '0.8rem',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!newFileName.trim()}
            style={{
              flex: 2,
              padding: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              border: '1px solid var(--text-primary)',
              cursor: newFileName.trim() ? 'pointer' : 'not-allowed',
              opacity: newFileName.trim() ? 1 : 0.45,
            }}
          >
            Create File
          </button>
        </div>
      </div>
    </div>
  );
}
