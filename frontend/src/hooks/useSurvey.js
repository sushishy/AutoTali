import { useState, useEffect, useCallback } from 'react';

export function useSurvey() {
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
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('autotali_tab') || 'scanner';
  });
  const [activeFile, setActiveFile] = useState('Tally.xlsx');
  const [availableFiles, setAvailableFiles] = useState(['Tally.xlsx']);

  // Sync state to localStorage
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

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      const secs = data.sections || [];
      setSections(secs);
      if (data.active_file) setActiveFile(data.active_file);
      if (data.available_files) setAvailableFiles(data.available_files);

      if (!localStorage.getItem('autotali_resp')) {
        setRespondentNo(data.next_respondent_no || 16);
      }
      setLocalIp(data.local_ip || '');
    } catch (err) {
      console.warn('API connection error:', err);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const switchFile = async (filename) => {
    try {
      const res = await fetch('/api/sheets/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveFile(data.active_file);
        setAvailableFiles(data.available_files);
        setRespondentNo(data.next_respondent_no);
        setCurrentStepIdx(0);
        setCollectedData({});
        return true;
      }
      alert(`Failed to switch file: ${data.detail || 'Error'}`);
      return false;
    } catch {
      alert('Network error switching file');
      return false;
    }
  };

  const createNewFile = async (rawName) => {
    let filename = rawName.trim();
    if (!filename) return false;
    if (!filename.endsWith('.xlsx')) filename += '.xlsx';

    try {
      const res = await fetch('/api/sheets/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveFile(data.active_file);
        setAvailableFiles(data.available_files);
        setRespondentNo(data.next_respondent_no || 1);
        setCurrentStepIdx(0);
        setCollectedData({});
        alert(`Created and switched to empty questionnaire: ${filename}`);
        return true;
      }
      alert(`Could not create file: ${data.detail || 'Error'}`);
      return false;
    } catch {
      alert('Network error creating file');
      return false;
    }
  };

  const saveToExcel = async (finalData) => {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        respondent_no: respondentNo,
        data: finalData,
      }),
    });
    return await res.json();
  };

  const advanceStep = () => {
    if (currentStepIdx < sections.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      return nextIdx;
    }
    return -1;
  };

  const resetSurvey = (nextRespondentNo) => {
    setCurrentStepIdx(0);
    setCollectedData({});
    setRespondentNo(nextRespondentNo);
  };

  const currentSection = sections[currentStepIdx] || {
    id: 1,
    name: 'Part I — SHS Strand',
    type: 'strand',
  };

  return {
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
  };
}
