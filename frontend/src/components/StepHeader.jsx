import React, { useState, useEffect } from 'react';
import { Hash, ChevronDown } from 'lucide-react';
import RespondentModal from './header/RespondentModal';
import NewFileModal from './header/NewFileModal';
import ModeDropdown from './header/ModeDropdown';
import FileDropdown from './header/FileDropdown';
import { isSoundMuted, toggleSoundMuted } from '../utils/audio';

export default function StepHeader({
  respondentNo,
  activeTab,
  onTabChange,
  localIp,
  onSetRespondentNo,
  activeFile = 'Tally.xlsx',
  availableFiles = ['Tally.xlsx'],
  onSwitchFile,
  onCreateNewFile,
  onOpenTerms,
}) {
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);
  const [showRespModal, setShowRespModal] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [isMuted, setIsMuted] = useState(() => isSoundMuted());

  const handleToggleMute = () => {
    const next = toggleSoundMuted();
    setIsMuted(next);
  };

  // Theme Management
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('autotali_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('autotali_theme', theme);
    } catch { }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const closeDropdowns = () => {
    setModeDropdownOpen(false);
    setFileDropdownOpen(false);
  };

  const phoneUrl = `http://${localIp || 'localhost'}:8000`;

  return (
    <>
      {/* ── Dialog Modals ── */}
      <RespondentModal
        isOpen={showRespModal}
        onClose={() => setShowRespModal(false)}
        respondentNo={respondentNo}
        onConfirm={onSetRespondentNo}
      />

      <NewFileModal
        isOpen={showNewFileModal}
        onClose={() => setShowNewFileModal(false)}
        onCreate={onCreateNewFile}
      />

      {/* ── Main Navigation Header ── */}
      <header
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border-primary)',
          background: 'var(--bg-secondary)',
          position: 'relative',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          {/* Brand Logo */}
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            AutoTali
          </span>

          {/* Action Controls */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Respondent Row Button */}
            <button
              onClick={() => {
                setShowRespModal(true);
                closeDropdowns();
              }}
              title="Change respondent level"
              style={{
                padding: '5px 9px',
                fontSize: '0.72rem',
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
              }}
            >
              <Hash size={11} color="var(--text-secondary)" />
              <span>{respondentNo}</span>
              <ChevronDown size={10} color="var(--text-muted)" />
            </button>

            {/* Mode Selector & Theme Toggle Dropdown */}
            <ModeDropdown
              isOpen={modeDropdownOpen}
              onToggle={() => {
                setModeDropdownOpen(!modeDropdownOpen);
                setFileDropdownOpen(false);
              }}
              onClose={() => setModeDropdownOpen(false)}
              activeTab={activeTab}
              onTabChange={onTabChange}
              phoneUrl={phoneUrl}
              theme={theme}
              onToggleTheme={toggleTheme}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onOpenTerms={onOpenTerms}
            />

            {/* Active Excel File Dropdown */}
            <FileDropdown
              isOpen={fileDropdownOpen}
              onToggle={() => {
                setFileDropdownOpen(!fileDropdownOpen);
                setModeDropdownOpen(false);
              }}
              onClose={() => setFileDropdownOpen(false)}
              activeFile={activeFile}
              availableFiles={availableFiles}
              onSwitchFile={onSwitchFile}
              onOpenNewFileModal={() => setShowNewFileModal(true)}
            />
          </div>
        </div>
      </header>
    </>
  );
}
