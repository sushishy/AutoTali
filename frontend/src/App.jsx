import React, { useState, useEffect } from 'react';
import StepHeader from './components/StepHeader';
import CameraScanner from './components/CameraScanner';
import DetectionReview from './components/DetectionReview';

export default function App() {
  const [sections, setSections] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [respondentNo, setRespondentNo] = useState(16);
  const [collectedData, setCollectedData] = useState({});
  const [frozenOverlay, setFrozenOverlay] = useState(null);
  const [detectedVal, setDetectedVal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setSections(data.sections || []);
      setRespondentNo(data.next_respondent_no || 16);
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
    // Record current section's confirmed answer
    const updatedCollected = { ...collectedData, [currentSection.id]: detectedVal };
    setCollectedData(updatedCollected);

    if (currentStepIdx < sections.length - 1) {
      // Advance to next section
      setCurrentStepIdx((idx) => idx + 1);
      handleRetake();
    } else {
      // All 7 sections completed! Send to Excel
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
          // Reset for next respondent
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
      />

      {notice && (
        <div style={{ background: 'var(--accent-primary)', color: '#0f172a', padding: '6px 16px', textAlign: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
          {notice}
        </div>
      )}

      {/* Main Grid View */}
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 340px', gap: 16, padding: 16, overflow: 'hidden' }}>
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
    </div>
  );
}
