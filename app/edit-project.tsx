import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import ConfirmationDialog from '../components/ConfirmationDialog';
import FormButtons from '../components/FormButtons';
import { useTheme } from '../contexts/ThemeContext';
import { useProjects } from '../hooks/useProjects';

export default function EditProjectScreen() {
  const params = useLocalSearchParams();
  const [projectName, setProjectName] = useState(params.name as string || '');
  const [description, setDescription] = useState(params.description as string || '');
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { theme } = useTheme();
  const { updateProject } = useProjects();
  const projectId = params.id as string;
  const descriptionInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (projectName.trim() !== (params.name as string || '').trim() || 
        description.trim() !== (params.description as string || '').trim()) {
      setShowDiscardDialog(true);
    } else {
      router.back();
    }
  };

  const handleDiscardConfirm = () => {
    setShowDiscardDialog(false);
    router.back();
  };

  const handleDiscardCancel = () => {
    setShowDiscardDialog(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await updateProject(projectId, {
        name: projectName,
        description: description,
      });
      
      router.back();
    } catch (error) {
      console.log('Error updating project:', error);
      Alert.alert('Error', 'Failed to update project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProjectNameSubmit = () => {
    descriptionInputRef.current?.focus();
  };

  const isValidForm = projectName.trim().length > 0;

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: theme.text }]}>Project Name</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                value={projectName}
                onChangeText={setProjectName}
                placeholder="Enter a name for your project"
                placeholderTextColor={theme.textTertiary}
                maxLength={50}
                returnKeyType="next"
                onSubmitEditing={handleProjectNameSubmit}
                autoFocus={true}
                accessibilityLabel="Project name input field"
                accessibilityHint="Enter the name for your project"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: theme.text }]}>Description (Optional)</Text>
              <TextInput
                ref={descriptionInputRef}
                style={[styles.textInput, styles.textArea, { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add a description for your project"
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={200}
                accessibilityLabel="Project description input field"
                accessibilityHint="Enter an optional description for your project"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      <FormButtons
        onCancel={handleCancel}
        onSave={handleSave}
        isValidForm={isValidForm}
        isSaving={isSaving}
        saveButtonText={isSaving ? 'Saving...' : 'Save Changes'}
        isKeyboardVisible={isKeyboardVisible}
      />

      <ConfirmationDialog
        visible={showDiscardDialog}
        onConfirm={handleDiscardConfirm}
        onCancel={handleDiscardCancel}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to cancel?"
        confirmText="Discard"
        cancelText="Keep Editing"
        confirmStyle="destructive"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },

}); 