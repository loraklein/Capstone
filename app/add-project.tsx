import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
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
import { ProjectType } from '../types';

export default function AddProjectScreen() {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState<ProjectType | undefined>(undefined);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { theme } = useTheme();
  const { createProject } = useProjects();
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
    
    if (projectName.trim() || description.trim()) {
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
    if (!projectType) {
      Alert.alert('Project Type Required', 'Please select a project type before creating.');
      return;
    }

    try {
      setIsSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await createProject({
        name: projectName,
        description: description,
        projectType: projectType,
      });

      router.back();
    } catch (error) {
      console.log('Error saving project:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProjectNameSubmit = () => {
    descriptionInputRef.current?.focus();
  };

  const isValidForm = projectName.trim().length > 0 && projectType !== undefined;

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
        {Platform.OS === 'web' ? (
          <View style={styles.content}>
            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: theme.text }]}>Project Type *</Text>
              <Text style={[styles.helpText, { color: theme.textSecondary }]}>
                Choose the type of content you'll be scanning
              </Text>
              <View style={styles.typeRow}>
                {([
                  { value: 'journal' as const, label: 'Journal' },
                  { value: 'recipes' as const, label: 'Recipes' },
                  { value: 'letters' as const, label: 'Letters' },
                  { value: 'other' as const, label: 'Other' }
                ]).map((type) => (
                  <Pressable
                    key={type.value}
                    style={[
                      styles.typeCard,
                      {
                        backgroundColor: projectType === type.value ? theme.primary : theme.card,
                        borderColor: projectType === type.value ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => {
                      setProjectType(type.value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text
                      style={[
                        styles.typeCardLabel,
                        { color: projectType === type.value ? theme.primaryText : theme.text },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: theme.text }]}>Project Name *</Text>
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
                accessibilityLabel="Project name input field"
                accessibilityHint="Enter the name for your new project"
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
        ) : (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content} pointerEvents="box-none">
              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: theme.text }]}>Project Type *</Text>
                <Text style={[styles.helpText, { color: theme.textSecondary }]}>
                  Choose the type of content you'll be scanning
                </Text>
                <View style={styles.typeRow}>
                  {([
                    { value: 'journal' as const, label: 'Journal' },
                    { value: 'recipes' as const, label: 'Recipes' },
                    { value: 'letters' as const, label: 'Letters' },
                    { value: 'other' as const, label: 'Other' }
                  ]).map((type) => (
                    <Pressable
                      key={type.value}
                      style={[
                        styles.typeCard,
                        {
                          backgroundColor: projectType === type.value ? theme.primary : theme.card,
                          borderColor: projectType === type.value ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => {
                        setProjectType(type.value);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Text
                        style={[
                          styles.typeCardLabel,
                          { color: projectType === type.value ? theme.primaryText : theme.text },
                        ]}
                      >
                        {type.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: theme.text }]}>Project Name *</Text>
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
                  accessibilityLabel="Project name input field"
                  accessibilityHint="Enter the name for your new project"
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
        )}
      </ScrollView>

      <FormButtons
        onCancel={handleCancel}
        onSave={handleSave}
        isValidForm={isValidForm}
        isSaving={isSaving}
        saveButtonText={isSaving ? 'Creating...' : 'Create Project'}
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
  helpText: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  typeCardLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});