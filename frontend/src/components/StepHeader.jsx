import React, { useState, useEffect } from 'react';
import { Camera, FileText, Smartphone, Check, Copy, Edit3, Hash, ChevronDown, FileSpreadsheet, Plus, X } from 'lucide-react';

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
}) {
  const [copied, setCopied] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);
  const [showRespModal, setShowRespModal] = useState(false);
  const [tempResp, setTempResp] = useState(respondentNo);

  // Keep tempResp in sync when respondentNo changes externally
  useEffect(() => { setTempResp(respondentNo); }, [respondentNo]);

  const phoneUrl = `http://${localIp || 'localhost'}:8000`;

  const copyUrl = () => {
    navigator.clipboard?.writeText(phoneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmResp = () => {
    const num = parseInt(tempResp, 10);
    if (!isNaN(num) && num >= 1 && onSetRespondentNo) {
      onSetRespondentNo(num);
    }
    setShowRespModal(false);
  };

  const closeAll = () => {
    setModeDropdownOpen(false);
    setFileDropdownOpen(false);
  };

  const modeLabels = {
    scanner: { label: 'Scanner', icon: Camera },
    manual:  { label: 'Manual',  icon: Edit3  },
    guide:   { label: 'Summary', icon: FileText },
  };

  const CurrentModeIcon = modeLabels[activeTab]?.icon || Camera;

  return (
    <>
      {/* ── Respondent Modal ── */}
      {showRespModal && (
        <div
          onClick={() => setShowRespModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '24px 24px 20px',
              width: 280,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.04em' }}>
                Respondent Level
              </span>
              <button
                onClick={() => setShowRespModal(false)}
                style={{ background: 'transparent', border: 'none', padding: 4, color: '#a3a3a3' }}
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
                if (e.key === 'Enter') handleConfirmResp();
                if (e.key === 'Escape') setShowRespModal(false);
              }}
              style={{
                padding: '10px 12px',
                fontSize: '1.1rem',
                fontWeight: 700,
                textAlign: 'center',
                background: '#000000',
                color: '#ffffff',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                letterSpacing: '0.08em',
              }}
            />

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowRespModal(false)}
                style={{
                  flex: 1, padding: '10px',
                  fontSize: '0.8rem',
                  background: 'transparent',
                  color: '#a3a3a3',
                  border: '1px solid var(--border-primary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResp}
                style={{
                  flex: 2, padding: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  background: '#ffffff',
                  color: '#000000',
                  border: '1px solid #ffffff',
                }}
              >
                Go to #{tempResp}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header Bar ── */}
      <header style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-primary)',
        background: 'var(--bg-secondary)',
        position: 'relative',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>

          {/* Left: Brand */}
          <span style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            AutoTali
          </span>

          {/* Right: Controls */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>

            {/* Respondent # — opens modal */}
            <button
              onClick={() => { setShowRespModal(true); closeAll(); }}
              title="Change respondent level"
              style={{
                padding: '5px 9px',
                fontSize: '0.72rem',
                background: 'var(--bg-elevated)',
                color: '#ffffff',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
              }}
            >
              <Hash size={11} color="#a3a3a3" />
              <span>{respondentNo}</span>
              <ChevronDown size={10} color="#525252" />
            </button>

            {/* Mode Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setModeDropdownOpen(!modeDropdownOpen); setFileDropdownOpen(false); }}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#ffffff', color: '#000000',
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
                <div style={{
                  position: 'absolute', top: '115%', right: 0,
                  width: 200,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.85)',
                  display: 'flex', flexDirection: 'column',
                  zIndex: 200, padding: 4,
                }}>
                  <div style={{ padding: '5px 8px', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Mode
                  </div>
                  {[
                    { id: 'scanner', label: 'Scanner', icon: Camera },
                    { id: 'manual',  label: 'Manual',  icon: Edit3  },
                    { id: 'guide',   label: 'Summary', icon: FileText },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => { onTabChange(id); setModeDropdownOpen(false); }}
                      style={{
                        padding: '7px 10px', fontSize: '0.75rem',
                        background: activeTab === id ? '#262626' : 'transparent',
                        color: activeTab === id ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none', borderRadius: 'var(--radius-xs)',
                        justifyContent: 'flex-start', width: '100%',
                        fontWeight: activeTab === id ? 700 : 500,
                      }}
                    >
                      <Icon size={13} /> {label}
                    </button>
                  ))}

                  {/* Phone URL copy */}
                  <div style={{ height: 1, background: 'var(--border-primary)', margin: '4px 0' }} />
                  <button
                    onClick={() => { copyUrl(); setModeDropdownOpen(false); }}
                    style={{
                      padding: '7px 10px', fontSize: '0.72rem',
                      background: 'transparent',
                      color: copied ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none', borderRadius: 'var(--radius-xs)',
                      justifyContent: 'space-between', width: '100%', fontWeight: 500, gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Smartphone size={13} color="#a3a3a3" />
                      <code style={{ fontSize: '0.7rem', fontWeight: 600 }}>{phoneUrl}</code>
                    </div>
                    {copied ? <Check size={12} color="#ffffff" /> : <Copy size={12} color="#525252" />}
                  </button>
                </div>
              )}
            </div>

            {/* Excel File Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setFileDropdownOpen(!fileDropdownOpen); setModeDropdownOpen(false); }}
                style={{
                  padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--bg-elevated)', color: '#ffffff',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap',
                }}
              >
                <FileSpreadsheet size={13} color="#a3a3a3" />
                <span className="active-file-label" style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeFile}
                </span>
                <ChevronDown size={12} />
              </button>

              {fileDropdownOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0, width: 220,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.85)',
                  display: 'flex', flexDirection: 'column',
                  overflow: 'hidden', zIndex: 200, padding: 4,
                }}>
                  <div style={{ padding: '6px 8px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Excel Files
                  </div>

                  {availableFiles.map((file) => (
                    <button
                      key={file}
                      onClick={() => { if (onSwitchFile) onSwitchFile(file); setFileDropdownOpen(false); }}
                      style={{
                        padding: '8px 10px', fontSize: '0.75rem',
                        background: activeFile === file ? '#262626' : 'transparent',
                        color: activeFile === file ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none', borderRadius: 'var(--radius-xs)',
                        justifyContent: 'space-between', width: '100%',
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
                      if (name && name.trim() && onCreateNewFile) onCreateNewFile(name.trim());
                    }}
                    style={{
                      padding: '8px 10px', fontSize: '0.75rem',
                      background: 'transparent', color: '#ffffff',
                      border: 'none', borderRadius: 'var(--radius-xs)',
                      justifyContent: 'flex-start', width: '100%', fontWeight: 600, gap: 6,
                    }}
                  >
                    <Plus size={13} /> New Empty File...
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
