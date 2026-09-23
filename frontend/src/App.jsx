import React, { useState } from 'react';
import { useSurvey } from './hooks/useSurvey';
import StepHeader from './components/StepHeader';
import SectionStrip from './components/SectionStrip';
import CameraScanner from './components/CameraScanner';
import DetectionReview from './components/DetectionReview';
import ManualEntry from './components/ManualEntry';
import SummaryView from './components/SummaryView';

export default function App() {
  const {
    sections,
    currentStepIdx,
    setCurrentStepIdx,
    currentSection,
    respondentNo,
    setRespondentNo,
    collectedData,
    setCollectedData,
    activeTab,
    setActiveTab,
    activeFile,
    availableFiles,
    localIp,
    switchFile,
    createNewFile,
    saveToExcel,
    advanceStep,
    resetSurvey,
  } = useSurvey();

  const [frozenOverlay, setFrozenOverlay] = useState(null);
  const [detectedVal, setDetectedVal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState(null);
  const [isCardOpen, setIsCardOpen] = useState(false);

  const handleRetake = () => {
    setFrozenOverlay(null);
    setDetectedVal(null);
    setIsCardOpen(false);
    setNotice(null);
  };

  const goToStep = (idx) => {
    setCurrentStepIdx(idx);
    const targetSection = sections[idx];
    setDetectedVal(targetSection && collectedData[targetSection.id] !== undefined ? collectedData[targetSection.id] : null);
    handleRetake();
  };

  const handleCapture = async (base64Image) => {
    setIsProcessing(true);
    setNotice('Analyzing checkboxes...');
    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section_id: currentSection.id, image_base64: base64Image, return_overlay: true }),
      });
      const data = await res.json();
      if (data.success) {
        setFrozenOverlay(data.overlay_base64);
        setDetectedVal(data.detected_value);
        setIsCardOpen(true);
        setNotice(null);
      } else {
        setNotice('Detection failed. Please retry.');
      }
    } catch {
      setNotice('Network error connecting to backend.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoLock = ({ overlayBase64, detectedValue }) => {
    setFrozenOverlay(overlayBase64);
    setDetectedVal(detectedValue);
    setIsCardOpen(true);
    setNotice(null);
  };

  const handleConfirmNext = async () => {
    const updated = { ...collectedData, [currentSection.id]: detectedVal };
    setCollectedData(updated);

    const nextIdx = advanceStep();
    if (nextIdx !== -1) {
      const nextSec = sections[nextIdx];
      setDetectedVal(nextSec && updated[nextSec.id] !== undefined ? updated[nextSec.id] : null);
      setFrozenOverlay(null);
      setNotice(null);
    } else {
      setIsProcessing(true);
      setNotice('Saving row to Tally.xlsx...');
      try {
        const data = await saveToExcel(updated);
        if (data.success) {
          alert(`Saved respondent #${respondentNo} to Excel!\nReady for next respondent.`);
          resetSurvey(data.next_respondent_no);
          handleRetake();
        } else {
          alert(`Failed saving to Excel: ${data.detail || 'Unknown error'}`);
        }
      } catch {
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
        onSelectStep={goToStep}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        localIp={localIp}
        onSetRespondentNo={setRespondentNo}
        activeFile={activeFile}
        availableFiles={availableFiles}
        onSwitchFile={async (f) => (await switchFile(f)) && handleRetake()}
        onCreateNewFile={async (f) => (await createNewFile(f)) && handleRetake()}
      />

      {notice && (
        <div style={{ background: '#1c1c1c', borderBottom: '1px solid var(--border-primary)', color: '#ffffff', padding: '6px 16px', textAlign: 'center', fontSize: '0.8rem' }}>
          {notice}
        </div>
      )}

      {activeTab !== 'guide' && (
        <SectionStrip
          currentStep={currentStepIdx + 1}
          totalSteps={sections.length || 7}
          sectionName={currentSection.name}
          canGoBack={currentStepIdx > 0}
          onPrevious={() => goToStep(currentStepIdx - 1)}
        />
      )}

      {activeTab === 'manual' ? (
        <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <ManualEntry
            section={currentSection}
            currentVal={detectedVal}
            onChange={setDetectedVal}
            onConfirm={handleConfirmNext}
            onPrevious={() => goToStep(currentStepIdx - 1)}
            canGoBack={currentStepIdx > 0}
            isLastStep={currentStepIdx === sections.length - 1}
            isProcessing={isProcessing}
            totalSteps={sections.length || 7}
            currentStepIndex={currentStepIdx}
          />
        </main>
      ) : activeTab === 'scanner' ? (
        <main className="scanner-grid">
          <div className="camera-container-box">
            <CameraScanner
              section={currentSection}
              sectionId={currentSection.id}
              sectionName={currentSection.name}
              onCapture={handleCapture}
              onAutoLock={handleAutoLock}
              frozenImage={frozenOverlay}
              isProcessing={isProcessing}
              onViewAnswers={() => setIsCardOpen(true)}
              hasResult={!isCardOpen && (frozenOverlay !== null || detectedVal !== null)}
            />
          </div>

          <div className={`review-container-box ${isCardOpen ? '' : 'hidden-mobile'}`}>
            <DetectionReview
              section={currentSection}
              detectedVal={detectedVal}
              onChange={setDetectedVal}
              onRetake={handleRetake}
              onConfirm={handleConfirmNext}
              onPrevious={() => goToStep(currentStepIdx - 1)}
              onDismiss={() => setIsCardOpen(false)}
              canGoBack={currentStepIdx > 0}
              isLastStep={currentStepIdx === sections.length - 1}
              isProcessing={isProcessing}
            />
          </div>
        </main>
      ) : (
        <SummaryView
          respondentNo={respondentNo}
          sections={sections}
          collectedData={collectedData}
          currentStepIdx={currentStepIdx}
          onSelectStep={(idx) => {
            goToStep(idx);
            setActiveTab('scanner');
          }}
        />
      )}
    </div>
  );
}
