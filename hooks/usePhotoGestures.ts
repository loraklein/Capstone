import { Dimensions } from 'react-native';
import {
    Gesture,
} from 'react-native-gesture-handler';
import Animated, {
    withSpring,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface UsePhotoGesturesProps {
  scale: Animated.SharedValue<number>;
  translateX: Animated.SharedValue<number>;
  imageTranslateY: Animated.SharedValue<number>;
  savedScale: Animated.SharedValue<number>;
  savedTranslateX: Animated.SharedValue<number>;
  savedImageTranslateY: Animated.SharedValue<number>;
}

export function usePhotoGestures({
  scale,
  translateX,
  imageTranslateY,
  savedScale,
  savedTranslateX,
  savedImageTranslateY,
}: UsePhotoGesturesProps) {
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(0.5, Math.min(4, savedScale.value * event.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        imageTranslateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedImageTranslateY.value = 0;
      }
    });

  const imagePanGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        const maxTranslateX = (width * (scale.value - 1)) / 4;
        const maxTranslateY = (height * (scale.value - 1)) / 4;
        
        translateX.value = Math.max(
          -maxTranslateX,
          Math.min(maxTranslateX, savedTranslateX.value + event.translationX)
        );
        imageTranslateY.value = Math.max(
          -maxTranslateY,
          Math.min(maxTranslateY, savedImageTranslateY.value + event.translationY)
        );
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedImageTranslateY.value = imageTranslateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        // Zoom out
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        imageTranslateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedImageTranslateY.value = 0;
      } else {
        // Zoom in
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  const imageGestures = Gesture.Simultaneous(
    pinchGesture,
    imagePanGesture,
    doubleTapGesture
  );

  return {
    imageGestures,
  };
} 