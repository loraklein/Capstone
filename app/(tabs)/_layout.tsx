import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../../components/Icon';

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: Platform.OS === 'web'
          ? { display: 'none' } // Hide tab bar on web
          : {
              backgroundColor: theme.surface,
              borderTopColor: theme.divider,
              borderTopWidth: 1,
              height: 49 + insets.bottom, // Base height + safe area bottom padding
              paddingBottom: Platform.OS === 'ios' ? insets.bottom : 4,
              paddingTop: 4,
            },
        tabBarLabelStyle: {
          fontSize: Platform.OS === 'web' ? 14 : 11,
          marginTop: -2, // Bring label closer to icon
          marginBottom: Platform.OS === 'ios' ? 0 : 2,
        },
        tabBarIconStyle: {
          marginTop: 4, // Add small margin above icon
        },
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.primary,
        headerTitleStyle: {
          fontWeight: '600',
          color: theme.text,
          fontSize: 24,
        },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Icon name="folder" size={size} color={color} />
          ),
          headerTitle: 'Projects',
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{
          title: 'Recent',
          tabBarIcon: ({ color, size }) => (
            <Icon name="history" size={size} color={color} />
          ),
          headerTitle: 'Recent',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 