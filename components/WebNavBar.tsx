import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Dimensions, useWindowDimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Icon from './Icon';

const IS_WEB = Platform.OS === 'web';

export default function WebNavBar() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const { width } = useWindowDimensions();

  // Check if screen is mobile-sized (768px or less)
  const isMobile = width <= 768;

  // Only show on web and when user is authenticated
  if (!IS_WEB) {
    return null;
  }

  // Hide on landing page and auth pages
  const isLandingPage = pathname === '/landing';
  const isAuthPage = pathname.startsWith('/auth');

  if (isLandingPage || isAuthPage || !user) {
    return null;
  }

  const isRecentPage = pathname.startsWith('/(tabs)/recent') || pathname.startsWith('/recent');
  const isProjectsPage = pathname === '/' || pathname.startsWith('/(tabs)') && !pathname.includes('recent') && !pathname.includes('settings');
  const isSettingsPage = pathname.startsWith('/(tabs)/settings') || pathname.startsWith('/settings');

  return (
    <View style={[styles.navbar, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
      <View style={[styles.container, isMobile && styles.containerMobile]}>
        {/* Brand Name */}
        <Pressable style={styles.brand} onPress={() => router.push('/(tabs)')}>
          <Text style={[styles.brandText, { color: theme.primary }]}>PastForward</Text>
        </Pressable>

        {/* Navigation Links - Show icons only on small web screens */}
        <View style={styles.navLinks}>
          <Pressable
            style={[styles.navLink, isProjectsPage && styles.navLinkActive]}
            onPress={() => router.push('/(tabs)')}
          >
            <Icon name="folder" size={20} color={isProjectsPage ? theme.primary : theme.textSecondary} />
            {!isMobile && (
              <Text style={[
                styles.navLinkText,
                { color: isProjectsPage ? theme.primary : theme.textSecondary }
              ]}>
                Projects
              </Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.navLink, isRecentPage && styles.navLinkActive]}
            onPress={() => router.push('/(tabs)/recent')}
          >
            <Icon name="history" size={20} color={isRecentPage ? theme.primary : theme.textSecondary} />
            {!isMobile && (
              <Text style={[
                styles.navLinkText,
                { color: isRecentPage ? theme.primary : theme.textSecondary }
              ]}>
                Recent
              </Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.navLink, isSettingsPage && styles.navLinkActive]}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Icon name="settings" size={20} color={isSettingsPage ? theme.primary : theme.textSecondary} />
            {!isMobile && (
              <Text style={[
                styles.navLinkText,
                { color: isSettingsPage ? theme.primary : theme.textSecondary }
              ]}>
                Settings
              </Text>
            )}
          </Pressable>
        </View>

        {/* User Menu */}
        <View style={styles.userMenu}>
          {user && (
            <Pressable
              style={({ pressed }) => [
                styles.signOutButton,
                { backgroundColor: pressed ? theme.secondary : 'transparent' },
              ]}
              onPress={signOut}
            >
              <Icon name="logout" size={18} color={theme.text} />
              {!isMobile && (
                <Text style={[styles.signOutText, { color: theme.text }]}>
                  Sign Out
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 64,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
  },
  containerMobile: {
    paddingHorizontal: 16,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 22,
    fontFamily: 'Blinker-SemiBold',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  navLinkActive: {
    // Active state handled by color changes
  },
  navLinkText: {
    fontSize: 15,
    fontWeight: '600',
  },
  userMenu: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
