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

export default function AssignmentsScreen() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history' | 'audit'

  const [assignments, setAssignments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Modals
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [unassignedAssets, setUnassignedAssets] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Return Modal
  const [returnModalItem, setReturnModalItem] = useState(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [returnStatus, setReturnStatus] = useState('depoda');
  const [returnLoading, setReturnLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'audit') {
        const res = await mobileApi.getSystemAuditLogs();
        setAuditLogs(res.data || []);
      } else {
        const res = await mobileApi.getAssignmentHistory({
          active_only: activeTab === 'active' ? 'true' : 'false'
        });
        setAssignments(res.data || []);
      }
    } catch (err) {
      Alert.alert('Hata', err.message || 'Veriler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleOpenAssign = async () => {
    setAssignNotes('');
    setAssignModalVisible(true);
    try {
      const [assetsRes, usersRes] = await Promise.all([
        mobileApi.getAssets({ status: 'depoda' }),
        mobileApi.getUsers()
      ]);
      setUnassignedAssets(assetsRes.data || []);
      setUsersList(usersRes.data || []);

      if (assetsRes.data && assetsRes.data.length > 0) {
        setSelectedAssetId(String(assetsRes.data[0].id));
      }
      if (usersRes.data && usersRes.data.length > 0) {
        setSelectedUserId(String(usersRes.data[0].id));
      }
    } catch (e) {
      Alert.alert('Hata', 'Zimmet verileri yüklenemedi.');
    }
  };

  const handleConfirmAssign = async () => {
    if (!selectedAssetId || !selectedUserId) {
      Alert.alert('Uyarı', 'Lütfen hem cihaz hem personel seçiniz.');
      return;
    }
    setAssignLoading(true);
    try {
      await mobileApi.assignAsset({
        asset_id: parseInt(selectedAssetId, 10),
        user_id: parseInt(selectedUserId, 10),
        notes: assignNotes
      });
      Alert.alert('Başarılı', 'Zimmet kaydı oluşturuldu.');
      setAssignModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert('Hata', err.message || 'Zimmetleme başarısız.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleConfirmReturn = async () => {
    setReturnLoading(true);
    try {
      await mobileApi.returnAsset({
        assignment_id: returnModalItem.id,
        asset_id: returnModalItem.asset_id,
        new_status: returnStatus,
        notes: returnNotes
      });
      Alert.alert('Başarılı', 'Cihaz başarıyla iade alındı.');
      setReturnModalItem(null);
      fetchData();
    } catch (err) {
      Alert.alert('Hata', err.message || 'İade işlemi başarısız.');
    } finally {
      setReturnLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (item.asset_name && item.asset_name.toLowerCase().includes(q)) ||
      (item.asset_code && item.asset_code.toLowerCase().includes(q)) ||
      (item.user_name && item.user_name.toLowerCase().includes(q)) ||
      (item.user_email && item.user_email.toLowerCase().includes(q))
    );
  });

  const renderAssignmentCard = ({ item }) => {
    const isReturned = Boolean(item.returned_at);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{item.asset_code}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isReturned ? 'rgba(100, 116, 139, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                borderColor: isReturned ? colors.textMuted : colors.statusZimmetli
              }
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isReturned ? colors.textMuted : colors.statusZimmetli }
              ]}
            >
              {isReturned ? 'İADE EDİLDİ' : 'ZİMMETTE (AKTİF)'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.asset_name}</Text>

        <View style={styles.personnelBox}>
          <Text style={styles.personnelLabel}>👤 Zimmetli Personel:</Text>
          <Text style={styles.personnelName} numberOfLines={2}>
            {item.user_name || 'Bilinmiyor'}
            {item.user_email ? ` (${item.user_email})` : ''}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>📅 Teslim Tarihi:</Text>
          <Text style={styles.infoVal}>{item.assigned_at ? item.assigned_at.substring(0, 10) : '-'}</Text>
        </View>

        {isReturned && (
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>🔄 İade Tarihi:</Text>
            <Text style={styles.infoVal}>{item.returned_at.substring(0, 10)}</Text>
          </View>
        )}

        {item.assigned_by_user_name ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>✍️ Teslim Eden:</Text>
            <Text style={styles.infoVal}>{item.assigned_by_user_name}</Text>
          </View>
        ) : null}

        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>💬 {item.notes}</Text>
          </View>
        ) : null}

        {!isReturned && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.returnBtn}
              onPress={() => {
                setReturnModalItem(item);
                setReturnNotes('');
                setReturnStatus('depoda');
              }}
            >
              <Text style={styles.returnBtnText}>🔄 İade Al</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderAuditCard = ({ item }) => (
    <View style={styles.auditCard}>
      <View style={styles.auditHeader}>
        <Text style={styles.auditAction}>⚡ {item.action || 'Sistem Hareketi'}</Text>
        <Text style={styles.auditDate}>{item.created_at ? item.created_at.substring(0, 16) : ''}</Text>
      </View>
      <Text style={styles.auditDetails}>{item.details}</Text>
      {item.user_email ? (
        <Text style={styles.auditUser}>İşlemi Yapan: {item.user_email}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.pageTitle}>Zimmet & Saha Yönetimi</Text>
          <Text style={styles.pageSubtitle}>Cihaz Teslim, İade ve Denetim Kayıtları</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAssign}>
            <Text style={styles.addBtnText}>➕ Zimmet Ver</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'active' && styles.tabBtnTextActive]}>
            Aktif Zimmetler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'history' && styles.tabBtnTextActive]}>
            Geçmiş & İadeler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'audit' && styles.tabBtnActive]}
          onPress={() => setActiveTab('audit')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'audit' && styles.tabBtnTextActive]}>
            Sistem Logları
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search (for assignments) */}
      {activeTab !== 'audit' && (
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cihaz veya personel ara..."
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
      )}

      {/* List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.accentCyan} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : activeTab === 'audit' ? (
        <FlatList
          data={auditLogs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderAuditCard}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📜</Text>
              <Text style={styles.emptyTitle}>Sistem Logu Bulunamadı</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredAssignments}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderAssignmentCard}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Zimmet Kaydı Bulunamadı</Text>
            </View>
          }
        />
      )}

      {/* New Assign Modal */}
      <Modal
        visible={assignModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💼 Yeni Zimmet Verme</Text>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.label}>1. Zimmetlenecek Cihazı Seçin (Depoda Boşta):</Text>
              {unassignedAssets.length === 0 ? (
                <Text style={styles.noAssetWarning}>⚠️ Depoda boşta cihaz bulunmuyor.</Text>
              ) : (
                <ScrollView style={{ maxHeight: 120, marginBottom: spacing.sm }}>
                  {unassignedAssets.map((a) => (
                    <TouchableOpacity
                      key={a.id}
                      style={[
                        styles.selectRow,
                        selectedAssetId === String(a.id) && styles.selectRowActive
                      ]}
                      onPress={() => setSelectedAssetId(String(a.id))}
                    >
                      <Text style={styles.selectRowTitle}>{a.name}</Text>
                      <Text style={styles.selectRowSub}>{a.asset_code} • {a.category}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Text style={styles.label}>2. Teslim Edilecek Personel:</Text>
              <ScrollView style={{ maxHeight: 120, marginBottom: spacing.sm }}>
                {usersList.map((u) => (
                  <TouchableOpacity
                    key={u.id}
                    style={[
                      styles.selectRow,
                      selectedUserId === String(u.id) && styles.selectRowActive
                    ]}
                    onPress={() => setSelectedUserId(String(u.id))}
                  >
                    <Text style={styles.selectRowTitle}>{u.full_name}</Text>
                    <Text style={styles.selectRowSub}>{u.department} ({u.email})</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Zimmet Açıklaması / Not:</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  placeholder="Örn: Çalışma amacıyla teslim edildi..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  value={assignNotes}
                  onChangeText={setAssignNotes}
                />
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAssignModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.statusZimmetli }]}
                onPress={handleConfirmAssign}
                disabled={assignLoading || unassignedAssets.length === 0}
              >
                {assignLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Zimmeti Onayla</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Return Modal */}
      <Modal
        visible={Boolean(returnModalItem)}
        transparent
        animationType="slide"
        onRequestClose={() => setReturnModalItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔄 Zimmet İade Al</Text>
              <TouchableOpacity onPress={() => setReturnModalItem(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {returnModalItem && (
              <Text style={styles.modalDesc}>
                {returnModalItem.asset_name} ({returnModalItem.asset_code}) cihazını {returnModalItem.user_name} personelinden teslim alıyorsunuz.
              </Text>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cihazın İade Sonrası Durumu:</Text>
              <View style={styles.statusSelectRow}>
                {[
                  { key: 'depoda', label: 'Depoda (Sağlam)', color: colors.statusDepoda },
                  { key: 'bakimda', label: 'Bakımda / Kontrol', color: colors.statusBakimda },
                  { key: 'arizali', label: 'Arızalı', color: colors.statusArizali }
                ].map((s) => (
                  <TouchableOpacity
                    key={s.key}
                    style={[
                      styles.statusSelectBtn,
                      returnStatus === s.key && { backgroundColor: s.color }
                    ]}
                    onPress={() => setReturnStatus(s.key)}
                  >
                    <Text
                      style={[
                        styles.statusSelectText,
                        returnStatus === s.key && { color: '#fff', fontWeight: '700' }
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>İade Kontrol Notu:</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Örn: Cihaz ve adaptör eksiksiz alındı..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={returnNotes}
                onChangeText={setReturnNotes}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setReturnModalItem(null)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleConfirmReturn}
                disabled={returnLoading}
              >
                {returnLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>İadeyi Tamamla</Text>
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
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary
  },
  tabBtnTextActive: {
    color: '#fff',
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
    marginBottom: spacing.md,
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  codeBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm
  },
  codeText: {
    color: colors.accentCyan,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
    marginBottom: 6,
    flexWrap: 'wrap'
  },
  personnelBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 6
  },
  personnelLabel: {
    fontSize: 11,
    color: colors.accentCyan,
    fontWeight: '700',
    marginBottom: 2
  },
  personnelName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    flexWrap: 'wrap'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  infoKey: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 8
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 1,
    textAlign: 'right'
  },
  notesBox: {
    backgroundColor: colors.bgSurfaceSubtle,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.xs
  },
  notesText: {
    fontSize: 12,
    color: colors.textSecondary
  },
  actionRow: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
    paddingTop: spacing.sm,
    alignItems: 'flex-end'
  },
  returnBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm
  },
  returnBtnText: {
    color: colors.accentCyan,
    fontWeight: '700',
    fontSize: 12
  },
  auditCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  auditAction: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentCyan
  },
  auditDate: {
    fontSize: 11,
    color: colors.textMuted
  },
  auditDetails: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2
  },
  auditUser: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic'
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 6
  },
  noAssetWarning: {
    color: colors.warning,
    fontSize: 12,
    marginVertical: 4
  },
  selectRow: {
    padding: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSurfaceSubtle,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  selectRowActive: {
    borderColor: colors.accentCyan,
    backgroundColor: 'rgba(56, 189, 248, 0.15)'
  },
  selectRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary
  },
  selectRowSub: {
    fontSize: 11,
    color: colors.textSecondary
  },
  inputGroup: {
    marginVertical: spacing.xs
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
  statusSelectRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap'
  },
  statusSelectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  statusSelectText: {
    fontSize: 11,
    color: colors.textSecondary
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
