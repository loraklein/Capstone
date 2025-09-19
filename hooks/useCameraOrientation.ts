import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';

export function useCameraOrientation(showCamera: boolean) {
  useEffect(() => {
    const handleOrientation = async () => {
      try {
        if (showCamera) {
          // Try to lock to portrait, but don't fail if it's not supported
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        } else {
          await ScreenOrientation.unlockAsync();
        }
      } catch (error) {
        // If orientation lock fails, just log it and continue
        console.warn('Orientation lock not supported on this device:', error);
      }
    };

    handleOrientation();
  }, [showCamera]);
} 