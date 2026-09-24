import React, { useState } from 'react';
import { ShieldCheck, Camera, Database, CheckCircle2, Lock, ArrowRight, X } from 'lucide-react';

export default function TermsModal({ isOpen, onAccept, onClose, canDismiss = false }) {
  const [agreed, setAgreed] = useState(true);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (agreed && onAccept) {
      onAccept();
    }
  };

  return (
    <div
      onClick={canDismiss ? onClose : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-primary)',
          borderRadius: 16,
          width: 540,
          maxWidth: '94vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          animation: 'popupCardBottomRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '22px 24px 18px',
            borderBottom: '1px solid var(--border-primary)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                  marginBottom: 2,
                }}
              >
                AutoTali • Legal & Compliance
              </div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Terms and Conditions
              </h2>
            </div>
          </div>

          {canDismiss && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Scrollable Terms Content */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            fontSize: '0.82rem',
            lineHeight: 1.55,
            color: 'var(--text-secondary)',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>
            Welcome to <strong style={{ color: 'var(--text-primary)' }}>AutoTali</strong>. Before scanning questionnaires or tallying survey responses, please review our terms regarding data privacy and system usage:
          </p>

          {/* Term 1: Local Data Privacy */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-secondary)',
              display: 'flex',
              gap: 12,
            }}
          >
            <Lock size={18} style={{ color: 'var(--text-primary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
                1. 100% Local Data Processing
              </strong>
              <span>
                All survey image captures, bubble detections, and respondent tallies are computed locally on your device or private network. AutoTali does not upload any questionnaires, camera frames, or personal responses to external servers or cloud services.
              </span>
            </div>
          </div>

          {/* Term 2: Camera Usage */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-secondary)',
              display: 'flex',
              gap: 12,
            }}
          >
            <Camera size={18} style={{ color: 'var(--text-primary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
                2. Camera Access & Scanning
              </strong>
              <span>
                Camera permissions are used solely for real-time survey optical mark recognition (OMR). Ensure proper lighting and align questionnaire bubbles inside the viewfinder box for reliable automated detection.
              </span>
            </div>
          </div>

          {/* Term 3: Accuracy & Verification */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-secondary)',
              display: 'flex',
              gap: 12,
            }}
          >
            <CheckCircle2 size={18} style={{ color: 'var(--text-primary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
                3. Verification & Researcher Responsibility
              </strong>
              <span>
                Automated computer vision accelerates data entry, but the surveyor or researcher maintains ultimate responsibility to inspect and verify recognized values before saving to the final Excel worksheet.
              </span>
            </div>
          </div>

          {/* Term 4: Data Ownership */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-secondary)',
              display: 'flex',
              gap: 12,
            }}
          >
            <Database size={18} style={{ color: 'var(--text-primary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 2 }}>
                4. Excel Ownership & Storage
              </strong>
              <span>
                Generated <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>.xlsx</code> files remain strictly your property. They are saved directly to your workspace storage without proprietary lock-ins.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer / Accept Action */}
        <div
          style={{
            padding: '16px 24px 20px',
            borderTop: '1px solid var(--border-primary)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* Agreement Checkbox */}
          <label
            onClick={() => setAgreed(!agreed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: '0.78rem',
              color: 'var(--text-primary)',
            }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{
                width: 16,
                height: 16,
                accentColor: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            />
            <span>
              I have read and agree to the <strong>Terms & Conditions</strong> for survey scanning and local tallying.
            </span>
          </label>

          {/* Button */}
          <button
            onClick={handleAccept}
            disabled={!agreed}
            style={{
              width: '100%',
              padding: '12px 18px',
              fontSize: '0.88rem',
              fontWeight: 800,
              letterSpacing: '0.02em',
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              border: '1px solid var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: agreed ? 'pointer' : 'not-allowed',
              opacity: agreed ? 1 : 0.45,
              transition: 'all 0.18s ease',
              boxShadow: agreed ? '0 4px 16px rgba(0, 0, 0, 0.35)' : 'none',
            }}
          >
            <span>I Accept & Continue</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
