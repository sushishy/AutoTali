import React from 'react';
import { Check } from 'lucide-react';

const STRAND_OPTIONS = [
  { val: 1, label: '1 — STEM (Science, Technology, Engineering, Mathematics)' },
  { val: 2, label: '2 — TVL-ICT (Technical-Vocational-Livelihood ICT)' },
  { val: 3, label: '3 — Non-Aligned' },
];

export default function StrandSelector({ currentVal, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Select Senior High School Strand:
      </p>
      {STRAND_OPTIONS.map(({ val, label }) => {
        const active = currentVal === val;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'left',
              background: active ? 'var(--text-primary)' : 'var(--bg-elevated)',
              color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
              border: `1px solid ${active ? 'var(--text-primary)' : 'var(--border-primary)'}`,
              fontWeight: active ? 700 : 500,
              fontSize: '0.9rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{label}</span>
            {active && <Check size={18} strokeWidth={2.5} />}
          </button>
        );
      })}
    </div>
  );
}
