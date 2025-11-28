import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable, ScrollView, Platform, Linking } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface PrintGuidanceModalProps {
  visible: boolean;
  onClose: () => void;
  exportType: 'pdf' | 'book' | 'custom';
}

export default function PrintGuidanceModal({ visible, onClose, exportType }: PrintGuidanceModalProps) {
  const { theme } = useTheme();

  const handleOpenLink = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const printServices = [
    {
      name: 'Lulu',
      description: 'Professional print-on-demand with global distribution',
      url: 'https://www.lulu.com',
      icon: 'local-printshop',
      features: ['Hardcover & paperback', 'ISBN assignment', 'Retail distribution']
    },
    {
      name: 'Blurb',
      description: 'Beautiful photo books and magazines',
      url: 'https://www.blurb.com',
      icon: 'photo-library',
      features: ['High-quality photo printing', 'Various sizes', 'Lay-flat binding']
    },
    {
      name: 'Amazon KDP',
      description: 'Self-publish on Amazon with no upfront costs',
      url: 'https://kdp.amazon.com',
      icon: 'store',
      features: ['Amazon marketplace', 'Print & eBook', 'Author royalties']
    },
  ];

  const localOptions = [
    { icon: 'business', title: 'Local Print Shops', description: 'Support local businesses, get immediate results' },
    { icon: 'camera', title: 'Photo Centers', description: 'CVS, Walgreens, Costco for quick photo book printing' },
    { icon: 'content-copy', title: 'Copy Centers', description: 'FedEx Office, Staples for document binding' },
  ];

  const tips = [
    'Use high-quality paper (24-32 lb) for best results',
    'Consider hardcover binding for heirloom recipes and journals',
    'Order a proof copy first to check quality',
    'Save your PDF for future reprints or sharing',
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={[styles.iconCircle, { backgroundColor: theme.primary + '20' }]}>
                <Icon name="auto-awesome" size={28} color={theme.primary} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: theme.text }]}>
                  Your {exportType === 'book' ? 'Book' : 'PDF'} is Ready!
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Here's how to bring it to life
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Print Services */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                📖 Print-on-Demand Services
              </Text>
              <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                Professional printing without upfront costs
              </Text>

              {printServices.map((service, index) => (
                <Pressable
                  key={index}
                  style={[styles.serviceCard, { backgroundColor: theme.background, borderColor: theme.divider }]}
                  onPress={() => handleOpenLink(service.url)}
                >
                  <View style={styles.serviceHeader}>
                    <View style={[styles.serviceIcon, { backgroundColor: theme.primary + '15' }]}>
                      <Icon name={service.icon as any} size={20} color={theme.primary} />
                    </View>
                    <View style={styles.serviceInfo}>
                      <Text style={[styles.serviceName, { color: theme.text }]}>
                        {service.name}
                      </Text>
                      <Text style={[styles.serviceDescription, { color: theme.textSecondary }]}>
                        {service.description}
                      </Text>
                    </View>
                    <Icon name="open-in-new" size={18} color={theme.textSecondary} />
                  </View>
                  <View style={styles.featuresList}>
                    {service.features.map((feature, i) => (
                      <View key={i} style={styles.featureItem}>
                        <Icon name="check-circle" size={14} color={theme.primary} />
                        <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Local Options */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                🏪 Local Printing Options
              </Text>
              <View style={styles.localGrid}>
                {localOptions.map((option, index) => (
                  <View
                    key={index}
                    style={[styles.localCard, { backgroundColor: theme.background, borderColor: theme.divider }]}
                  >
                    <Icon name={option.icon as any} size={24} color={theme.primary} />
                    <Text style={[styles.localTitle, { color: theme.text }]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.localDescription, { color: theme.textSecondary }]}>
                      {option.description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Tips */}
            <View style={[styles.section, styles.tipsSection]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                💡 Printing Tips
              </Text>
              {tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={[styles.tipBullet, { backgroundColor: theme.primary }]} />
                  <Text style={[styles.tipText, { color: theme.text }]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>

            {/* Digital Sharing */}
            <View style={[styles.section, styles.lastSection]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                📧 Digital Sharing
              </Text>
              <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
                Share your PDF digitally with family and friends via email, Dropbox, Google Drive, or iCloud
              </Text>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.divider }]}>
            <Pressable
              style={[styles.doneButton, { backgroundColor: theme.primary }]}
              onPress={onClose}
            >
              <Text style={styles.doneButtonText}>Got It!</Text>
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
  container: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 13,
  },
  featuresList: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
  },
  localGrid: {
    gap: 12,
  },
  localCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  localTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  localDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
