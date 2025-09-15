import React from 'react';
import { Loader2 } from 'lucide-react';
import { useBuggyEffect } from "@/contexts/BuggyEffectContext"; // Import useBuggyEffect

const LoadingSpinner = () => {
  const { isBuggyMode } = useBuggyEffect(); // Use buggy effect context

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className={`h-10 w-10 animate-spin text-accent ${isBuggyMode ? 'animate-spin-slow text-red-500' : ''}`} />
    </div>
  );
};

export default LoadingSpinner;