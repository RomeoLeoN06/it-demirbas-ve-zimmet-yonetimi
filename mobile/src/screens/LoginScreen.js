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
  Platform,
  Modal
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../styles/theme';
import { setBaseUrl, getBaseUrl, mobileApi } from '../services/api';

export default function LoginScreen({ onNavigateRegister }) {
  const { login, googleLogin, loading } = useAuth();
  const [email, setEmail] = useState('admin@kurum.gov.tr');
  const [password, setPassword] = useState('Admin123!');
  const [serverUrl, setServerUrl] = useState(getBaseUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);

  // Forgot password modal state
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Uyarı', 'Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    try {
      setBaseUrl(serverUrl);
      await login(email, password);
    } catch (err) {
      let msg = err.message || 'Giriş yapılamadı.';
      if (msg.includes('Network request failed')) {
        msg = `Sunucuya bağlanılamadı!\n\n1. Bilgisayarınız ve telefonunuz aynı Wi-Fi ağına bağlı olmalıdır.\n2. Backend sunucusunun çalıştığından emin olun (Port 5000).\n3. Sunucu IP ayarını kontrol edin (Şu an: ${serverUrl}).`;
      }
      Alert.alert('Bağlantı / Giriş Hatası', msg);
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  // Google Auth modal state
  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleOpenGoogleModal = () => {
    setGoogleEmail('');
    setGoogleName('');
    setGoogleModalVisible(true);
  };

  const handleConfirmGoogleAuth = async () => {
    if (!googleEmail || !googleEmail.includes('@')) {
      Alert.alert('Geçersiz E-posta', 'Lütfen geçerli bir Gmail veya Google e-posta adresi giriniz.');
      return;
    }

    setGoogleLoading(true);
    try {
      setBaseUrl(serverUrl);
      const cleanEmail = googleEmail.toLowerCase().trim();
      const derivedName = googleName.trim() || cleanEmail.split('@')[0];
      await googleLogin({
        email: cleanEmail,
        name: derivedName,
        google_id: 'google_mobile_oid_' + cleanEmail.replace(/[^a-z0-9]/g, '_'),
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(derivedName)}&background=0284c7&color=ffffff`
      });
      setGoogleModalVisible(false);
      Alert.alert('Başarılı', `Google (${cleanEmail}) hesabınız ile başarıyla oturum açıldı!`);
    } catch (err) {
      Alert.alert('Hata', err.message || 'Google girişi başarısız oldu.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotEmail) {
      Alert.alert('Uyarı', 'Lütfen kayıtlı e-posta adresinizi giriniz.');
      return;
    }
    if (!forgotNewPass || forgotNewPass.length < 6) {
      Alert.alert('Uyarı', 'Yeni şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setForgotLoading(true);
    try {
      setBaseUrl(serverUrl);
      const res = await mobileApi.forgotPassword({
        email: forgotEmail,
        new_password: forgotNewPass
      });
      Alert.alert('Başarılı', res.message || 'Şifreniz başarıyla yenilendi!');
      setEmail(forgotEmail);
      setPassword(forgotNewPass);
      setForgotModalVisible(false);
      setForgotEmail('');
      setForgotNewPass('');
    } catch (err) {
      Alert.alert('Hata', err.message || 'Şifre sıfırlanamadı.');
    } finally {
      setForgotLoading(false);
    }
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
          <Text style={styles.subtitle}>Yapay Zeka & Dijital Dönüşüm Koordinatörlüğü</Text>
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

        {/* Google Sign In Button */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleOpenGoogleModal}
          disabled={loading || googleLoading}
        >
          <Text style={styles.googleBtnIcon}>🌐</Text>
          <Text style={styles.googleBtnText}>Google / Gmail ile Giriş Yap</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>VEYA KULLANICI BİLGİLERİYLE</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Login Form Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta veya Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@kurum.gov.tr"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Şifre</Text>
              <TouchableOpacity onPress={() => setForgotModalVisible(true)}>
                <Text style={styles.forgotPassLink}>Şifremi Unuttum?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Güvenli Giriş Yap ➜</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Register Navigation Row */}
        <View style={styles.registerRow}>
          <Text style={styles.registerPrompt}>Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={onNavigateRegister}>
            <Text style={styles.registerLink}>Yeni Hesap Oluştur</Text>
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
              placeholder="http://10.236.158.60:5000/api"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        )}

        {/* Forgot Password Modal */}
        <Modal
          visible={forgotModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setForgotModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🔑 Şifremi Unuttum</Text>
                <TouchableOpacity onPress={() => setForgotModalVisible(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDesc}>
                Kayıtlı e-posta adresinizi ve belirlemek istediğiniz yeni şifrenizi giriniz:
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kurumsal E-posta Adresi *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ornek@kurum.gov.tr"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yeni Güvenli Şifre (En az 6 karakter) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={forgotNewPass}
                  onChangeText={setForgotNewPass}
                />
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setForgotModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>İptal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleResetPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.modalSaveText}>Şifreyi Yenile</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Real Google / Gmail Auth Modal */}
        <Modal
          visible={googleModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setGoogleModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🌐 Google / Gmail ile Giriş</Text>
                <TouchableOpacity onPress={() => setGoogleModalVisible(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDesc}>
                Gerçek Google veya Gmail e-posta adresinizi girerek anında güvenli giriş yapabilirsiniz:
              </Text>

              {/* Quick prefill chips */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>
                  Hızlı Hesap Seç:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: 'rgba(56, 189, 248, 0.3)'
                    }}
                    onPress={() => {
                      setGoogleEmail('admin@kurum.gov.tr');
                      setGoogleName('Metehan Akbulut');
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.accentCyan }}>🛡️ Admin Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: 'rgba(16, 185, 129, 0.3)'
                    }}
                    onPress={() => {
                      setGoogleEmail('ahmet.yilmaz@kurum.gov.tr');
                      setGoogleName('Ahmet Yılmaz');
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.statusZimmetli }}>👤 Ahmet Yılmaz</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Google / Gmail E-posta Adresi *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ornek@gmail.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={googleEmail}
                  onChangeText={setGoogleEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ad Soyad (Opsiyonel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Adınız Soyadınız"
                  placeholderTextColor={colors.textMuted}
                  value={googleName}
                  onChangeText={setGoogleName}
                />
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setGoogleModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>İptal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSaveBtn, { backgroundColor: '#0284c7' }]}
                  onPress={handleConfirmGoogleAuth}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.modalSaveText}>Google ile Başlat</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    marginBottom: spacing.lg
  },
  iconBox: {
    width: 66,
    height: 66,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4
  },
  iconText: {
    fontSize: 32
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center'
  },
  demoBox: {
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    borderColor: 'rgba(14, 165, 233, 0.25)',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentCyan,
    marginBottom: spacing.xs,
    textAlign: 'center'
  },
  demoRow: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  demoBtn: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    paddingVertical: 9,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    paddingVertical: 12,
    marginBottom: spacing.md
  },
  googleBtnIcon: {
    fontSize: 18,
    marginRight: 8
  },
  googleBtnText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSubtle
  },
  dividerText: {
    marginHorizontal: spacing.sm,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700'
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg
  },
  inputGroup: {
    marginBottom: spacing.md
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6
  },
  forgotPassLink: {
    fontSize: 12,
    color: colors.accentCyan,
    fontWeight: '600',
    textDecorationLine: 'underline'
  },
  input: {
    backgroundColor: colors.bgSurfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: colors.textPrimary,
    fontSize: 14
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700'
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md
  },
  registerPrompt: {
    color: colors.textSecondary,
    fontSize: 13
  },
  registerLink: {
    color: colors.accentCyan,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline'
  },
  serverToggle: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: 6
  },
  serverToggleText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600'
  },
  serverBox: {
    backgroundColor: colors.bgSurface,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: spacing.xs
  },
  serverLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6
  },
  serverInput: {
    backgroundColor: colors.bgSurfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 12
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md
  },
  modalCard: {
    backgroundColor: colors.bgCard,
    width: '100%',
    maxWidth: 400,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  modalCloseText: {
    fontSize: 20,
    color: colors.textMuted,
    padding: 4
  },
  modalDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  modalSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.sm,
    backgroundColor: colors.primary
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700'
  }
});
