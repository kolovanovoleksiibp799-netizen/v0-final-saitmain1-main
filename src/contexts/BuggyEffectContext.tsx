"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BuggyEffectContextType {
  isBuggyMode: boolean;
  toggleBuggyMode: () => void;
}

const BuggyEffectContext = createContext<BuggyEffectContextType | undefined>(undefined);

export const useBuggyEffect = () => {
  const context = useContext(BuggyEffectContext);
  if (context === undefined) {
    throw new Error('useBuggyEffect must be used within a BuggyEffectProvider');
  }
  return context;
};

export const BuggyEffectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBuggyMode, setIsBuggyMode] = useState(false);

  const toggleBuggyMode = () => {
    setIsBuggyMode(prev => !prev);
  };

  useEffect(() => {
    if (isBuggyMode) {
      document.body.classList.add('buggy-mode-active');
    } else {
      document.body.classList.remove('buggy-mode-active');
    }
  }, [isBuggyMode]);

  return (
    <BuggyEffectContext.Provider value={{ isBuggyMode, toggleBuggyMode }}>
      {children}
    </BuggyEffectContext.Provider>
  );
};