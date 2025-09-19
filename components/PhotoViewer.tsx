import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { usePhotoAnimation } from '../hooks/usePhotoAnimation';
import { usePhotoGestures } from '../hooks/usePhotoGestures';
import { usePhotoRotation } from '../hooks/usePhotoRotation';
import { CapturedPage } from '../types';
import { formatDate } from '../utils/dateUtils';

interface PhotoViewerProps {
  visible: boolean;
  page: CapturedPage | null;
  onClose: () => void;
  onRotate?: (pageId: string, rotation: number) => void;
}

const { width, height } = Dimensions.get('window');

export default function PhotoViewer({ visible, page, onClose, onRotate }: PhotoViewerProps) {
  const { theme } = useTheme();
  
  const { rotation, handleRotateLeft, handleRotateRight } = usePhotoRotation({ page, onRotate });
  
  const {
    backdropOpacity,
    scale,
    translateX,
    imageTranslateY,
    savedScale,
    savedTranslateX,
    savedImageTranslateY,
    backdropStyle,
    imageStyle,
  } = usePhotoAnimation({ visible, rotation, pageRotation: page?.rotation });

  const { imageGestures } = usePhotoGestures({
    scale,
    translateX,
    imageTranslateY,
    savedScale,
    savedTranslateX,
    savedImageTranslateY,
  });

  const closeModal = () => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    runOnJS(onClose)();
  };

  if (!page || !page.photoUri) {
    return null;
  }

  return (
    <Modal 
      visible={visible} 
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <GestureHandlerRootView style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.backdropPress} onPress={onClose} />
        </Animated.View>

        <View style={styles.modalContainer}>
          <View style={[styles.header, { backgroundColor: theme.card }]}>
            <View style={styles.headerLeft}>
              <Pressable 
                style={[styles.rotateButton, { backgroundColor: theme.overlay }]}
                onPress={handleRotateLeft}
                accessibilityLabel="Rotate left"
              >
                <MaterialIcons name="rotate-left" size={20} color={theme.text} />
              </Pressable>
              <Pressable 
                style={[styles.rotateButton, { backgroundColor: theme.overlay, marginLeft: 8 }]}
                onPress={handleRotateRight}
                accessibilityLabel="Rotate right"
              >
                <MaterialIcons name="rotate-right" size={20} color={theme.text} />
              </Pressable>
            </View>
            
            <Pressable 
              style={[styles.closeButton, { backgroundColor: theme.overlay }]}
              onPress={closeModal}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.photoContainer}>
            <GestureDetector gesture={imageGestures}>
              <Animated.View style={styles.imageWrapper}>
                <Animated.Image
                  source={{ uri: page.photoUri }}
                  style={[styles.photo, imageStyle]}
                  resizeMode="contain"
                />
              </Animated.View>
            </GestureDetector>
          </View>

          <View style={[styles.footer, { backgroundColor: theme.overlay }]}>
            <Text style={[styles.timestamp, { color: theme.text }]}>
              {formatDate(page.timestamp, 'time')}
            </Text>
            <Text style={[styles.instructions, { color: theme.textSecondary }]}>
              Double tap to zoom
            </Text>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backdropPress: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
  },
  rotateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  photo: {
    width: width,
    height: height * 0.8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
    alignItems: 'center',
    zIndex: 10,
  },
  timestamp: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
    color: 'white',
  },
  instructions: {
    fontSize: 12,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});