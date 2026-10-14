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

export default function RegisterScreen({ onNavigateLogin }) {
  const { register, googleLogin, loading } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    department: 'Yazılım ve Yapay Zeka',
    phone: ''
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (!formData.full_name || !formData.email || !formData.password) {
      Alert.alert('Eksik Bilgi', 'Ad Soyad, E-posta ve Şifre alanları zorunludur.');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Uyarı', 'Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    try {
      await register(formData);
      Alert.alert('Tebrikler', 'Hesabınız başarıyla oluşturuldu ve oturum açıldı!');
    } catch (err) {
      Alert.alert('Kayıt Hatası', err.message || 'Kayıt işlemi başarısız oldu.');
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
            <Text style={styles.iconText}>👤➕</Text>
          </View>
          <Text style={styles.title}>Yeni Hesap Oluştur</Text>
          <Text style={styles.subtitle}>IT Demirbaş ve Zimmet Sistemine Kayıt Olun</Text>
        </View>

        {/* Google Quick Register Button */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogleAuth}
          disabled={loading}
        >
          <Text style={styles.googleBtnIcon}>🌐</Text>
          <Text style={styles.googleBtnText}>Google ile Hızlı Kayıt Ol</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>VEYA FORM İLE KAYDOL</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Register Form */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adınız ve Soyadınız *</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Mehmet Ali Kaya"
              placeholderTextColor={colors.textMuted}
              value={formData.full_name}
              onChangeText={(val) => handleChange('full_name', val)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kurumsal E-posta Adresi *</Text>
            <TextInput
              style={styles.input}
              placeholder="ad.soyad@kurum.gov.tr"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(val) => handleChange('email', val)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Güvenli Şifre Oluşturun *</Text>
            <TextInput
              style={styles.input}
              placeholder="En az 6 karakter"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={formData.password}
              onChangeText={(val) => handleChange('password', val)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Departman / Birim</Text>
            <TextInput
              style={styles.input}
              placeholder="Yapay Zeka Laboratuvarı"
              placeholderTextColor={colors.textMuted}
              value={formData.department}
              onChangeText={(val) => handleChange('department', val)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon Numarası</Text>
            <TextInput
              style={styles.input}
              placeholder="05xx xxx xx xx"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(val) => handleChange('phone', val)}
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Hesabı Oluştur ➜</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Back to Login Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Zaten bir hesabınız var mı? </Text>
          <TouchableOpacity onPress={onNavigateLogin}>
            <Text style={styles.footerLink}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
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
    width: 60,
    height: 60,
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
    fontSize: 28
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center'
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    paddingVertical: 13,
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6
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
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingBottom: spacing.lg
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 13
  },
  footerLink: {
    color: colors.accentCyan,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline'
  }
});
