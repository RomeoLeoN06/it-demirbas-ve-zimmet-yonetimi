import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Platform
} from 'react-native';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../styles/theme';

const ROLES = [
  { key: '', label: 'Tüm Roller' },
  { key: 'admin', label: 'Yönetici (Admin)' },
  { key: 'technician', label: 'Teknisyen' },
  { key: 'personnel', label: 'Personel' }
];

export default function UsersScreen() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Add / Edit Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'personnel',
    department: 'Yazılım ve Yapay Zeka',
    phone: ''
  });
  const [saving, setSaving] = useState(false);

  // Password Reset Modal
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await mobileApi.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      Alert.alert('Hata', err.message || 'Kullanıcılar yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setUserForm({
      full_name: '',
      email: '',
      password: '',
      role: 'personnel',
      department: 'Yazılım ve Yapay Zeka',
      phone: ''
    });
    setModalVisible(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setUserForm({
      full_name: u.full_name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'personnel',
      department: u.department || '',
      phone: u.phone || ''
    });
    setModalVisible(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.full_name || !userForm.email) {
      Alert.alert('Uyarı', 'Ad Soyad ve E-posta alanları zorunludur.');
      return;
    }

    if (!editingUser && (!userForm.password || userForm.password.length < 6)) {
      Alert.alert('Uyarı', 'Yeni kullanıcı için en az 6 karakterli şifre belirleyiniz.');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        await mobileApi.updateUser(editingUser.id, userForm);
        Alert.alert('Başarılı', 'Kullanıcı bilgileri güncellendi.');
      } else {
        await mobileApi.createUser(userForm);
        Alert.alert('Başarılı', 'Yeni kullanıcı başarıyla eklendi.');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (err) {
      Alert.alert('Hata', err.message || 'Kayıt işlemi başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (u) => {
    if (u.id === user.id) {
      Alert.alert('Uyarı', 'Kendi hesabınızı silemezsiniz.');
      return;
    }

    Alert.alert(
      'Kullanıcı Silinecek',
      `"${u.full_name}" (${u.email}) kullanıcısı sistemden silinecek. Onaylıyor musunuz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await mobileApi.deleteUser(u.id);
              Alert.alert('Bilgi', 'Kullanıcı silindi.');
              fetchUsers();
            } catch (err) {
              Alert.alert('Hata', err.message || 'Silme işlemi başarısız.');
            }
          }
        }
      ]
    );
  };

  const handleConfirmResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Uyarı', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setResetLoading(true);
    try {
      await mobileApi.resetUserPassword(resetModalUser.id, { new_password: newPassword });
      Alert.alert('Başarılı', `${resetModalUser.full_name} kullanıcısının şifresi güncellendi.`);
      setResetModalUser(null);
      setNewPassword('');
    } catch (err) {
      Alert.alert('Hata', err.message || 'Şifre güncellenemedi.');
    } finally {
      setResetLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = !roleFilter || u.role === roleFilter;
    if (!matchesRole) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'YÖNETİCİ', color: colors.danger, bg: colors.dangerLight };
      case 'technician':
        return { label: 'TEKNİSYEN', color: colors.warning, bg: colors.warningLight };
      default:
        return { label: 'PERSONEL', color: colors.accentCyan, bg: 'rgba(56, 189, 248, 0.15)' };
    }
  };

  const renderUserItem = ({ item }) => {
    const roleBadge = getRoleBadge(item.role);

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>
              {item.full_name ? item.full_name.substring(0, 2).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.userName}>{item.full_name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg, borderColor: roleBadge.color }]}>
                <Text style={[styles.roleText, { color: roleBadge.color }]}>{roleBadge.label}</Text>
              </View>
            </View>
            <Text style={styles.userEmail}>✉️ {item.email}</Text>
            <Text style={styles.userDept}>🏢 {item.department || 'Birim Belirtilmemiş'}</Text>
            {item.phone ? <Text style={styles.userPhone}>📞 {item.phone}</Text> : null}
          </View>
        </View>

        {item.assigned_asset_count > 0 ? (
          <View style={styles.assetCountBox}>
            <Text style={styles.assetCountText}>
              💼 Üzerinde {item.assigned_asset_count} Adet Zimmetli Cihaz Bulunuyor
            </Text>
          </View>
        ) : null}

        {isAdmin && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                setResetModalUser(item);
                setNewPassword('');
              }}
            >
              <Text style={[styles.actionBtnText, { color: colors.warning }]}>🔑 Şifre Sıfırla</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleOpenEdit(item)}
            >
              <Text style={styles.actionBtnText}>✏️ Düzenle</Text>
            </TouchableOpacity>

            {item.id !== user.id && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleDeleteUser(item)}
              >
                <Text style={[styles.actionBtnText, { color: colors.danger }]}>🗑️ Sil</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.pageTitle}>Kullanıcı & Personel</Text>
          <Text style={styles.pageSubtitle}>{users.length} Kayıtlı Kullanıcı</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreate}>
            <Text style={styles.addBtnText}>➕ Personel Ekle</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="İsim, e-posta veya departman ara..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Role Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        {ROLES.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[
              styles.chip,
              roleFilter === r.key && styles.chipActive
            ]}
            onPress={() => setRoleFilter(r.key)}
          >
            <Text
              style={[
                styles.chipText,
                roleFilter === r.key && styles.chipTextActive
              ]}
            >
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* User list */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.accentCyan} />
          <Text style={styles.loadingText}>Kullanıcılar yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>Kullanıcı Bulunamadı</Text>
            </View>
          }
        />
      )}

      {/* Add / Edit User Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingUser ? '✏️ Personel Düzenle' : '➕ Yeni Personel Ekle'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adınız ve Soyadınız *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: Mehmet Ali Kaya"
                  placeholderTextColor={colors.textMuted}
                  value={userForm.full_name}
                  onChangeText={(val) => setUserForm((prev) => ({ ...prev, full_name: val }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kurumsal E-posta Adresi *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ad.soyad@kurum.gov.tr"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={userForm.email}
                  onChangeText={(val) => setUserForm((prev) => ({ ...prev, email: val }))}
                />
              </View>

              {!editingUser && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Başlangıç Şifresi *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="En az 6 karakter"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    value={userForm.password}
                    onChangeText={(val) => setUserForm((prev) => ({ ...prev, password: val }))}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kullanıcı Rolü / Yetkisi:</Text>
                <View style={styles.roleSelectRow}>
                  {[
                    { key: 'personnel', label: 'Personel' },
                    { key: 'technician', label: 'Teknisyen' },
                    { key: 'admin', label: 'Yönetici' }
                  ].map((r) => (
                    <TouchableOpacity
                      key={r.key}
                      style={[
                        styles.roleSelectBtn,
                        userForm.role === r.key && styles.roleSelectBtnActive
                      ]}
                      onPress={() => setUserForm((prev) => ({ ...prev, role: r.key }))}
                    >
                      <Text
                        style={[
                          styles.roleSelectBtnText,
                          userForm.role === r.key && styles.roleSelectBtnTextActive
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Departman / Birim</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Yapay Zeka Laboratuvarı"
                  placeholderTextColor={colors.textMuted}
                  value={userForm.department}
                  onChangeText={(val) => setUserForm((prev) => ({ ...prev, department: val }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefon Numarası</Text>
                <TextInput
                  style={styles.input}
                  placeholder="05xx xxx xx xx"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  value={userForm.phone}
                  onChangeText={(val) => setUserForm((prev) => ({ ...prev, phone: val }))}
                />
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveUser}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        visible={Boolean(resetModalUser)}
        transparent
        animationType="slide"
        onRequestClose={() => setResetModalUser(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔑 Şifre Sıfırla</Text>
              <TouchableOpacity onPress={() => setResetModalUser(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {resetModalUser && (
              <Text style={styles.modalDesc}>
                {resetModalUser.full_name} ({resetModalUser.email}) için yeni bir şifre tanımlayınız:
              </Text>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Yeni Şifre (En az 6 karakter) *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setResetModalUser(null)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.warning }]}
                onPress={handleConfirmResetPassword}
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Şifreyi Değiştir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary
  },
  pageSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    paddingVertical: 8
  },
  searchClear: {
    color: colors.textMuted,
    fontSize: 16,
    paddingHorizontal: 6
  },
  chipsScroll: {
    paddingHorizontal: spacing.md,
    maxHeight: 38,
    marginBottom: spacing.sm
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  chipActive: {
    borderColor: colors.accentCyan,
    backgroundColor: 'rgba(56, 189, 248, 0.15)'
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  chipTextActive: {
    color: colors.accentCyan,
    fontWeight: '700'
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 80
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderHighlight
  },
  avatarText: {
    color: colors.accentCyan,
    fontSize: 16,
    fontWeight: '800'
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  userDept: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1
  },
  userPhone: {
    fontSize: 11,
    color: colors.textMuted
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800'
  },
  assetCountBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: radius.sm,
    padding: 6,
    marginTop: spacing.sm
  },
  assetCountText: {
    fontSize: 11,
    color: colors.accentCyan,
    fontWeight: '600'
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
    paddingTop: spacing.sm,
    justifyContent: 'flex-end'
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  actionBtnText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 10,
    fontSize: 13
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
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
    maxWidth: 420,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  modalTitle: {
    fontSize: 17,
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
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 13
  },
  roleSelectRow: {
    flexDirection: 'row',
    gap: 6
  },
  roleSelectBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  roleSelectBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  roleSelectBtnText: {
    fontSize: 12,
    color: colors.textSecondary
  },
  roleSelectBtnTextActive: {
    color: '#fff',
    fontWeight: '700'
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md
  },
  modalCancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
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
    paddingVertical: 9,
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
