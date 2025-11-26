import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface CustomPdfSettingsModalProps {
  visible: boolean;
  onExport: (settings: PdfSettings) => void;
  onDismiss: () => void;
}

export interface PdfSettings {
  fontFamily: 'serif' | 'sans-serif' | 'monospace';
  fontSize: number;
  lineSpacing: number;
  pageSize: 'letter' | 'a4';
}

const DEFAULT_SETTINGS: PdfSettings = {
  fontFamily: 'serif',
  fontSize: 12,
  lineSpacing: 1.5,
  pageSize: 'letter',
};

export default function CustomPdfSettingsModal({
  visible,
  onExport,
  onDismiss,
}: CustomPdfSettingsModalProps) {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<PdfSettings>(DEFAULT_SETTINGS);

  const updateSetting = <K extends keyof PdfSettings>(
    key: K,
    value: PdfSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleExport = () => {
    onExport(settings);
  };

  return (
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
            <Text style={[styles.title, { color: theme.text }]}>Customize PDF</Text>
            <Pressable onPress={onDismiss} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Font Family */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Font Family</Text>
              <View style={styles.optionsRow}>
                {(['serif', 'sans-serif', 'monospace'] as const).map((font) => (
                  <Pressable
                    key={font}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: settings.fontFamily === font ? theme.primary : theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => updateSetting('fontFamily', font)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: settings.fontFamily === font ? theme.primaryText : theme.text,
                          fontFamily: font,
                        },
                      ]}
                    >
                      {font === 'serif' ? 'Serif' : font === 'sans-serif' ? 'Sans Serif' : 'Mono'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Font Size */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Font Size</Text>
              <View style={styles.optionsRow}>
                {[10, 12, 14, 16, 18].map((size) => (
                  <Pressable
                    key={size}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: settings.fontSize === size ? theme.primary : theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => updateSetting('fontSize', size)}
                  >
                    <Text
                      style={[
                        styles.optionText,
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

            {/* Line Spacing */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Line Spacing</Text>
              <View style={styles.optionsRow}>
                {[1.0, 1.5, 2.0].map((spacing) => (
                  <Pressable
                    key={spacing}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: settings.lineSpacing === spacing ? theme.primary : theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => updateSetting('lineSpacing', spacing)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: settings.lineSpacing === spacing ? theme.primaryText : theme.text,
                        },
                      ]}
                    >
                      {spacing}x
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Page Size */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Page Size</Text>
              <View style={styles.optionsRow}>
                {(['letter', 'a4'] as const).map((size) => (
                  <Pressable
                    key={size}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: settings.pageSize === size ? theme.primary : theme.background,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => updateSetting('pageSize', size)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: settings.pageSize === size ? theme.primaryText : theme.text,
                        },
                      ]}
                    >
                      {size === 'letter' ? 'Letter' : 'A4'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Export Button */}
          <View style={styles.footer}>
            <Pressable
              style={[styles.exportButton, { backgroundColor: theme.primary }]}
              onPress={handleExport}
            >
              <Icon name="file-download" size={20} color={theme.primaryText} />
              <Text style={[styles.exportButtonText, { color: theme.primaryText }]}>
                Export PDF
              </Text>
            </Pressable>
          </View>
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  exportButton: {
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
