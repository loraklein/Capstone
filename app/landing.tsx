import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import AccessRestrictedModal from '../components/AccessRestrictedModal';

export default function LandingPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [showRestrictionModal, setShowRestrictionModal] = React.useState(false);

  const handleGetStarted = () => {
    // Show restriction modal instead of navigating to signup
    setShowRestrictionModal(true);
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const features = [
    {
      icon: 'auto-awesome',
      title: 'AI-Powered OCR',
      description: 'Advanced handwriting recognition converts your written pages to editable text',
    },
    {
      icon: 'menu-book',
      title: 'Smart Organization',
      description: 'AI-powered chapter suggestions automatically organize your content',
    },
    {
      icon: 'edit',
      title: 'Review & Edit',
      description: 'Review extracted text page-by-page and make corrections as needed',
    },
    {
      icon: 'picture-as-pdf',
      title: 'Beautiful PDFs',
      description: 'Export professionally formatted books ready for printing or sharing',
    },
    {
      icon: 'palette',
      title: 'Custom Layouts',
      description: 'Choose fonts, sizes, margins, and book dimensions to match your vision',
    },
    {
      icon: 'local-printshop',
      title: 'Print Ready',
      description: 'Direct guidance for print-on-demand services like Lulu, Blurb, and Amazon KDP',
    },
  ];

  const steps = [
    {
      number: '1',
      icon: 'photo-camera',
      title: 'Capture',
      description: 'Scan or upload photos of your journal entries, recipes, or other documents.',
    },
    {
      number: '2',
      icon: 'psychology',
      title: 'Process',
      description: 'AI extracts text and provides auto corrections and support during review.',
    },
    {
      number: '3',
      icon: 'auto-stories',
      title: 'Publish',
      description: 'Customize and export as a shareable print-ready PDF formatted book.',
    },
  ];

  const useCases = [
    { icon: 'restaurant', text: 'Family Recipes' },
    { icon: 'flight', text: 'Travel Journals' },
    { icon: 'favorite', text: 'Letters & Memories' },
    { icon: 'menu-book', text: 'Personal Diaries' },
    { icon: 'people', text: 'Family Histories' },
    { icon: 'school', text: 'Research Notes' },
  ];

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Portfolio Mode Notice Banner */}
        <View style={[styles.noticeBanner, { backgroundColor: theme.primary + '15', borderBottomColor: theme.primary + '40' }]}>
          <View style={styles.noticeContent}>
            <Icon name="info-outline" size={20} color={theme.primary} />
            <Text style={[styles.noticeText, { color: theme.text }]}>
              This application is in portfolio mode. Account creation requires special permission.
            </Text>
          </View>
        </View>

        {/* Hero Section */}
        <ImageBackground
        source={require('../assets/back1.jpg')}
        style={styles.hero}
        resizeMode="cover"
      >
        <View style={styles.heroContent}>
          <Logo size="large" showText={true} />

          <Text style={[styles.tagline, { color: theme.text }]}>
            Your legacy, forwarded with love
          </Text>

          <Text style={[styles.subtitle, { color: theme.accent }]}>
            Transform journals, recipes, and letters into beautiful printed books and shareable PDFs with AI-powered digitization
          </Text>

          <View style={styles.ctaButtons}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={handleGetStarted}
            >
              <Text style={[styles.primaryButtonText, { color: theme.primaryText }]}>
                Get Started Free
              </Text>
            </Pressable>

            <Pressable
              style={[styles.secondaryButton, { borderColor: theme.primary }]}
              onPress={handleSignIn}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
                Sign In
              </Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>

      {/* Simple Workflow Section */}
      <View style={[styles.section, styles.sectionWithDivider, { backgroundColor: theme.surface, borderTopColor: theme.divider }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Simple Workflow
        </Text>

        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <Icon name={step.icon as any} size={24} color={theme.primary} />
                <Text style={[styles.stepTitle, { color: theme.text }]}>
                  {step.number}. {step.title}
                </Text>
              </View>
              <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
                {step.description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Features Section */}
      <View style={[styles.section, styles.sectionWithDivider, { backgroundColor: theme.background, borderTopColor: theme.divider }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Powerful Features
        </Text>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View
              key={index}
              style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}
            >
              <View style={[styles.featureIcon, { backgroundColor: theme.primary + '15' }]}>
                <Icon name={feature.icon as any} size={28} color={theme.primary} />
              </View>
              <Text style={[styles.featureTitle, { color: theme.text }]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                {feature.description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Use Cases Section */}
      <View style={[styles.section, styles.sectionWithDivider, { backgroundColor: theme.surface, borderTopColor: theme.divider }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Perfect For
        </Text>

        <View style={styles.useCasesGrid}>
          {useCases.map((useCase, index) => (
            <View
              key={index}
              style={styles.useCaseCard}
            >
              <Icon name={useCase.icon as any} size={24} color={theme.primary} />
              <Text style={[styles.useCaseText, { color: theme.text }]}>
                {useCase.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Final CTA Section */}
      <ImageBackground
        source={require('../assets/back1.jpg')}
        style={styles.finalCta}
        resizeMode="cover"
      >
        <View style={styles.finalCtaContent}>
          <Text style={[styles.finalCtaTitle, { color: theme.text }]}>
            Start Preserving Your Memories Today
          </Text>

          <Pressable
            style={[styles.primaryButton, styles.finalCtaButton, { backgroundColor: theme.primary }]}
            onPress={handleGetStarted}
          >
            <Text style={[styles.primaryButtonText, { color: theme.primaryText }]}>
              Create Free Account
            </Text>
          </Pressable>

          <Pressable onPress={handleSignIn}>
            <Text style={[styles.signInLink, { color: theme.primary }]}>
              Already have an account? Sign In
            </Text>
          </Pressable>
        </View>
      </ImageBackground>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 PastForward. Preserve the past, share the future.
        </Text>
      </View>
      </ScrollView>

      <AccessRestrictedModal
        visible={showRestrictionModal}
        onClose={() => setShowRestrictionModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  noticeBanner: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    ...(Platform.OS === 'web' && {
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }),
  },
  noticeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  noticeText: {
    fontSize: 14,
    textAlign: 'center',
    flex: 1,
    lineHeight: 20,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 80,
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  heroContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    maxWidth: 800,
    width: '100%',
  },
  tagline: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 36,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 26,
    maxWidth: 500,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  sectionWithDivider: {
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
  },
  stepsContainer: {
    flexDirection: 'row',
    gap: 32,
    maxWidth: 1200,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  stepCard: {
    maxWidth: 280,
    flex: 1,
    minWidth: 240,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1200,
    justifyContent: 'center',
    width: '100%',
  },
  featureCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    width: 360,
    minHeight: 200,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  useCasesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 900,
    justifyContent: 'center',
  },
  useCaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: 260,
  },
  useCaseText: {
    fontSize: 15,
    fontWeight: '500',
  },
  finalCta: {
    paddingVertical: 60,
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  finalCtaContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    maxWidth: 700,
    width: '100%',
  },
  finalCtaTitle: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
  },
  finalCtaButton: {
    minWidth: 200,
  },
  signInLink: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 16,
  },
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#5F6B52',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    color: 'rgb(248, 243, 234)',
  },
});
