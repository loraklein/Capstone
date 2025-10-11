import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../../components/Logo';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme;

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Sign In Failed', error.message || 'Invalid email or password');
    } else {
      // Navigation will be handled by auth state change
      router.replace('/');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Logo size="large" showText={true} />
        <View style={styles.divider} />
        <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
          Sign In to Continue
        </Text>

        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          editable={!loading}
        />

        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          editable={!loading}
          onSubmitEditing={handleSignIn}
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? (colors.primary === '#6F7F61' ? '#7A8B6B' : '#556245') : colors.primary },
            loading && styles.buttonDisabled
          ]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryText }]}>Sign In</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <Link href="/auth/signup" asChild>
            <TouchableOpacity disabled={loading}>
              <Text style={[styles.link, { color: colors.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  divider: {
    height: 40,
  },
  formLabel: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
  },
});

