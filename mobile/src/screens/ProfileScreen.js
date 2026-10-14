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
  Platform
} from 'react-native';
import { mobileApi, getBaseUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../styles/theme';

export default function ProfileScreen() {
  const { user, refreshMe, logout } = useAuth();

  // Profile Edit
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Uyarı', 'Ad Soyad alanı boş bırakılamaz.');
      return;
    }

    setProfileSaving(true);
    try {
      await mobileApi.updateProfile({
        full_name: fullName.trim(),
        department: department.trim(),
        phone: phone.trim()
      });
      await refreshMe();
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
    } catch (err) {
      Alert.alert('Hata', err.message || 'Profil güncellenemedi.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Uyarı', 'Yeni şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Uyarı', 'Yeni şifre ve şifre tekrarı birbiriyle uyuşmuyor.');
      return;
    }

    setPasswordSaving(true);
    try {
      await mobileApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      Alert.alert('Hata', err.message || 'Şifre değiştirilemedi.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Oturumu Kapat', 'Çıkış yapmak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Profile Header Card */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'IT'}
          </Text>
        </View>

        <Text style={styles.profileName}>{user?.full_name}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === 'admin'
              ? '🛡️ Sistem Yöneticisi'
              : user?.role === 'technician'
              ? '🔧 Donanım Teknisyeni'
              : '👤 Kurum Personeli'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{user?.assigned_asset_count || 0}</Text>
            <Text style={styles.statLbl}>Zimmetli Cihaz</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{user?.department || 'IT'}</Text>
            <Text style={styles.statLbl}>Bağlı Birim</Text>
          </View>
        </View>
      </View>

      {/* Edit Profile Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>👤 Kişisel Bilgiler</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adınız ve Soyadınız *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ad Soyad"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Departman / Birim</Text>
          <TextInput
            style={styles.input}
            value={department}
            onChangeText={setDepartment}
            placeholder="Birim adı"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefon Numarası</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="05xx xxx xx xx"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleUpdateProfile}
          disabled={profileSaving}
        >
          {profileSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Bilgileri Güncelle</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Change Password Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🔒 Şifre Değiştir</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mevcut Şifre</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Yeni Şifre (En az 6 karakter)</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Yeni Şifre (Tekrar)</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.warning }]}
          onPress={handleChangePassword}
          disabled={passwordSaving}
        >
          {passwordSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Şifreyi Değiştir</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* System & Connection Info */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🌐 Bağlantı & Sistem Durumu</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Sunucu Adresi:</Text>
          <Text style={styles.infoValMono}>{getBaseUrl()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Uygulama Versiyonu:</Text>
          <Text style={styles.infoVal}>v1.0.0 (Release Build)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Sistem Sağlığı:</Text>
          <Text style={[styles.infoVal, { color: colors.statusZimmetli, fontWeight: '700' }]}>
            ● Çevrimiçi (Aktif)
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>🚪 Güvenli Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain
  },
  content: {
    padding: spacing.md,
    paddingBottom: 90
  },
  profileHeaderCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accentCyan,
    marginBottom: spacing.sm
  },
  avatarText: {
    color: colors.accentCyan,
    fontSize: 26,
    fontWeight: '800'
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2
  },
  roleBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    marginTop: spacing.sm
  },
  roleText: {
    color: colors.accentCyan,
    fontSize: 12,
    fontWeight: '700'
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.borderSubtle
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  statLbl: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderSubtle
  },
  sectionCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md
  },
  inputGroup: {
    marginBottom: spacing.sm
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4
  },
  input: {
    backgroundColor: colors.bgSurfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
    color: colors.textPrimary,
    fontSize: 13
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.sm
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle
  },
  infoKey: {
    fontSize: 12,
    color: colors.textSecondary
  },
  infoVal: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600'
  },
  infoValMono: {
    fontSize: 11,
    color: colors.accentCyan,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  logoutBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl
  },
  logoutBtnText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800'
  }
});
