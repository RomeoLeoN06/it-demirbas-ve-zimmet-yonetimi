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
  ScrollView
} from 'react-native';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../styles/theme';

export default function DepartmentsScreen() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'roles'
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add / Edit Department Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [deptRes, rolesRes] = await Promise.all([
        mobileApi.getDepartments(),
        mobileApi.getRoles().catch(() => ({ data: [] }))
      ]);
      setDepartments(deptRes.data || []);
      setRoles(rolesRes.data || [
        {
          id: 1,
          name: 'Yönetici (Admin)',
          role_key: 'admin',
          description: 'Sistem genelinde tam denetim, kullanıcı yönetimi, envanter silme ve log inceleme yetkisi.',
          color: colors.danger
        },
        {
          id: 2,
          name: 'Teknisyen',
          role_key: 'technician',
          description: 'Demirbaş kaydı, zimmetleme, iade alma, bakım ve arıza giderme operasyonları yetkisi.',
          color: colors.warning
        },
        {
          id: 3,
          name: 'Personel',
          role_key: 'personnel',
          description: 'Kendi üzerine zimmetli donanımları görüntüleme ve arıza bildirimi yapabilme yetkisi.',
          color: colors.accentCyan
        }
      ]);
    } catch (err) {
      Alert.alert('Hata', err.message || 'Departman verileri yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleOpenCreate = () => {
    setEditingDept(null);
    setDeptForm({ name: '', description: '' });
    setModalVisible(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name || '',
      description: dept.description || ''
    });
    setModalVisible(true);
  };

  const handleSaveDept = async () => {
    if (!deptForm.name.trim()) {
      Alert.alert('Uyarı', 'Departman adı zorunludur.');
      return;
    }
    setSaving(true);
    try {
      if (editingDept) {
        await mobileApi.updateDepartment(editingDept.id, deptForm);
        Alert.alert('Başarılı', 'Departman güncellendi.');
      } else {
        await mobileApi.createDepartment(deptForm);
        Alert.alert('Başarılı', 'Yeni departman oluşturuldu.');
      }
      setModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert('Hata', err.message || 'Kayıt başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDept = (dept) => {
    Alert.alert(
      'Departman Silinecek',
      `"${dept.name}" birimi silinecek. Onaylıyor musunuz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await mobileApi.deleteDepartment(dept.id);
              Alert.alert('Bilgi', 'Departman silindi.');
              fetchData();
            } catch (err) {
              Alert.alert('Hata', err.message || 'Silinemedi.');
            }
          }
        }
      ]
    );
  };

  const renderDeptCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconCircleText}>🏢</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.deptName}>{item.name}</Text>
          <Text style={styles.deptDesc}>{item.description || 'Açıklama belirtilmemiş'}</Text>
        </View>
      </View>

      <View style={styles.deptFooter}>
        <View style={styles.memberBadge}>
          <Text style={styles.memberBadgeText}>
            👥 {item.user_count || 0} Kayıtlı Personel
          </Text>
        </View>

        {isAdmin && (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleOpenEdit(item)}
            >
              <Text style={styles.actionBtnText}>✏️ Düzenle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDeleteDept(item)}
            >
              <Text style={[styles.actionBtnText, { color: colors.danger }]}>🗑️ Sil</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderRoleCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: (item.color || colors.primary) + '25' }]}>
          <Text style={styles.iconCircleText}>🛡️</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.deptName}>{item.name}</Text>
          <Text style={styles.roleKeyText}>Anahtar: {item.role_key || item.name}</Text>
        </View>
      </View>
      <Text style={styles.roleDescText}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.pageTitle}>Departman & Roller</Text>
          <Text style={styles.pageSubtitle}>Birim Tanımları ve Yetkilendirme Matrisi</Text>
        </View>
        {isAdmin && activeTab === 'departments' && (
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreate}>
            <Text style={styles.addBtnText}>➕ Birim Ekle</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'departments' && styles.tabBtnActive]}
          onPress={() => setActiveTab('departments')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'departments' && styles.tabBtnTextActive]}>
            🏢 Departmanlar ({departments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'roles' && styles.tabBtnActive]}
          onPress={() => setActiveTab('roles')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'roles' && styles.tabBtnTextActive]}>
            🛡️ Rol Tanımları ({roles.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.accentCyan} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : activeTab === 'departments' ? (
        <FlatList
          data={departments}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderDeptCard}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🏢</Text>
              <Text style={styles.emptyTitle}>Departman Bulunamadı</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={roles}
          keyExtractor={(item) => String(item.id || item.role_key)}
          renderItem={renderRoleCard}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}

      {/* Add / Edit Department Modal */}
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
                {editingDept ? '✏️ Departmanı Düzenle' : '➕ Yeni Departman Ekle'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Departman / Birim Adı *</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Bilgi İşlem ve Yapay Zeka"
                placeholderTextColor={colors.textMuted}
                value={deptForm.name}
                onChangeText={(val) => setDeptForm((prev) => ({ ...prev, name: val }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Açıklama / Görev Tanımı</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="Departmanın faaliyet alanı..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={deptForm.description}
                onChangeText={(val) => setDeptForm((prev) => ({ ...prev, description: val }))}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveDept}
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
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.sm
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm
  },
  tabBtnActive: {
    backgroundColor: colors.primary
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  tabBtnTextActive: {
    color: '#fff',
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderHighlight
  },
  iconCircleText: {
    fontSize: 20
  },
  deptName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  deptDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  deptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.borderSubtle
  },
  memberBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm
  },
  memberBadgeText: {
    color: colors.accentCyan,
    fontSize: 11,
    fontWeight: '600'
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6
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
  roleKeyText: {
    fontSize: 11,
    color: colors.accentCyan,
    marginTop: 2
  },
  roleDescText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 18
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
