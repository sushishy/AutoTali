import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { playPopupSound, stopPopupSound } from '../utils/audio';

export default function PopupCard({ card, onClose }) {
  useEffect(() => {
    if (!card) return;

    // Play dedicated popup sound (success or error)
    playPopupSound(card.type);

    // Auto-dismiss success and info cards after 4.5 seconds
    let timer;
    if (card.type !== 'error') {
      timer = setTimeout(() => {
        onClose();
      }, 4500);
    }

    // Stop sound effect when popup card is closed or disappears
    return () => {
      if (timer) clearTimeout(timer);
      stopPopupSound();
    };
  }, [card, onClose]);

  if (!card) return null;

  const title = typeof card.title === 'string'
    ? card.title
    : (typeof card.title === 'object' && card.title?.title ? String(card.title.title) : '');
  const message = typeof card.message === 'string'
    ? card.message
    : (typeof card.message === 'object' && card.message?.message ? String(card.message.message) : '');
  const type = card.type || 'info';

  const iconConfig = {
    success: { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    error:   { icon: AlertCircle,  color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
    info:    { icon: Info,         color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  }[type] || { icon: Info, color: 'var(--text-primary)', bg: 'var(--bg-subtle)' };

  const Icon = iconConfig.icon;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 99999,
        maxWidth: 'calc(100vw - 32px)',
        width: 360,
        animation: 'popupCardBottomRight 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: iconConfig.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          <Icon size={18} color={iconConfig.color} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <h4
              style={{
                fontSize: '0.86rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 3,
                letterSpacing: '0.02em',
              }}
            >
              {title}
            </h4>
          )}
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
            }}
          >
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            padding: 4,
            cursor: 'pointer',
            borderRadius: 'var(--radius-xs)',
            flexShrink: 0,
          }}
          title="Close notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
