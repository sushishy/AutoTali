import React, { useState, useEffect } from 'react';
import StepHeader from './components/StepHeader';
import CameraScanner from './components/CameraScanner';
import DetectionReview from './components/DetectionReview';
import ManualEntry from './components/ManualEntry';

export default function App() {
  const [sections, setSections] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(() => {
    const saved = localStorage.getItem('autotali_step');
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  const [respondentNo, setRespondentNo] = useState(() => {
    const saved = localStorage.getItem('autotali_resp');
    return saved !== null ? parseInt(saved, 10) : 16;
  });
  const [localIp, setLocalIp] = useState('');
  const [collectedData, setCollectedData] = useState(() => {
    try {
      const saved = localStorage.getItem('autotali_data');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [frozenOverlay, setFrozenOverlay] = useState(null);
  const [detectedVal, setDetectedVal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('autotali_tab') || 'scanner';
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('autotali_step', currentStepIdx);
  }, [currentStepIdx]);

  useEffect(() => {
    localStorage.setItem('autotali_resp', respondentNo);
  }, [respondentNo]);

  useEffect(() => {
    localStorage.setItem('autotali_data', JSON.stringify(collectedData));
  }, [collectedData]);

  useEffect(() => {
    localStorage.setItem('autotali_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      const secs = data.sections || [];
      setSections(secs);
      // If no saved respondent in localStorage, use backend next
      if (!localStorage.getItem('autotali_resp')) {
        setRespondentNo(data.next_respondent_no || 16);
      }
      setLocalIp(data.local_ip || '');

      // Restore active value for the restored step if available
      const savedStep = parseInt(localStorage.getItem('autotali_step') || '0', 10);
      const activeSec = secs[savedStep];
      if (activeSec && collectedData[activeSec.id] !== undefined) {
        setDetectedVal(collectedData[activeSec.id]);
      }
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

  const goToStep = (idx) => {
    setCurrentStepIdx(idx);
    const targetSection = sections[idx];
    const existing = targetSection ? collectedData[targetSection.id] : null;
    setDetectedVal(existing !== undefined ? existing : null);
    setFrozenOverlay(null);
    setNotice(null);
  };

  const handlePreviousStep = () => {
    if (currentStepIdx > 0) {
      goToStep(currentStepIdx - 1);
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
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      const nextSec = sections[nextIdx];
      const existingNext = nextSec ? updatedCollected[nextSec.id] : null;
      setDetectedVal(existingNext !== undefined ? existingNext : null);
      setFrozenOverlay(null);
      setNotice(null);
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
    <div className="app-container">
      <StepHeader
        respondentNo={respondentNo}
        currentStep={currentStepIdx + 1}
        totalSteps={sections.length || 7}
        sectionName={currentSection.name}
        sections={sections}
        onSelectStep={(idx) => goToStep(idx)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        localIp={localIp}
        onSetRespondentNo={(newNo) => setRespondentNo(newNo)}
      />

      {notice && (
        <div style={{ background: '#1c1c1c', borderBottom: '1px solid var(--border-primary)', color: '#ffffff', padding: '6px 16px', textAlign: 'center', fontSize: '0.8rem' }}>
          {notice}
        </div>
      )}

      {activeTab === 'manual' ? (
        <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <ManualEntry
            section={currentSection}
            currentVal={detectedVal}
            onChange={setDetectedVal}
            onConfirm={handleConfirmNext}
            onPrevious={handlePreviousStep}
            canGoBack={currentStepIdx > 0}
            isLastStep={currentStepIdx === sections.length - 1}
            isProcessing={isProcessing}
            totalSteps={sections.length || 7}
            currentStepIndex={currentStepIdx}
          />
        </main>
      ) : activeTab === 'scanner' ? (
        <main className="scanner-grid">
          <div className="camera-container-box" style={{ height: '100%', minHeight: 280 }}>
            <CameraScanner
              onCapture={handleCapture}
              frozenImage={frozenOverlay}
              isProcessing={isProcessing}
            />
          </div>

          <div className="review-container-box" style={{ height: '100%' }}>
            <DetectionReview
              section={currentSection}
              detectedVal={detectedVal}
              onChange={setDetectedVal}
              onRetake={handleRetake}
              onConfirm={handleConfirmNext}
              onPrevious={handlePreviousStep}
              canGoBack={currentStepIdx > 0}
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
