import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function RespondentModal({ isOpen, onClose, respondentNo, onConfirm }) {
  const [tempResp, setTempResp] = useState(respondentNo);

  useEffect(() => {
    setTempResp(respondentNo);
  }, [respondentNo]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const num = parseInt(tempResp, 10);
    if (!isNaN(num) && num >= 1 && onConfirm) {
      onConfirm(num);
    }
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
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
          width: 290,
          maxWidth: '92vw',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.04em' }}>
            Respondent Level
          </span>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', padding: 4, color: 'var(--text-secondary)' }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: -6 }}>
          Enter the respondent row number to jump to or edit.
        </p>

        <input
          type="number"
          min="1"
          max="9999"
          value={tempResp}
          autoFocus
          onChange={(e) => setTempResp(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') onClose();
          }}
          style={{
            padding: '10px 12px',
            fontSize: '1.1rem',
            fontWeight: 700,
            textAlign: 'center',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-sm)',
            outline: 'none',
            letterSpacing: '0.08em',
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
            onClick={handleConfirm}
            style={{
              flex: 2,
              padding: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              border: '1px solid var(--text-primary)',
            }}
          >
            Go to #{tempResp}
          </button>
        </div>
      </div>
    </div>
  );
}
