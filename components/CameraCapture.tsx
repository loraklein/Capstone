import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface CameraCaptureProps {
  visible: boolean;
  onCapture: (uri: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ visible, onCapture, onClose }: CameraCaptureProps) {
  const { theme } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing || isResetting) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      onCapture(photo.uri);
    } catch (error) {
      console.error('Camera capture error:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleClose = () => {
    setIsCameraReady(false);
    setIsCapturing(false);
    setIsResetting(false);
    onClose();
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.permissionContainer}>
            <Text style={[styles.permissionTitle, { color: theme.text }]}>
              Camera Permission Required
            </Text>
            <Text style={[styles.permissionText, { color: theme.textSecondary }]}>
              Please allow camera access to capture document pages.
            </Text>
            <Pressable
              style={[styles.permissionButton, { backgroundColor: theme.primary }]}
              onPress={requestPermission}
            >
              <Text style={[styles.permissionButtonText, { color: theme.primaryText }]}>
                Grant Permission
              </Text>
            </Pressable>
            <Pressable
              style={[styles.permissionButton, { backgroundColor: theme.card, marginTop: 10 }]}
              onPress={handleClose}
            >
              <Text style={[styles.permissionButtonText, { color: theme.text }]}>
                Go Back
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={handleCameraReady}
        />
        
        <View style={styles.controls}>
          <View style={styles.header}>
            <Pressable
              style={[styles.closeButton, { backgroundColor: theme.overlay }]}
              onPress={handleClose}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Pressable
              style={[
                styles.captureButton,
                { backgroundColor: theme.primary },
                (!isCameraReady || isCapturing || isResetting) && styles.captureButtonDisabled
              ]}
              onPress={handleCapture}
              disabled={!isCameraReady || isCapturing || isResetting}
            >
              <View style={[styles.captureButtonInner, { borderColor: theme.border }]} />
            </Pressable>
            
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              {!isCameraReady ? 'Camera initializing...' : 
               isCapturing ? 'Capturing...' :
               isResetting ? 'Camera resetting...' : 'Tap to capture'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 24,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  footerText: {
    fontSize: 16,
    marginTop: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 3,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  permissionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 