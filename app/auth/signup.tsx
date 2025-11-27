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

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme;

  // Helper function to validate password and return user-friendly error message
  // Returns all missing requirements in a single message
  const validatePassword = (password: string): string | null => {
    const missingRequirements: string[] = [];
    
    if (password.length < 8) {
      missingRequirements.push('8 characters');
    }
    
    if (!/[a-z]/.test(password)) {
      missingRequirements.push('one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      missingRequirements.push('one uppercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      missingRequirements.push('one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      missingRequirements.push('one special character (!@#$%^&*...)');
    }
    
    if (missingRequirements.length === 0) {
      return null;
    }
    
    // Format as a single, clear message
    if (missingRequirements.length === 1) {
      return `Password must contain at least ${missingRequirements[0]}`;
    } else {
      const lastRequirement = missingRequirements.pop();
      return `Password must contain at least ${missingRequirements.join(', ')}, and ${lastRequirement}`;
    }
  };

  // Helper function to convert Supabase error messages to user-friendly ones
  const formatPasswordError = (errorMessage: string): string => {
    // If it's already a user-friendly message from our validation, return it
    if (errorMessage.includes('Password must contain at least')) {
      return errorMessage;
    }
    
    // Check for common Supabase password error patterns
    if (errorMessage.toLowerCase().includes('password')) {
      // Extract the key requirements from Supabase's verbose message
      const hasLength = /8.*character/i.test(errorMessage);
      const hasLowercase = /lowercase|abcdefghijklmnopqrstuvwxyz/i.test(errorMessage);
      const hasUppercase = /uppercase|ABCDEFG/i.test(errorMessage);
      const hasNumber = /number|123456789/i.test(errorMessage);
      const hasSpecial = /special|!@#\$%|symbol/i.test(errorMessage);
      
      const requirements: string[] = [];
      if (hasLength) requirements.push('8 characters');
      if (hasLowercase) requirements.push('one lowercase letter');
      if (hasUppercase) requirements.push('one uppercase letter');
      if (hasNumber) requirements.push('one number');
      if (hasSpecial) requirements.push('one special character (!@#$%^&*...)');
      
      if (requirements.length > 0) {
        // Format as a single, clear message with all requirements
        if (requirements.length === 1) {
          return `Password must contain at least ${requirements[0]}`;
        } else {
          const lastRequirement = requirements.pop();
          return `Password must contain at least ${requirements.join(', ')}, and ${lastRequirement}`;
        }
      }
    }
    
    // Fallback: return a generic friendly message with all requirements
    return 'Password must contain at least 8 characters, one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*...)';
  };

  const handleSignUp = async () => {
    // Clear any previous errors
    setError('');
    setSuccess(false);

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password with user-friendly messages
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUp(email, password);
    setLoading(false);

    if (signUpError) {
      // Format password errors to be user-friendly
      const errorMessage = signUpError.message || 'Could not create account. Please try again.';
      setError(formatPasswordError(errorMessage));
    } else {
      setSuccess(true);
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        router.replace('/');
      }, 2000);
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
          Create an Account
        </Text>

        {error ? (
          <View style={[styles.messageContainer, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
            <Text style={[styles.messageText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={[styles.messageContainer, { backgroundColor: colors.success + '15', borderColor: colors.success }]}>
            <Text style={[styles.messageText, { color: colors.success }]}>
              Account created successfully! Redirecting...
            </Text>
          </View>
        ) : null}

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
          autoComplete="password-new"
          editable={!loading}
        />

        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Confirm Password"
          placeholderTextColor={colors.textSecondary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="password-new"
          editable={!loading}
          onSubmitEditing={handleSignUp}
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? (colors.primary === '#6F7F61' ? '#7A8B6B' : '#556245') : colors.primary },
            loading && styles.buttonDisabled
          ]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryText }]}>Sign Up</Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <Link href="/auth/signin" asChild>
            <TouchableOpacity disabled={loading}>
              <Text style={[styles.link, { color: colors.primary }]}>Sign In</Text>
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
    ...(Platform.OS === 'web' && {
      maxWidth: 400,
      width: '100%',
      alignSelf: 'center',
    }),
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
  messageContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

