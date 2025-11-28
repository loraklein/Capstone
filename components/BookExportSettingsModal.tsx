import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';
import BookPreviewModal from './BookPreviewModal';

interface BookExportSettingsModalProps {
  visible: boolean;
  projectId: string;
  projectName: string;
  projectDescription?: string;
  onExport: (settings: BookSettings) => void;
  onDismiss: () => void;
}

export interface BookSettings {
  projectId: string;
  bookSize: '6x9' | '8x11' | '5.5x8.5';
  title: string;
  subtitle: string;
  author: string;
  fontFamily: 'serif' | 'sans-serif';
  fontSize: number;
  includeBackCover: boolean;
  coverTemplate: 'simple' | 'elegant' | 'modern';
  addPageBreaks: boolean;
  includeTableOfContents: boolean;
  includeImages: boolean;
}

const BOOK_SIZES = [
  { value: '6x9' as const, label: '6" x 9"', description: 'Standard novel' },
  { value: '8x11' as const, label: '8.5" x 11"', description: 'Large format' },
  { value: '5.5x8.5' as const, label: '5.5" x 8.5"', description: 'Digest size' },
];

export default function BookExportSettingsModal({
  visible,
  projectId,
  projectName,
  projectDescription = '',
  onExport,
  onDismiss,
}: BookExportSettingsModalProps) {
  const { theme } = useTheme();
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState<BookSettings>({
    projectId,
    bookSize: '6x9',
    title: projectName,
    subtitle: projectDescription,
    author: '',
    fontFamily: 'serif',
    fontSize: 11,
    includeBackCover: true,
    coverTemplate: 'simple',
    addPageBreaks: true,
    includeTableOfContents: true,
    includeImages: true,
  });

  const updateSetting = <K extends keyof BookSettings>(
    key: K,
    value: BookSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    onExport(settings);
  };

  return (
    <>
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon name="menu-book" size={24} color={theme.primary} />
              <Text style={[styles.title, { color: theme.text }]}>Create Printable Book</Text>
            </View>
            <Pressable onPress={onDismiss} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Book Size */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Book Size</Text>
              <View style={styles.sizeOptions}>
                {BOOK_SIZES.map((size) => (
                  <Pressable
                    key={size.value}
                    style={[
                      styles.sizeOption,
                      {
                        backgroundColor: settings.bookSize === size.value ? theme.primary : theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => updateSetting('bookSize', size.value)}
                  >
                    <Text
                      style={[
                        styles.sizeLabel,
                        {
                          color: settings.bookSize === size.value ? theme.primaryText : theme.text,
                        },
                      ]}
                    >
                      {size.label}
                    </Text>
                    <Text
                      style={[
                        styles.sizeDescription,
                        {
                          color: settings.bookSize === size.value ? theme.primaryText : theme.textSecondary,
                          opacity: settings.bookSize === size.value ? 0.9 : 1,
                        },
                      ]}
                    >
                      {size.description}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Book Details */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Book Details</Text>

              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Book Title"
                placeholderTextColor={theme.textTertiary}
                value={settings.title}
                onChangeText={(value) => updateSetting('title', value)}
              />

              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Subtitle (optional)"
                placeholderTextColor={theme.textTertiary}
                value={settings.subtitle}
                onChangeText={(value) => updateSetting('subtitle', value)}
              />

              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Author Name (optional)"
                placeholderTextColor={theme.textTertiary}
                value={settings.author}
                onChangeText={(value) => updateSetting('author', value)}
              />
            </View>

            {/* Font Settings */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Font Family</Text>
              <View style={styles.fontRow}>
                {(['serif', 'sans-serif'] as const).map((font) => (
                  <Pressable
                    key={font}
                    style={[
                      styles.fontButton,
                      {
                        backgroundColor: settings.fontFamily === font ? theme.primary : theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => updateSetting('fontFamily', font)}
                  >
                    <Text
                      style={[
                        styles.fontButtonText,
                        {
                          color: settings.fontFamily === font ? theme.primaryText : theme.text,
                          fontFamily: font,
                        },
                      ]}
                    >
                      {font === 'serif' ? 'Serif' : 'Sans Serif'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Font Size */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Text Size</Text>
              <View style={styles.fontRow}>
                {[10, 11, 12].map((size) => (
                  <Pressable
                    key={size}
                    style={[
                      styles.sizeButton,
                      {
                        backgroundColor: settings.fontSize === size ? theme.primary : theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => updateSetting('fontSize', size)}
                  >
                    <Text
                      style={[
                        styles.fontButtonText,
                        {
                          color: settings.fontSize === size ? theme.primaryText : theme.text,
                        },
                      ]}
                    >
                      {size}pt
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Cover Template */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Cover Style</Text>
              <View style={styles.templateRow}>
                {(['simple', 'elegant', 'modern'] as const).map((template) => (
                  <Pressable
                    key={template}
                    style={[
                      styles.templateButton,
                      {
                        backgroundColor: settings.coverTemplate === template ? theme.primary : theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => updateSetting('coverTemplate', template)}
                  >
                    <Text
                      style={[
                        styles.templateButtonText,
                        {
                          color: settings.coverTemplate === template ? theme.primaryText : theme.text,
                        },
                      ]}
                    >
                      {template.charAt(0).toUpperCase() + template.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Back Cover */}
            <View style={styles.section}>
              <Pressable
                style={[styles.toggleRow, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => updateSetting('includeBackCover', !settings.includeBackCover)}
              >
                <View style={styles.toggleLeft}>
                  <Text style={[styles.toggleLabel, { color: theme.text }]}>Include Back Cover</Text>
                  <Text style={[styles.toggleDescription, { color: theme.textSecondary }]}>
                    Add a back cover page with title and description
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: settings.includeBackCover ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      {
                        backgroundColor: theme.surface,
                        transform: [{ translateX: settings.includeBackCover ? 20 : 0 }],
                      },
                    ]}
                  />
                </View>
              </Pressable>

              {/* Page Breaks before Sections */}
              <Pressable
                style={[styles.toggleRow, { backgroundColor: theme.background, borderColor: theme.border, marginTop: 12 }]}
                onPress={() => updateSetting('addPageBreaks', !settings.addPageBreaks)}
              >
                <View style={styles.toggleLeft}>
                  <Text style={[styles.toggleLabel, { color: theme.text }]}>Add page breaks before sections</Text>
                  <Text style={[styles.toggleDescription, { color: theme.textSecondary }]}>
                    Start each chapter/section on a new page
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: settings.addPageBreaks ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      {
                        backgroundColor: theme.surface,
                        transform: [{ translateX: settings.addPageBreaks ? 20 : 0 }],
                      },
                    ]}
                  />
                </View>
              </Pressable>

              {/* Table of Contents */}
              <Pressable
                style={[styles.toggleRow, { backgroundColor: theme.background, borderColor: theme.border, marginTop: 12 }]}
                onPress={() => updateSetting('includeTableOfContents', !settings.includeTableOfContents)}
              >
                <View style={styles.toggleLeft}>
                  <Text style={[styles.toggleLabel, { color: theme.text }]}>Include table of contents</Text>
                  <Text style={[styles.toggleDescription, { color: theme.textSecondary }]}>
                    Add a TOC listing all sections with page numbers
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: settings.includeTableOfContents ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      {
                        backgroundColor: theme.surface,
                        transform: [{ translateX: settings.includeTableOfContents ? 20 : 0 }],
                      },
                    ]}
                  />
                </View>
              </Pressable>

              {/* Include Images */}
              <Pressable
                style={[styles.toggleRow, { backgroundColor: theme.background, borderColor: theme.border, marginTop: 12 }]}
                onPress={() => updateSetting('includeImages', !settings.includeImages)}
              >
                <View style={styles.toggleLeft}>
                  <Text style={[styles.toggleLabel, { color: theme.text }]}>Include images</Text>
                  <Text style={[styles.toggleDescription, { color: theme.textSecondary }]}>
                    Include scanned page images alongside text
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: settings.includeImages ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      {
                        backgroundColor: theme.surface,
                        transform: [{ translateX: settings.includeImages ? 20 : 0 }],
                      },
                    ]}
                  />
                </View>
              </Pressable>
            </View>

            {/* Info Box */}
            <View style={[styles.infoBox, { backgroundColor: theme.secondary, borderColor: theme.border }]}>
              <Icon name="info" size={20} color={theme.primary} />
              <Text style={[styles.infoText, { color: theme.text }]}>
                Your book will include a front cover, all your pages of extracted and professionally formatted text, and page numbers. Perfect for uploading to print-on-demand services.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.footer, { borderTopColor: theme.divider }]}>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.previewButton, { backgroundColor: 'transparent', borderColor: theme.primary }]}
                onPress={() => setShowPreview(true)}
              >
                <Icon name="visibility" size={20} color={theme.primary} />
                <Text style={[styles.previewButtonText, { color: theme.primary }]}>
                  Preview Book
                </Text>
              </Pressable>

              <Pressable
                style={[styles.exportButton, { backgroundColor: theme.primary }]}
                onPress={handleExport}
              >
                <Icon name="menu-book" size={20} color={theme.primaryText} />
                <Text style={[styles.exportButtonText, { color: theme.primaryText }]}>
                  Create Book
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>

    {/* Book Preview Modal */}
    <BookPreviewModal
      visible={showPreview}
      projectName={projectName}
      projectDescription={projectDescription}
      bookSettings={settings}
      onDismiss={() => setShowPreview(false)}
      onExport={() => {
        setShowPreview(false);
        handleExport();
      }}
    />
    </>
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
    maxHeight: 500,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sizeOptions: {
    gap: 12,
  },
  sizeOption: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sizeDescription: {
    fontSize: 13,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 12,
  },
  fontRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fontButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  fontButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  templateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  templateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  templateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  toggleLeft: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 2,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
