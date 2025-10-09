import React, { createContext, useContext, useState, useEffect } from "react";

type AccessibilityMode = "visual" | "hearing" | "motor" | "cognitive";

interface AccessibilityContextType {
  modes: AccessibilityMode[];
  setModes: (modes: AccessibilityMode[]) => void;
  hasMode: (mode: AccessibilityMode) => boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modes, setModesState] = useState<AccessibilityMode[]>(() => {
    const saved = localStorage.getItem('accessibility-modes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('accessibility-modes', JSON.stringify(modes));
    
    // Apply accessibility classes to body
    document.body.classList.remove('mode-visual', 'mode-hearing', 'mode-motor', 'mode-cognitive');
    modes.forEach(mode => {
      document.body.classList.add(`mode-${mode}`);
    });
  }, [modes]);

  const setModes = (newModes: AccessibilityMode[]) => {
    setModesState(newModes);
  };

  const hasMode = (mode: AccessibilityMode) => modes.includes(mode);

  return (
    <AccessibilityContext.Provider value={{ modes, setModes, hasMode }}>
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
