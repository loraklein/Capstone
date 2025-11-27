import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
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

  // Only show on web
  if (!IS_WEB) {
    return null;
  }

  const isProjectsPage = pathname === '/' || pathname.startsWith('/(tabs)') && !pathname.includes('recent') && !pathname.includes('settings');
  const isSettingsPage = pathname.startsWith('/(tabs)/settings') || pathname.startsWith('/settings');

  const handleSignOut = async () => {
    await signOut();
  };

  const isRecentPage = pathname.startsWith('/(tabs)/recent');

  return (
    <View style={[styles.navbar, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
      <View style={styles.container}>
        {/* Brand Name */}
        <Pressable style={styles.brand} onPress={() => router.push('/(tabs)')}>
          <Text style={[styles.brandText, { color: theme.primary }]}>PastForward</Text>
        </Pressable>

        {/* Navigation Links */}
        <View style={styles.navLinks}>
          <Pressable
            style={[styles.navLink, isProjectsPage && styles.navLinkActive]}
            onPress={() => router.push('/(tabs)')}
          >
            <Icon name="folder" size={20} color={isProjectsPage ? theme.primary : theme.textSecondary} />
            <Text style={[
              styles.navLinkText,
              { color: isProjectsPage ? theme.primary : theme.textSecondary }
            ]}>
              Projects
            </Text>
          </Pressable>

          <Pressable
            style={[styles.navLink, isRecentPage && styles.navLinkActive]}
            onPress={() => router.push('/(tabs)/recent')}
          >
            <Icon name="history" size={20} color={isRecentPage ? theme.primary : theme.textSecondary} />
            <Text style={[
              styles.navLinkText,
              { color: isRecentPage ? theme.primary : theme.textSecondary }
            ]}>
              Recent
            </Text>
          </Pressable>

          <Pressable
            style={[styles.navLink, isSettingsPage && styles.navLinkActive]}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Icon name="settings" size={20} color={isSettingsPage ? theme.primary : theme.textSecondary} />
            <Text style={[
              styles.navLinkText,
              { color: isSettingsPage ? theme.primary : theme.textSecondary }
            ]}>
              Settings
            </Text>
          </Pressable>
        </View>

        {/* User Menu */}
        <View style={styles.userMenu}>
          {user && (
            <>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                {user.email}
              </Text>
              <Pressable
                style={[styles.signOutButton, { backgroundColor: theme.secondary }]}
                onPress={handleSignOut}
              >
                <Icon name="logout" size={20} color={theme.text} />
              </Pressable>
            </>
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
    gap: 12,
  },
  userEmail: {
    fontSize: 14,
    maxWidth: 200,
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
