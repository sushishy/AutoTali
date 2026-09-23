import React, { useState } from 'react';
import { Camera, FileText, Smartphone, Laptop, Check, Copy, Edit3, Hash } from 'lucide-react';

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
}) {
  const [copied, setCopied] = useState(false);
  const [isEditingResp, setIsEditingResp] = useState(false);
  const [tempResp, setTempResp] = useState(respondentNo);
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

  return (
    <header style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
      {/* Top row: Brand & IP display banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            AutoTali
          </span>
          <span style={{ fontSize: '0.7rem', border: '1px solid var(--border-primary)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', color: 'var(--text-secondary)' }}>
            Resp. #{respondentNo}
          </span>
        </div>

        {/* Prominent Phone IP Connect Banner */}
        <div
          onClick={copyUrl}
          title="Click to copy phone URL"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 12px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          <Smartphone size={14} color="#a3a3a3" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Phone:</span>
          <code style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 700 }}>{phoneUrl}</code>
          {copied ? <Check size={13} color="#ffffff" /> : <Copy size={13} color="#a3a3a3" />}
        </div>

        {/* View Tabs */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button
            onClick={() => onTabChange('manual')}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              background: activeTab === 'manual' ? '#ffffff' : 'transparent',
              color: activeTab === 'manual' ? '#000000' : 'var(--text-secondary)',
              borderColor: activeTab === 'manual' ? '#ffffff' : 'var(--border-primary)',
              fontWeight: 600,
            }}
          >
            <Edit3 size={13} /> Manual
          </button>
          <button
            onClick={() => onTabChange('scanner')}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              background: activeTab === 'scanner' ? '#ffffff' : 'transparent',
              color: activeTab === 'scanner' ? '#000000' : 'var(--text-secondary)',
              borderColor: activeTab === 'scanner' ? '#ffffff' : 'var(--border-primary)',
              fontWeight: 600,
            }}
          >
            <Camera size={13} /> Scanner
          </button>

          {/* Respondent Number / Row Selector Button (Right side of Scanner) */}
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
                  width: 55,
                  padding: '5px 6px',
                  fontSize: '0.75rem',
                  background: 'var(--bg-elevated)',
                  color: '#ffffff',
                  border: '1px solid #ffffff',
                  borderRadius: 'var(--radius-xs)',
                  textAlign: 'center',
                }}
              />
              <button
                onClick={handleSaveResp}
                title="Save respondent number"
                style={{
                  padding: '5px 8px',
                  fontSize: '0.75rem',
                  background: '#ffffff',
                  color: '#000000',
                  fontWeight: 700,
                }}
              >
                <Check size={12} strokeWidth={3} />
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
                padding: '6px 10px',
                fontSize: '0.75rem',
                background: 'transparent',
                color: '#ffffff',
                borderColor: 'var(--border-primary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Hash size={13} color="#a3a3a3" />
              <span>Resp #{respondentNo}</span>
            </button>
          )}

          <button
            onClick={() => onTabChange('guide')}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              background: activeTab === 'guide' ? '#ffffff' : 'transparent',
              color: activeTab === 'guide' ? '#000000' : 'var(--text-secondary)',
              borderColor: activeTab === 'guide' ? '#ffffff' : 'var(--border-primary)',
              fontWeight: 600,
            }}
          >
            <FileText size={13} /> Summary
          </button>
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
