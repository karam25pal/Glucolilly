import React, { createContext, useContext, useState, useEffect } from "react";

type AccessibilityMode = "visual" | "hearing" | "motor" | "cognitive";

interface AccessibilityContextType {
  modes: AccessibilityMode[];
  setModes: (modes: AccessibilityMode[]) => void;
  hasMode: (mode: AccessibilityMode) => boolean;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  voiceControl: boolean;
  setVoiceControl: (value: boolean) => void;
  screenReader: boolean;
  setScreenReader: (value: boolean) => void;
  fontSize: number;
  setFontSize: (value: number) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modes, setModesState] = useState<AccessibilityMode[]>(() => {
    const saved = localStorage.getItem('accessibility-modes');
    return saved ? JSON.parse(saved) : [];
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const saved = localStorage.getItem('high-contrast');
    return saved ? JSON.parse(saved) : false;
  });

  const [voiceControl, setVoiceControl] = useState<boolean>(() => {
    const saved = localStorage.getItem('voice-control');
    return saved ? JSON.parse(saved) : false;
  });

  const [screenReader, setScreenReader] = useState<boolean>(() => {
    const saved = localStorage.getItem('screen-reader');
    return saved ? JSON.parse(saved) : false;
  });

  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('font-size');
    return saved ? parseFloat(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem('accessibility-modes', JSON.stringify(modes));
    
    // Apply accessibility classes to body
    document.body.classList.remove('mode-visual', 'mode-hearing', 'mode-motor', 'mode-cognitive');
    modes.forEach(mode => {
      document.body.classList.add(`mode-${mode}`);
    });
  }, [modes]);

  useEffect(() => {
    localStorage.setItem('high-contrast', JSON.stringify(highContrast));
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('voice-control', JSON.stringify(voiceControl));
  }, [voiceControl]);

  useEffect(() => {
    localStorage.setItem('screen-reader', JSON.stringify(screenReader));
  }, [screenReader]);

  useEffect(() => {
    localStorage.setItem('font-size', fontSize.toString());
    document.documentElement.style.fontSize = `${fontSize}rem`;
  }, [fontSize]);

  const setModes = (newModes: AccessibilityMode[]) => {
    setModesState(newModes);
  };

  const hasMode = (mode: AccessibilityMode) => modes.includes(mode);

  return (
    <AccessibilityContext.Provider value={{ 
      modes, 
      setModes, 
      hasMode,
      highContrast,
      setHighContrast,
      voiceControl,
      setVoiceControl,
      screenReader,
      setScreenReader,
      fontSize,
      setFontSize,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
