import React from 'react';
import { Check } from 'lucide-react';
import StarryChoiceButton from '../common/StarryChoiceButton';

const STRAND_OPTIONS = [
  { val: 1, label: '1 — STEM (Science, Technology, Engineering, Mathematics)' },
  { val: 2, label: '2 — TVL-ICT (Technical-Vocational-Livelihood ICT)' },
  { val: 3, label: '3 — Non-Aligned' },
];

export default function StrandSelector({ currentVal, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'visible' }}>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Select Senior High School Strand:
      </p>
      {STRAND_OPTIONS.map(({ val, label }) => {
        const active = currentVal === val;
        return (
          <StarryChoiceButton
            key={val}
            variant="strand"
            isSelected={active}
            onClick={() => onChange(val)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>{label}</span>
              {active && <Check size={18} strokeWidth={2.5} />}
            </div>
          </StarryChoiceButton>
        );
      })}
    </div>
  );
}
