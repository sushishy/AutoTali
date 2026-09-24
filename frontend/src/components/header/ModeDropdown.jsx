import React, { useState } from 'react';
import { Camera, Edit3, FileText, ChevronDown, Smartphone, Check, Copy, Moon, Sun } from 'lucide-react';

const MODE_ITEMS = [
  { id: 'scanner', label: 'Scanner', icon: Camera },
  { id: 'manual',  label: 'Manual',  icon: Edit3  },
  { id: 'guide',   label: 'Summary', icon: FileText },
];

export default function ModeDropdown({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  phoneUrl,
  theme,
  onToggleTheme,
}) {
  const [copied, setCopied] = useState(false);

  const CurrentModeIcon = MODE_ITEMS.find((m) => m.id === activeTab)?.icon || Camera;
  const currentLabel = MODE_ITEMS.find((m) => m.id === activeTab)?.label || 'Mode';

  const handleCopyUrl = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(phoneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onToggle}
        style={{
          padding: '6px 12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--text-primary)',
          color: 'var(--bg-primary)',
          border: '1px solid var(--text-primary)',
          borderRadius: 'var(--radius-sm)',
          whiteSpace: 'nowrap',
        }}
      >
        <CurrentModeIcon size={13} />
        <span>{currentLabel}</span>
        <ChevronDown size={12} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '115%',
            right: 0,
            width: 210,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 200,
            padding: 4,
          }}
        >
          <div
            style={{
              padding: '5px 8px',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Mode
          </div>

          {MODE_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                onTabChange(id);
                onToggle();
              }}
              style={{
                padding: '7px 10px',
                fontSize: '0.75rem',
                background: activeTab === id ? 'var(--bg-subtle)' : 'transparent',
                color: activeTab === id ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                justifyContent: 'flex-start',
                width: '100%',
                fontWeight: activeTab === id ? 700 : 500,
              }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}

          {/* Phone URL copy */}
          <div style={{ height: 1, background: 'var(--border-primary)', margin: '4px 0' }} />
          <button
            onClick={handleCopyUrl}
            style={{
              padding: '7px 10px',
              fontSize: '0.72rem',
              background: 'transparent',
              color: copied ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              justifyContent: 'space-between',
              width: '100%',
              fontWeight: 500,
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Smartphone size={13} color="var(--text-secondary)" />
              <code style={{ fontSize: '0.7rem', fontWeight: 600 }}>{phoneUrl}</code>
            </div>
            {copied ? <Check size={12} color="var(--text-primary)" /> : <Copy size={12} color="var(--text-muted)" />}
          </button>

          {/* Theme Toggle Button */}
          <div style={{ height: 1, background: 'var(--border-primary)', margin: '4px 0' }} />
          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            style={{
              padding: '7px 10px',
              fontSize: '0.75rem',
              background: 'transparent',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              justifyContent: 'space-between',
              width: '100%',
              fontWeight: 500,
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {theme === 'dark' ? (
                <Moon size={13} color="var(--text-secondary)" />
              ) : (
                <Sun size={13} color="#f59e0b" />
              )}
              <span>Theme</span>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                textTransform: 'capitalize',
              }}
            >
              {theme}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
