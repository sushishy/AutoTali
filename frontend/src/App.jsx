import React, { useState, useEffect } from 'react';
import StepHeader from './components/StepHeader';
import CameraScanner from './components/CameraScanner';
import DetectionReview from './components/DetectionReview';

export default function App() {
  const [sections, setSections] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [respondentNo, setRespondentNo] = useState(16);
  const [localIp, setLocalIp] = useState('');
  const [collectedData, setCollectedData] = useState({});
  const [frozenOverlay, setFrozenOverlay] = useState(null);
  const [detectedVal, setDetectedVal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState(null);
  const [activeTab, setActiveTab] = useState('scanner');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setSections(data.sections || []);
      setRespondentNo(data.next_respondent_no || 16);
      setLocalIp(data.local_ip || '');
    } catch (err) {
      console.warn('API connection check:', err);
    }
  };

  const currentSection = sections[currentStepIdx] || { id: 1, name: 'Part I — SHS Strand', type: 'strand' };

  const handleCapture = async (base64Image) => {
    setIsProcessing(true);
    setNotice('Analyzing checkboxes...');
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: currentSection.id,
          image_base64: base64Image,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFrozenOverlay(data.overlay_base64);
        setDetectedVal(data.detected_value);
        setNotice(null);
      } else {
        setNotice('Detection failed. Please retry.');
      }
    } catch (err) {
      setNotice('Network error connecting to backend.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setFrozenOverlay(null);
    setDetectedVal(null);
    setNotice(null);
  };

  const handleConfirmNext = async () => {
    const updatedCollected = { ...collectedData, [currentSection.id]: detectedVal };
    setCollectedData(updatedCollected);

    if (currentStepIdx < sections.length - 1) {
      setCurrentStepIdx((idx) => idx + 1);
      handleRetake();
    } else {
      setIsProcessing(true);
      setNotice('Saving row to Tally.xlsx...');
      try {
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            respondent_no: respondentNo,
            data: updatedCollected,
          }),
        });
        const data = await res.json();
        if (data.success) {
          alert(`Saved respondent #${respondentNo} to Excel!\nReady for next respondent.`);
          setCurrentStepIdx(0);
          setCollectedData({});
          setRespondentNo(data.next_respondent_no);
          handleRetake();
        } else {
          alert(`Failed saving to Excel: ${data.detail || 'Unknown error'}`);
        }
      } catch (err) {
        alert('Failed to connect to backend save endpoint.');
      } finally {
        setIsProcessing(false);
        setNotice(null);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <StepHeader
        respondentNo={respondentNo}
        currentStep={currentStepIdx + 1}
        totalSteps={sections.length || 7}
        sectionName={currentSection.name}
        sections={sections}
        onSelectStep={(idx) => {
          setCurrentStepIdx(idx);
          handleRetake();
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        localIp={localIp}
      />

      {notice && (
        <div style={{ background: '#1c1c1c', borderBottom: '1px solid var(--border-primary)', color: '#ffffff', padding: '6px 16px', textAlign: 'center', fontSize: '0.8rem' }}>
          {notice}
        </div>
      )}

      {activeTab === 'scanner' ? (
        <main style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 320px', gap: 12, padding: 12, overflow: 'hidden' }}>
          <div style={{ height: '100%', minHeight: 300 }}>
            <CameraScanner
              onCapture={handleCapture}
              frozenImage={frozenOverlay}
              isProcessing={isProcessing}
            />
          </div>

          <div style={{ height: '100%' }}>
            <DetectionReview
              section={currentSection}
              detectedVal={detectedVal}
              onChange={setDetectedVal}
              onRetake={handleRetake}
              onConfirm={handleConfirmNext}
              isLastStep={currentStepIdx === sections.length - 1}
              isProcessing={isProcessing}
            />
          </div>
        </main>
      ) : (
        <main style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', background: 'var(--bg-secondary)', padding: 20, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 16 }}>
              Respondent #{respondentNo} — Summary
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sections.map((sec, idx) => {
                const answer = collectedData[sec.id];
                const isCurrent = idx === currentStepIdx;
                return (
                  <div
                    key={sec.id}
                    onClick={() => {
                      setCurrentStepIdx(idx);
                      setActiveTab('scanner');
                      handleRetake();
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isCurrent ? 'var(--bg-elevated)' : 'transparent',
                      border: `1px solid ${isCurrent ? '#ffffff' : 'var(--border-primary)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>
                        {idx + 1}. {sec.name}
                      </span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Cols: {sec.cols.join(', ')}
                      </p>
                    </div>
                    <span style={{ fontWeight: 600, color: answer ? '#ffffff' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {answer ? (Array.isArray(answer) ? `[ ${answer.join(', ')} ]` : `Choice ${answer}`) : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
