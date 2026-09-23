import React, { useState } from 'react';
import { Camera, FileText, Smartphone, Laptop, Check, Copy } from 'lucide-react';

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
}) {
  const [copied, setCopied] = useState(false);
  const phoneUrl = `http://${localIp || 'localhost'}:8000`;

  const copyUrl = () => {
    navigator.clipboard?.writeText(phoneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div style={{ display: 'flex', gap: 4 }}>
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

      {/* Section Pill Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 10, paddingBottom: 2 }}>
        {sections.map((sec, idx) => {
          const isCurrent = idx === currentStep - 1;
          const isDone = idx < currentStep - 1;
          return (
            <button
              key={sec.id}
              onClick={() => onSelectStep(idx)}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                background: isCurrent ? '#ffffff' : 'transparent',
                color: isCurrent ? '#000000' : isDone ? '#ffffff' : 'var(--text-muted)',
                borderColor: isCurrent ? '#ffffff' : isDone ? '#404040' : 'var(--border-primary)',
                fontWeight: isCurrent ? 700 : 500,
                whiteSpace: 'nowrap',
              }}
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
