import { useEffect } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

interface UsePhotoAnimationProps {
  visible: boolean;
  rotation: Animated.SharedValue<number>;
  pageRotation?: number;
}

export function usePhotoAnimation({ visible, rotation, pageRotation }: UsePhotoAnimationProps) {
  const backdropOpacity = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const imageTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedImageTranslateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      rotation.value = pageRotation || 0; // Initialize with saved rotation
    } else {
      backdropOpacity.value = withTiming(0, { duration: 300 });
      scale.value = 1;
      translateX.value = 0;
      imageTranslateY.value = 0;
      savedScale.value = 1;
      savedTranslateX.value = 0;
      savedImageTranslateY.value = 0;
    }
  }, [visible, rotation, pageRotation]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: imageTranslateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return {
    backdropOpacity,
    scale,
    translateX,
    imageTranslateY,
    savedScale,
    savedTranslateX,
    savedImageTranslateY,
    backdropStyle,
    imageStyle,
  };
} 