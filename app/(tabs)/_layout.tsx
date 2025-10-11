import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.divider,
          borderTopWidth: 1,
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
            <MaterialIcons name="folder" size={size} color={color} />
          ),
          headerTitle: 'Projects',
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{
          title: 'Recent',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" size={size} color={color} />
          ),
          headerTitle: 'Recent',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 