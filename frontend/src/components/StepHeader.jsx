import React, { useState, useRef, useEffect } from 'react';
import { Camera, FileText, Smartphone, Check, Copy, Edit3, Hash, ChevronDown, FileSpreadsheet, Plus } from 'lucide-react';

export default function StepHeader({
  respondentNo,
  currentStep,
  totalSteps,
  sectionName,
  sections = [],
  onSelectStep,
  activeTab,
  onTabChange,
  localIp,
  onSetRespondentNo,
  activeFile = 'Tally.xlsx',
  availableFiles = ['Tally.xlsx'],
  onSwitchFile,
  onCreateNewFile,
  isEditing = false,
}) {
  const [copied, setCopied] = useState(false);
  const [isEditingResp, setIsEditingResp] = useState(false);
  const [tempResp, setTempResp] = useState(respondentNo);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);


  const phoneUrl = `http://${localIp || 'localhost'}:8000`;

  const copyUrl = () => {
    navigator.clipboard?.writeText(phoneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveResp = () => {
    const num = parseInt(tempResp, 10);
    if (!isNaN(num) && num >= 1 && onSetRespondentNo) {
      onSetRespondentNo(num);
    }
    setIsEditingResp(false);
  };


  const modeLabels = {
    scanner: { label: 'Scanner', icon: Camera },
    manual: { label: 'Manual', icon: Edit3 },
    guide: { label: 'Summary', icon: FileText },
  };

  const CurrentModeIcon = modeLabels[activeTab]?.icon || Camera;

  return (
    <header style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', position: 'relative', zIndex: 100 }}>
      {/* Top row: Brand, Resp selector, and Dropdown Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        {/* Left: Brand + Respondent quick tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            AutoTali
          </span>

          {/* Respondent Number Selector */}
          {isEditingResp ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                type="number"
                min="1"
                max="999"
                value={tempResp}
                onChange={(e) => setTempResp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveResp();
                  if (e.key === 'Escape') setIsEditingResp(false);
                }}
                autoFocus
                style={{
                  width: 44,
                  padding: '2px 4px',
                  fontSize: '0.72rem',
                  background: 'var(--bg-elevated)',
                  color: '#ffffff',
                  border: '1px solid #ffffff',
                  borderRadius: 'var(--radius-xs)',
                  textAlign: 'center',
                }}
              />
              <button
                onClick={handleSaveResp}
                style={{ padding: '2px 5px', fontSize: '0.7rem', background: '#ffffff', color: '#000000', fontWeight: 700 }}
              >
                <Check size={11} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempResp(respondentNo);
                setIsEditingResp(true);
              }}
              title="Click to change Respondent / Excel Row Level"
              style={{
                padding: '3px 6px',
                fontSize: '0.7rem',
                background: 'var(--bg-elevated)',
                color: '#ffffff',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-xs)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                whiteSpace: 'nowrap',
              }}
            >
              <Hash size={11} color="#a3a3a3" />
              <span>#{respondentNo}</span>
              {isEditing && (
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  background: '#d97706',
                  color: '#000000',
                  borderRadius: 3,
                  padding: '1px 4px',
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                }}>EDIT</span>
              )}
            </button>
          )}
        </div>

        {/* Right: Dropdowns & Connect actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Phone IP URL Badge */}
          <div
            onClick={copyUrl}
            title={`Phone URL: ${phoneUrl} (Click to copy)`}
            className="phone-url-badge"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            <Smartphone size={13} color="#a3a3a3" />
            <code className="phone-url-text" style={{ fontSize: '0.74rem', color: '#ffffff', fontWeight: 600 }}>{phoneUrl}</code>
            {copied ? <Check size={11} color="#ffffff" /> : <Copy size={11} color="#a3a3a3" />}
          </div>

          {/* Mode Dropdown Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setModeDropdownOpen(!modeDropdownOpen);
                setFileDropdownOpen(false);
              }}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffffff',
                color: '#000000',
                border: '1px solid #ffffff',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap',
              }}
            >
              <CurrentModeIcon size={13} />
              <span>{modeLabels[activeTab]?.label || 'Mode'}</span>
              <ChevronDown size={12} />
            </button>

            {modeDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: 125,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.85)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  zIndex: 200,
                }}
              >
                {[
                  { id: 'scanner', label: 'Scanner', icon: Camera },
                  { id: 'manual', label: 'Manual', icon: Edit3 },
                  { id: 'guide', label: 'Summary', icon: FileText },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      onTabChange(id);
                      setModeDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      background: activeTab === id ? '#262626' : 'transparent',
                      color: activeTab === id ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: 0,
                      justifyContent: 'flex-start',
                      width: '100%',
                      fontWeight: activeTab === id ? 700 : 500,
                    }}
                  >
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Excel File Dropdown Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setFileDropdownOpen(!fileDropdownOpen);
                setModeDropdownOpen(false);
              }}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--bg-elevated)',
                color: '#ffffff',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap',
              }}
            >
              <FileSpreadsheet size={13} color="#a3a3a3" />
              <span className="active-file-label" style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeFile}
              </span>
              <ChevronDown size={12} />
            </button>

            {fileDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: 220,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.85)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  zIndex: 200,
                  padding: 4,
                }}
              >
                <div style={{ padding: '6px 8px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Excel Files
                </div>

                {availableFiles.map((file) => (
                  <button
                    key={file}
                    onClick={() => {
                      if (onSwitchFile) onSwitchFile(file);
                      setFileDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      background: activeFile === file ? '#262626' : 'transparent',
                      color: activeFile === file ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: 'var(--radius-xs)',
                      justifyContent: 'space-between',
                      width: '100%',
                      fontWeight: activeFile === file ? 700 : 500,
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file}</span>
                    {activeFile === file && <Check size={12} />}
                  </button>
                ))}

                <div style={{ height: 1, background: 'var(--border-primary)', margin: '4px 0' }} />

                <button
                  onClick={() => {
                    setFileDropdownOpen(false);
                    const name = window.prompt('Enter filename for new empty file:\nExample: Section_B.xlsx');
                    if (name && name.trim() && onCreateNewFile) {
                      onCreateNewFile(name.trim());
                    }
                  }}
                  style={{
                    padding: '8px 10px',
                    fontSize: '0.75rem',
                    background: 'transparent',
                    color: '#ffffff',
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
            )}
          </div>
        </div>
      </div>

      {/* Section Pill Tabs — Only allow jumping to current or already completed steps */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 10, paddingBottom: 2 }}>
        {sections.map((sec, idx) => {
          const isCurrent = idx === currentStep - 1;
          const isDone = idx < currentStep - 1;
          const isAccessible = idx <= currentStep - 1;

          return (
            <button
              key={sec.id}
              onClick={() => isAccessible && onSelectStep(idx)}
              disabled={!isAccessible}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                background: isCurrent ? '#ffffff' : 'transparent',
                color: isCurrent ? '#000000' : isDone ? '#ffffff' : '#404040',
                borderColor: isCurrent ? '#ffffff' : isDone ? '#404040' : '#1f1f1f',
                fontWeight: isCurrent ? 700 : 500,
                whiteSpace: 'nowrap',
                opacity: isAccessible ? 1 : 0.4,
                cursor: isAccessible ? 'pointer' : 'not-allowed',
              }}
              title={!isAccessible ? `Please complete step ${currentStep} first` : ''}
            >
              {isDone && <Check size={11} strokeWidth={3} />}
              {idx + 1}. {sec.name.split('—')[0].replace('Part ', 'P').trim()}
            </button>
          );
        })}
      </div>
    </header>
  );
}
