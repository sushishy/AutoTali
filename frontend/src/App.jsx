import React, { useState } from 'react';
import { useSurvey } from './hooks/useSurvey';
import StepHeader from './components/StepHeader';
import CameraScanner from './components/CameraScanner';
import DetectionReview from './components/DetectionReview';
import ManualEntry from './components/ManualEntry';
import SummaryView from './components/SummaryView';
import PopupCard from './components/PopupCard';
import TermsModal from './components/TermsModal';
import { playSectionSuccess } from './utils/audio';

export default function App() {
  const [popupCard, setPopupCard] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(() => {
    try {
      return localStorage.getItem('autotali_terms_accepted') !== 'true';
    } catch {
      return false;
    }
  });
  const [canDismissTerms, setCanDismissTerms] = useState(() => {
    try {
      return localStorage.getItem('autotali_terms_accepted') === 'true';
    } catch {
      return false;
    }
  });

  const handleAcceptTerms = () => {
    try {
      localStorage.setItem('autotali_terms_accepted', 'true');
    } catch {}
    setShowTermsModal(false);
    setCanDismissTerms(true);
  };

  const handleOpenTermsManually = () => {
    setCanDismissTerms(true);
    setShowTermsModal(true);
  };
  const showPopup = (titleOrObj, message, type = 'info') => {
    if (typeof titleOrObj === 'object' && titleOrObj !== null) {
      setPopupCard({
        title: titleOrObj.title || '',
        message: titleOrObj.message || '',
        type: titleOrObj.type || 'info',
      });
    } else {
      setPopupCard({ title: titleOrObj, message, type });
    }
  };

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
  } = useSurvey(showPopup);

  const [frozenOverlay, setFrozenOverlay] = useState(null);
  const [detectedVal, setDetectedVal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);

  const handleRetake = () => {
    setFrozenOverlay(null);
    setDetectedVal(null);
    setIsCardOpen(false);
  };

  const goToStep = (idx) => {
    setCurrentStepIdx(idx);
    const targetSection = sections[idx];
    setDetectedVal(targetSection && collectedData[targetSection.id] !== undefined ? collectedData[targetSection.id] : null);
    handleRetake();
  };

  const handleCapture = async (base64Image) => {
    setIsProcessing(true);
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
      } else {
        showPopup('Detection Issue', 'Detection failed. Please check alignment and retry.', 'error');
      }
    } catch {
      showPopup('Network Error', 'Network error connecting to backend.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoLock = ({ overlayBase64, detectedValue }) => {
    setFrozenOverlay(overlayBase64);
    setDetectedVal(detectedValue);
    setIsCardOpen(true);
  };

  const handleConfirmNext = async () => {
    const updated = { ...collectedData, [currentSection.id]: detectedVal };
    setCollectedData(updated);

    const nextIdx = advanceStep();
    if (nextIdx !== -1) {
      playSectionSuccess();
      const nextSec = sections[nextIdx];
      setDetectedVal(nextSec && updated[nextSec.id] !== undefined ? updated[nextSec.id] : null);
      setFrozenOverlay(null);
      setIsCardOpen(false);
    } else {
      setIsProcessing(true);
      try {
        const data = await saveToExcel(updated);
        if (data.success) {
          showPopup(
            'Saved to Excel',
            `Respondent #${respondentNo} saved successfully!\nReady for next respondent.`,
            'success'
          );
          resetSurvey(data.next_respondent_no);
          handleRetake();
        } else {
          showPopup(
            'Save Failed',
            `Failed saving to Excel: ${data.detail || 'Unknown error'}`,
            'error'
          );
        }
      } catch {
        showPopup('Connection Error', 'Failed to connect to backend save endpoint.', 'error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="app-container">
      {/* Sleek in-app popup notification card (replaces browser alerts) */}
      <PopupCard card={popupCard} onClose={() => setPopupCard(null)} />

      {/* First-time opening Terms and Conditions modal with blurred background */}
      <TermsModal
        isOpen={showTermsModal}
        onAccept={handleAcceptTerms}
        onClose={() => setShowTermsModal(false)}
        canDismiss={canDismissTerms}
      />

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
        onOpenTerms={handleOpenTermsManually}
      />

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
