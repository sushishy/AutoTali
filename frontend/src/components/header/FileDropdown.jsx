import React, { useEffect } from 'react';
import { FileSpreadsheet, ChevronDown, Check, Plus } from 'lucide-react';

export default function FileDropdown({
  isOpen,
  onToggle,
  onClose,
  activeFile,
  availableFiles = [],
  onSwitchFile,
  onOpenNewFileModal,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (onClose) onClose();
        else if (onToggle) onToggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onToggle]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onToggle}
        style={{
          padding: '6px 12px',
          fontSize: '0.75rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-sm)',
          whiteSpace: 'nowrap',
        }}
      >
        <FileSpreadsheet size={13} color="var(--text-secondary)" />
        <span
          className="active-file-label"
          style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {activeFile}
        </span>
        <ChevronDown size={12} />
      </button>

      {isOpen && (
        <>
          {/* Full-screen backdrop to close dropdown when clicking outside */}
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
              else onToggle();
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
              else onToggle();
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 190,
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              cursor: 'default',
              animation: 'fadeIn 0.2s ease-out forwards',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              width: 220,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 1px rgba(255, 255, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 200,
              padding: 4,
            }}
          >
          <div
            style={{
              padding: '6px 8px',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Excel Files
          </div>

          {availableFiles.map((file) => (
            <button
              key={file}
              onClick={() => {
                if (file !== activeFile && onSwitchFile) {
                  onSwitchFile(file);
                }
                if (onClose) onClose();
                else onToggle();
              }}
              style={{
                padding: '8px 10px',
                fontSize: '0.75rem',
                background: activeFile === file ? 'var(--bg-subtle)' : 'transparent',
                color: activeFile === file ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                justifyContent: 'space-between',
                width: '100%',
                fontWeight: activeFile === file ? 700 : 500,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file}
              </span>
              {activeFile === file && <Check size={12} />}
            </button>
          ))}

          <div style={{ height: 1, background: 'var(--border-primary)', margin: '4px 0' }} />
          <button
            onClick={() => {
              if (onClose) onClose();
              else onToggle();
              onOpenNewFileModal();
            }}
            style={{
              padding: '8px 10px',
              fontSize: '0.75rem',
              background: 'transparent',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              justifyContent: 'flex-start',
              width: '100%',
              fontWeight: 600,
              gap: 6,
            }}
          >
            <Plus size={13} /> New Empty File...
          </button>
        </div>
        </>
      )}
    </div>
  );
}
