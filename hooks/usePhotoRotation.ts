import * as Haptics from 'expo-haptics';
import { useSharedValue } from 'react-native-reanimated';
import { CapturedPage } from '../types';

interface UsePhotoRotationProps {
  page: CapturedPage | null;
  onRotate?: (pageId: string, rotation: number) => void;
}

export function usePhotoRotation({ page, onRotate }: UsePhotoRotationProps) {
  const rotation = useSharedValue(page?.rotation || 0);

  const handleRotateLeft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    let newRotation = (rotation.value - 90) % 360;
    if (newRotation < 0) newRotation += 360;
    
    if (page && onRotate) {
      onRotate(page.id, newRotation);
    }
    
    rotation.value = newRotation;
  };

  const handleRotateRight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newRotation = (rotation.value + 90) % 360;
    
    if (page && onRotate) {
      onRotate(page.id, newRotation);
    }
    
    // Direct value update - no animation to avoid conflicts
    rotation.value = newRotation;
  };

  return {
    rotation,
    handleRotateLeft,
    handleRotateRight,
  };
} 