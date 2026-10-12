import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../styles/theme';
import { setBaseUrl, getBaseUrl } from '../services/api';

export default function LoginScreen() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('admin@kurum.gov.tr');
  const [password, setPassword] = useState('Admin123!');
  const [serverUrl, setServerUrl] = useState(getBaseUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Uyarı', 'Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    try {
      setBaseUrl(serverUrl);
      await login(email, password);
    } catch (err) {
      Alert.alert('Giriş Hatası', err.message || 'Giriş yapılamadı.');
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>📱</Text>
          </View>
          <Text style={styles.title}>IT Demirbaş Mobil</Text>
          <Text style={styles.subtitle}>Yapay Zeka & Dijital Dönüşüm Saha Uygulaması</Text>
        </View>

        {/* Quick Demo Switcher */}
        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>HIZLI TEST SEÇİMİ:</Text>
          <View style={styles.demoRow}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleQuickDemo('admin@kurum.gov.tr', 'Admin123!')}
            >
              <Text style={styles.demoBtnText}>🛡️ Yönetici (Admin)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleQuickDemo('ahmet.yilmaz@kurum.gov.tr', 'User123!')}
            >
              <Text style={styles.demoBtnText}>👤 Personel (Ahmet Y.)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <Text style={styles.label}>E-posta veya Kullanıcı Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek@kurum.gov.tr"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Güvenli Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Server IP Config Toggle */}
        <TouchableOpacity
          style={styles.serverToggle}
          onPress={() => setShowServerConfig(!showServerConfig)}
        >
          <Text style={styles.serverToggleText}>
            ⚙️ Sunucu API Adresi Ayarı {showServerConfig ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showServerConfig && (
          <View style={styles.serverBox}>
            <Text style={styles.serverLabel}>Backend API Uç Noktası (Port 5000):</Text>
            <TextInput
              style={styles.serverInput}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://10.0.2.2:5000/api"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain
  },
  scrollContent: {
    padding: spacing.lg,
    justifyContent: 'center',
    flexGrow: 1
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  iconText: {
    fontSize: 32
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  demoBox: {
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    borderColor: colors.borderHighlight,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentCyan,
    marginBottom: spacing.xs
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8
  },
  demoBtn: {
    flex: 1,
    backgroundColor: colors.bgCard,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  demoBtnText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600'
  },
  form: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6
  },
  input: {
    backgroundColor: colors.bgSurfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    color: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700'
  },
  serverToggle: {
    marginTop: 20,
    alignItems: 'center'
  },
  serverToggleText: {
    color: colors.textMuted,
    fontSize: 12
  },
  serverBox: {
    marginTop: 10,
    backgroundColor: colors.bgCard,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  serverLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 6
  },
  serverInput: {
    backgroundColor: colors.bgSurfaceSubtle,
    color: colors.textPrimary,
    borderRadius: radius.sm,
    padding: 8,
    fontSize: 12
  }
});
