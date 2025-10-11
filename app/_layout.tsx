import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/apiService';
import { useEffect } from 'react';

function StackLayout() {
  const { theme, themeMode } = useTheme();
  const { user, loading, getAccessToken } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  // Set up API service with auth token provider
  useEffect(() => {
    apiService.setAccessTokenProvider(getAccessToken);
  }, [getAccessToken]);

  // Handle authentication redirects
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect to sign in if not authenticated
      router.replace('/auth/signin');
    } else if (user && inAuthGroup) {
      // Redirect to app if authenticated
      router.replace('/');
    }
  }, [user, segments, loading]);

  const getStatusBarStyle = () => {
    if (themeMode === 'system') {
      return colorScheme === 'dark' ? 'light' : 'dark';
    }
    return themeMode === 'light' ? 'dark' : 'light';
  };

  // Show nothing while checking auth status
  if (loading) {
    return null;
  }

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
          name="auth/signin" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="auth/signup" 
          options={{ 
            headerShown: false,
          }} 
        />
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
      <AuthProvider>
        <StackLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}