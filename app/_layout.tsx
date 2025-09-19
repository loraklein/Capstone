import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

function StackLayout() {
  const { theme, themeMode } = useTheme();
  const colorScheme = useColorScheme();

  const getStatusBarStyle = () => {
    if (themeMode === 'system') {
      return colorScheme === 'dark' ? 'light' : 'dark';
    }
    return themeMode === 'light' ? 'dark' : 'light';
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={getStatusBarStyle()} />
      <Stack
        screenOptions={{
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
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="add-project" 
          options={{ 
            title: 'New Project',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="edit-project" 
          options={{ 
            title: 'Edit Project',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="project/[id]" 
          options={{ 
            title: '',
            headerBackTitle: 'Back',
          }} 
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StackLayout />
    </ThemeProvider>
  );
}