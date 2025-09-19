import { useState } from 'react';

export function useReorderMode() {
  const [isReorderMode, setIsReorderMode] = useState(false);

  const handleToggleReorderMode = () => {
    setIsReorderMode(!isReorderMode);
  };

  return {
    isReorderMode,
    handleToggleReorderMode,
  };
} 