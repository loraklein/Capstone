import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { clearStorage } = useProjects();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all projects and scanned pages. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await clearStorage();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              console.log('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleThemeChange = (newThemeMode: 'light' | 'dark' | 'system') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(newThemeMode);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await signOut();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.replace('/auth/signin');
            } catch (error) {
              console.log('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
          <View style={[styles.settingItem, { borderBottomColor: theme.divider }]}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="person" size={24} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Email</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  {user?.email || 'Not signed in'}
                </Text>
              </View>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              {
                borderBottomColor: theme.divider,
                opacity: pressed ? 0.7 : 1,
              }
            ]}
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            <View style={styles.settingInfo}>
              <MaterialIcons name="logout" size={24} color={theme.error} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.error }]}>Sign Out</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  {isSigningOut ? 'Signing out...' : 'Log out of your account'}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          <View style={[styles.settingItem, { borderBottomColor: theme.divider }]}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="palette" size={24} color={theme.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>Theme</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Choose your preferred appearance
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.themeOptions}>
            <Pressable
              style={[
                styles.themeOption,
                { 
                  backgroundColor: themeMode === 'light' ? theme.primary : theme.card,
                  borderColor: theme.border 
                }
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <MaterialIcons 
                name="light-mode" 
                size={20} 
                color={themeMode === 'light' ? theme.primaryText : theme.textSecondary} 
              />
              <Text style={[
                styles.themeOptionText, 
                { color: themeMode === 'light' ? theme.primaryText : theme.textSecondary }
              ]}>
                Light
              </Text>
            </Pressable>
            
            <Pressable
              style={[
                styles.themeOption,
                { 
                  backgroundColor: themeMode === 'dark' ? theme.primary : theme.card,
                  borderColor: theme.border 
                }
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <MaterialIcons 
                name="dark-mode" 
                size={20} 
                color={themeMode === 'dark' ? theme.primaryText : theme.textSecondary} 
              />
              <Text style={[
                styles.themeOptionText, 
                { color: themeMode === 'dark' ? theme.primaryText : theme.textSecondary }
              ]}>
                Dark
              </Text>
            </Pressable>
            
            <Pressable
              style={[
                styles.themeOption,
                { 
                  backgroundColor: themeMode === 'system' ? theme.primary : theme.card,
                  borderColor: theme.border 
                }
              ]}
              onPress={() => handleThemeChange('system')}
            >
              <MaterialIcons 
                name="settings" 
                size={20} 
                color={themeMode === 'system' ? theme.primaryText : theme.textSecondary} 
              />
              <Text style={[
                styles.themeOptionText, 
                { color: themeMode === 'system' ? theme.primaryText : theme.textSecondary }
              ]}>
                System
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Data Management</Text>
          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              {
                borderBottomColor: theme.divider,
                opacity: pressed ? 0.7 : 1,
              }
            ]}
            onPress={handleClearAllData}
            disabled={isClearing}
          >
            <View style={styles.settingInfo}>
              <MaterialIcons name="delete-forever" size={24} color={theme.error} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.error }]}>Clear All Data</Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  {isClearing ? 'Clearing...' : 'Delete all projects and scanned pages'}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 