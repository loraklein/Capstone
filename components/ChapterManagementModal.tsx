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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [chapterType, setChapterType] = useState<Chapter['chapter_type']>('entry');
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
      if (Platform.OS === 'web') {
        window.alert('Failed to load chapters');
      } else {
        Alert.alert('Error', 'Failed to load chapters');
      }
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
    setChapterType('entry');
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
    setChapterType('entry');
    setDescription('');
  };

  const handleSave = async () => {
    if (!title.trim() || !startPage.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Title and start page are required');
      } else {
        Alert.alert('Error', 'Title and start page are required');
      }
      return;
    }

    const startPageNum = parseInt(startPage);
    const endPageNum = endPage ? parseInt(endPage) : undefined;

    if (isNaN(startPageNum) || startPageNum < 1 || startPageNum > totalPages) {
      if (Platform.OS === 'web') {
        window.alert(`Start page must be between 1 and ${totalPages}`);
      } else {
        Alert.alert('Error', `Start page must be between 1 and ${totalPages}`);
      }
      return;
    }

    if (endPageNum !== undefined && (isNaN(endPageNum) || endPageNum < startPageNum || endPageNum > totalPages)) {
      if (Platform.OS === 'web') {
        window.alert(`End page must be between start page and ${totalPages}`);
      } else {
        Alert.alert('Error', `End page must be between start page and ${totalPages}`);
      }
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
      if (Platform.OS === 'web') {
        window.alert('Failed to save chapter');
      } else {
        Alert.alert('Error', 'Failed to save chapter');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (chapter: Chapter) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete "${chapter.title}"?`);
      if (!confirmed) return;

      try {
        setIsLoading(true);
        await apiService.deleteChapter(chapter.id);
        await loadChapters();
        onChaptersUpdated?.();
      } catch (error) {
        console.error('Error deleting chapter:', error);
        window.alert('Failed to delete chapter');
      } finally {
        setIsLoading(false);
      }
    } else {
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
    }
  };

  const handleGetSuggestions = async () => {
    try {
      setIsLoadingSuggestions(true);
      const data = await apiService.getSuggestedChapters(projectId);
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to get chapter suggestions');
      } else {
        Alert.alert('Error', 'Failed to get chapter suggestions');
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAcceptSuggestion = async (suggestion: any) => {
    try {
      setIsLoading(true);
      await apiService.createChapter(projectId, {
        title: suggestion.title,
        start_page_number: suggestion.start_page_number,
        end_page_number: suggestion.end_page_number,
        chapter_type: suggestion.chapter_type,
        description: suggestion.description,
      });
      await loadChapters();
      onChaptersUpdated?.();
      // Remove accepted suggestion from list
      setSuggestions(prev => prev.filter(s => s !== suggestion));
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to create chapter');
      } else {
        Alert.alert('Error', 'Failed to create chapter');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAllSuggestions = async () => {
    try {
      setIsLoading(true);
      for (const suggestion of suggestions) {
        await apiService.createChapter(projectId, {
          title: suggestion.title,
          start_page_number: suggestion.start_page_number,
          end_page_number: suggestion.end_page_number,
          chapter_type: suggestion.chapter_type,
          description: suggestion.description,
        });
      }
      await loadChapters();
      onChaptersUpdated?.();
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error accepting all suggestions:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to create chapters');
      } else {
        Alert.alert('Error', 'Failed to create chapters');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptReorganization = async () => {
    try {
      setIsLoading(true);
      await apiService.executeReorganization(projectId, suggestions);
      // Refresh pages and chapters after reorganization
      onChaptersUpdated?.();
      setShowSuggestions(false);
      setSuggestions([]);
      // Close modal and let parent refresh
      onDismiss();
    } catch (error) {
      console.error('Error executing reorganization:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to reorganize pages');
      } else {
        Alert.alert('Error', 'Failed to reorganize pages');
      }
    } finally {
      setIsLoading(false);
    }
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

  const renderSuggestion = (suggestion: any, index: number) => (
    <View
      key={index}
      style={[styles.suggestionItem, { backgroundColor: theme.background, borderColor: theme.primary }]}
    >
      <View style={styles.suggestionInfo}>
        <Text style={[styles.chapterTitle, { color: theme.text }]}>{suggestion.title}</Text>
        <Text style={[styles.chapterPages, { color: theme.textSecondary }]}>
          Pages {suggestion.start_page_number}
          {suggestion.end_page_number ? ` - ${suggestion.end_page_number}` : '+'}
          {' • '}
          {suggestion.chapter_type}
        </Text>
        {suggestion.description && (
          <Text style={[styles.chapterDescription, { color: theme.textTertiary }]}>
            {suggestion.description}
          </Text>
        )}
      </View>
      <Pressable
        style={[styles.acceptButton, { backgroundColor: theme.primary }]}
        onPress={() => handleAcceptSuggestion(suggestion)}
      >
        <Icon name="check" size={18} color="#fff" />
        <Text style={styles.acceptButtonText}>Accept</Text>
      </Pressable>
    </View>
  );

  const renderReorganization = () => {
    const reorg = suggestions as any; // has type: 'reorganization' and categories

    return (
      <View>
        <Text style={[styles.reorganizationTitle, { color: theme.text }]}>
          Proposed Reorganization
        </Text>
        <Text style={[styles.reorganizationSubtitle, { color: theme.textSecondary }]}>
          Pages will be reordered and organized into the following sections:
        </Text>

        {reorg.categories.map((category: any, catIndex: number) => (
          <View
            key={catIndex}
            style={[styles.categoryContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Text style={[styles.categoryTitle, { color: theme.primary }]}>
              {category.category} ({category.pages.length} {category.pages.length === 1 ? 'page' : 'pages'})
            </Text>
            {category.pages.map((page: any, pageIndex: number) => (
              <View
                key={pageIndex}
                style={[styles.pageRow, { borderColor: theme.border }]}
              >
                <Text style={[styles.pageTitle, { color: theme.text }]} numberOfLines={1}>
                  {page.title}
                </Text>
                <Text style={[styles.pageNumber, { color: theme.textTertiary }]}>
                  Page {page.current_page_number}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <Pressable
          style={[styles.reorganizeButton, { backgroundColor: theme.primary }]}
          onPress={handleAcceptReorganization}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="auto-awesome" size={20} color="#fff" />
              <Text style={styles.reorganizeButtonText}>Accept Reorganization</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[styles.dismissButton, { backgroundColor: theme.secondary }]}
          onPress={() => {
            setShowSuggestions(false);
            setSuggestions([]);
          }}
        >
          <Text style={[styles.dismissButtonText, { color: theme.text }]}>
            Dismiss
          </Text>
        </Pressable>
      </View>
    );
  };

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
        {(['entry', 'letter', 'recipe', 'chapter', 'section'] as const).map((type) => (
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
              <>
                {/* AI Suggestions Button */}
                {chapters.length === 0 && !showSuggestions && (
                  <Pressable
                    style={[styles.suggestButton, { backgroundColor: theme.secondary, borderColor: theme.primary }]}
                    onPress={handleGetSuggestions}
                    disabled={isLoadingSuggestions}
                  >
                    {isLoadingSuggestions ? (
                      <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                      <>
                        <Icon name="auto-awesome" size={20} color={theme.primary} />
                        <Text style={[styles.suggestButtonText, { color: theme.primary }]}>
                          Suggest Sections with AI
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}

                {/* Suggestions List or Reorganization Preview */}
                {showSuggestions && ((suggestions as any).type === 'reorganization' ? (suggestions as any).categories?.length > 0 : suggestions.length > 0) && (
                  <View style={styles.suggestionsContainer}>
                    {(suggestions as any).type === 'reorganization' ? (
                      renderReorganization()
                    ) : (
                      <>
                        <View style={styles.suggestionsHeader}>
                          <Text style={[styles.suggestionsTitle, { color: theme.text }]}>
                            Suggested Sections
                          </Text>
                          <Pressable
                            style={[styles.acceptAllButton, { backgroundColor: theme.primary }]}
                            onPress={handleAcceptAllSuggestions}
                          >
                            <Text style={styles.acceptAllButtonText}>Accept All</Text>
                          </Pressable>
                        </View>
                        {suggestions.map(renderSuggestion)}
                        <Pressable
                          style={[styles.dismissButton, { backgroundColor: theme.secondary }]}
                          onPress={() => {
                            setShowSuggestions(false);
                            setSuggestions([]);
                          }}
                        >
                          <Text style={[styles.dismissButtonText, { color: theme.text }]}>
                            Dismiss Suggestions
                          </Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                )}

                {/* Manual Add Button */}
                <Pressable
                  style={[styles.addButton, { backgroundColor: showSuggestions ? theme.secondary : theme.primary }]}
                  onPress={handleStartCreate}
                >
                  <Icon name="add" size={20} color={showSuggestions ? theme.text : theme.primaryText} />
                  <Text style={[styles.addButtonText, { color: showSuggestions ? theme.text : theme.primaryText }]}>
                    Add Section Manually
                  </Text>
                </Pressable>
              </>
            )}

            {isLoading && chapters.length === 0 ? (
              <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
            ) : chapters.length === 0 && !showSuggestions ? (
              <View style={styles.emptyState}>
                <Icon name="bookmark-border" size={48} color={theme.textTertiary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No sections yet. Get AI suggestions or add one manually!
                </Text>
              </View>
            ) : chapters.length > 0 ? (
              <View style={styles.chapterList}>
                {chapters.map(renderChapterItem)}
              </View>
            ) : null}
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
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 2,
  },
  suggestButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  acceptAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  acceptAllButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 10,
    gap: 12,
  },
  suggestionInfo: {
    flex: 1,
    gap: 4,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  dismissButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reorganizationTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  reorganizationSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  categoryContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  pageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    marginTop: 4,
  },
  pageTitle: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  pageNumber: {
    fontSize: 12,
    fontWeight: '500',
  },
  reorganizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 16,
  },
  reorganizeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
