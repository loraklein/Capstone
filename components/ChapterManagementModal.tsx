import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';
import { apiService } from '../utils/apiService';
import { Chapter } from '../types';

interface ChapterManagementModalProps {
  visible: boolean;
  projectId: string;
  totalPages: number;
  onDismiss: () => void;
  onChaptersUpdated?: () => void;
}

export default function ChapterManagementModal({
  visible,
  projectId,
  totalPages,
  onDismiss,
  onChaptersUpdated,
}: ChapterManagementModalProps) {
  const { theme } = useTheme();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [chapterType, setChapterType] = useState<Chapter['chapter_type']>('chapter');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (visible) {
      loadChapters();
    }
  }, [visible, projectId]);

  const loadChapters = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getProjectChapters(projectId);
      setChapters(data);
    } catch (error) {
      console.error('Error loading chapters:', error);
      Alert.alert('Error', 'Failed to load chapters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingChapter(null);
    setTitle('');
    setStartPage('');
    setEndPage('');
    setChapterType('chapter');
    setDescription('');
  };

  const handleStartEdit = (chapter: Chapter) => {
    setIsCreating(false);
    setEditingChapter(chapter);
    setTitle(chapter.title);
    setStartPage(chapter.start_page_number.toString());
    setEndPage(chapter.end_page_number?.toString() || '');
    setChapterType(chapter.chapter_type);
    setDescription(chapter.description || '');
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingChapter(null);
    setTitle('');
    setStartPage('');
    setEndPage('');
    setChapterType('chapter');
    setDescription('');
  };

  const handleSave = async () => {
    if (!title.trim() || !startPage.trim()) {
      Alert.alert('Error', 'Title and start page are required');
      return;
    }

    const startPageNum = parseInt(startPage);
    const endPageNum = endPage ? parseInt(endPage) : undefined;

    if (isNaN(startPageNum) || startPageNum < 1 || startPageNum > totalPages) {
      Alert.alert('Error', `Start page must be between 1 and ${totalPages}`);
      return;
    }

    if (endPageNum !== undefined && (isNaN(endPageNum) || endPageNum < startPageNum || endPageNum > totalPages)) {
      Alert.alert('Error', `End page must be between start page and ${totalPages}`);
      return;
    }

    try {
      setIsLoading(true);

      if (editingChapter) {
        // Update existing chapter
        await apiService.updateChapter(editingChapter.id, {
          title: title.trim(),
          start_page_number: startPageNum,
          end_page_number: endPageNum,
          chapter_type: chapterType,
          description: description.trim() || undefined,
        });
      } else {
        // Create new chapter
        await apiService.createChapter(projectId, {
          title: title.trim(),
          start_page_number: startPageNum,
          end_page_number: endPageNum,
          chapter_type: chapterType,
          description: description.trim() || undefined,
        });
      }

      handleCancelEdit();
      await loadChapters();
      onChaptersUpdated?.();
    } catch (error) {
      console.error('Error saving chapter:', error);
      Alert.alert('Error', 'Failed to save chapter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (chapter: Chapter) => {
    Alert.alert(
      'Delete Section',
      `Are you sure you want to delete "${chapter.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await apiService.deleteChapter(chapter.id);
              await loadChapters();
              onChaptersUpdated?.();
            } catch (error) {
              console.error('Error deleting chapter:', error);
              Alert.alert('Error', 'Failed to delete chapter');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderChapterItem = (chapter: Chapter) => (
    <View
      key={chapter.id}
      style={[styles.chapterItem, { backgroundColor: theme.background, borderColor: theme.border }]}
    >
      <View style={styles.chapterInfo}>
        <Text style={[styles.chapterTitle, { color: theme.text }]}>{chapter.title}</Text>
        <Text style={[styles.chapterPages, { color: theme.textSecondary }]}>
          Pages {chapter.start_page_number}
          {chapter.end_page_number ? ` - ${chapter.end_page_number}` : '+'}
          {' • '}
          {chapter.chapter_type}
        </Text>
        {chapter.description && (
          <Text style={[styles.chapterDescription, { color: theme.textTertiary }]} numberOfLines={2}>
            {chapter.description}
          </Text>
        )}
      </View>
      <View style={styles.chapterActions}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.secondary }]}
          onPress={() => handleStartEdit(chapter)}
        >
          <Icon name="edit" size={18} color={theme.text} />
        </Pressable>
        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.error || '#ff4444' }]}
          onPress={() => handleDelete(chapter)}
        >
          <Icon name="delete" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );

  const renderEditor = () => (
    <View style={[styles.editorContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.editorTitle, { color: theme.text }]}>
        {editingChapter ? 'Edit Section' : 'New Section'}
      </Text>

      <TextInput
        style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
        placeholder="Section Title"
        placeholderTextColor={theme.textTertiary}
        value={title}
        onChangeText={setTitle}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.inputSmall, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
          placeholder="Start Page"
          placeholderTextColor={theme.textTertiary}
          value={startPage}
          onChangeText={setStartPage}
          keyboardType="number-pad"
        />
        <TextInput
          style={[styles.inputSmall, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
          placeholder="End Page (optional)"
          placeholderTextColor={theme.textTertiary}
          value={endPage}
          onChangeText={setEndPage}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.typeRow}>
        {(['chapter', 'section', 'letter', 'recipe', 'entry'] as const).map((type) => (
          <Pressable
            key={type}
            style={[
              styles.typeButton,
              {
                backgroundColor: chapterType === type ? theme.primary : theme.background,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setChapterType(type)}
          >
            <Text
              style={[
                styles.typeButtonText,
                { color: chapterType === type ? theme.primaryText : theme.text },
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={[styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
        placeholder="Description (optional)"
        placeholderTextColor={theme.textTertiary}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <View style={styles.editorActions}>
        <Pressable
          style={[styles.button, styles.cancelButton, { backgroundColor: theme.secondary }]}
          onPress={handleCancelEdit}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.primaryText} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.primaryText }]}>Save</Text>
          )}
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon name="bookmark" size={24} color={theme.primary} />
              <Text style={[styles.title, { color: theme.text }]}>Organize Pages</Text>
            </View>
            <Pressable onPress={onDismiss} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {(isCreating || editingChapter) && renderEditor()}

            {!isCreating && !editingChapter && (
              <Pressable
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                onPress={handleStartCreate}
              >
                <Icon name="add" size={20} color={theme.primaryText} />
                <Text style={[styles.addButtonText, { color: theme.primaryText }]}>Add Section</Text>
              </Pressable>
            )}

            {isLoading && chapters.length === 0 ? (
              <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
            ) : chapters.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="bookmark-border" size={48} color={theme.textTertiary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No sections yet. Add one to organize your pages!
                </Text>
              </View>
            ) : (
              <View style={styles.chapterList}>
                {chapters.map(renderChapterItem)}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 600,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chapterList: {
    gap: 12,
  },
  chapterItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  chapterInfo: {
    flex: 1,
    gap: 4,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chapterPages: {
    fontSize: 13,
  },
  chapterDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  chapterActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputSmall: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  textArea: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editorActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {},
  saveButton: {},
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 250,
  },
});
