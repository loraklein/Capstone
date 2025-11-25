import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { apiService } from '../utils/apiService';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function StackLayout() {
  const { theme, themeMode } = useTheme();
  const { user, loading, getAccessToken } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);

  // Load Material Icons for web from CDN and CSS override
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Load Google Fonts Material Icons
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      // Add CSS to override @expo/vector-icons font loading
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'MaterialIcons';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Set up API service with auth token provider
  useEffect(() => {
    apiService.setAccessTokenProvider(getAccessToken);
  }, [getAccessToken]);

  // Handle splash screen visibility and load fonts
  useEffect(() => {
    async function prepare() {
      try {
        // Load custom fonts
        await Font.loadAsync({
          'Blinker-Regular': require('../assets/fonts/Blinker-Regular.ttf'),
          'Blinker-SemiBold': require('../assets/fonts/Blinker-SemiBold.ttf'),
        });
        
        // Keep splash screen visible for at least 2 seconds (for testing)
        // Remove this delay in production!
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Hide splash screen when app is ready
  useEffect(() => {
    if (appIsReady && !loading) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, loading]);

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

  // Show nothing while checking auth status or preparing app
  if (loading || !appIsReady) {
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
            headerShown: true,
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