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

const CATEGORIES = [
  'Tümü',
  'Bilgisayar',
  'Monitör',
  'Sunucu',
  'Ağ Cihazı',
  'Yazıcı',
  'Tablet',
  'Telefon',
  'Diğer'
];

const STATUSES = [
  { key: '', label: 'Tümü' },
  { key: 'depoda', label: 'Depoda', color: colors.statusDepoda },
  { key: 'zimmetli', label: 'Zimmetli', color: colors.statusZimmetli },
  { key: 'arizali', label: 'Arızalı', color: colors.statusArizali },
  { key: 'bakimda', label: 'Bakımda', color: colors.statusBakimda }
];

export default function AssetsScreen() {
  const { user, isAdmin } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tümü');

  // Modals
  const [assetModalVisible, setAssetModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [modalForm, setModalForm] = useState({
    name: '',
    category: 'Bilgisayar',
    brand: '',
    model: '',
    serial_number: '',
    status: 'depoda',
    notes: ''
  });
  const [modalSaving, setModalSaving] = useState(false);

  // Detail / QR Modal
  const [detailModalAsset, setDetailModalAsset] = useState(null);

  // Quick Action Modals
  const [assignModalAsset, setAssignModalAsset] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  // Return Modal
  const [returnModalAsset, setReturnModalAsset] = useState(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [returnStatus, setReturnStatus] = useState('depoda');
  const [returnLoading, setReturnLoading] = useState(false);

  // Fault Modal
  const [faultModalAsset, setFaultModalAsset] = useState(null);
  const [faultDescription, setFaultDescription] = useState('');
  const [faultLoading, setFaultLoading] = useState(false);

  const fetchAssets = useCallback(async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter && categoryFilter !== 'Tümü') params.category = categoryFilter;

      const res = await mobileApi.getAssets(params);
      setAssets(res.data || []);
    } catch (err) {
      Alert.alert('Hata', err.message || 'Demirbaş listesi yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssets();
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingAsset(null);
    setModalForm({
      name: '',
      category: 'Bilgisayar',
      brand: '',
      model: '',
      serial_number: '',
      status: 'depoda',
      notes: ''
    });
    setAssetModalVisible(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (asset) => {
    setEditingAsset(asset);
    setModalForm({
      name: asset.name || '',
      category: asset.category || 'Bilgisayar',
      brand: asset.brand || '',
      model: asset.model || '',
      serial_number: asset.serial_number || '',
      status: asset.status || 'depoda',
      notes: asset.notes || ''
    });
    setAssetModalVisible(true);
  };

  // Save (Create or Update)
  const handleSaveAsset = async () => {
    if (!modalForm.name || !modalForm.serial_number) {
      Alert.alert('Uyarı', 'Demirbaş adı ve Seri No alanları zorunludur.');
      return;
    }

    setModalSaving(true);
    try {
      if (editingAsset) {
        await mobileApi.updateAsset(editingAsset.id, modalForm);
        Alert.alert('Başarılı', 'Demirbaş güncellendi.');
      } else {
        await mobileApi.createAsset(modalForm);
        Alert.alert('Başarılı', 'Yeni demirbaş envantere eklendi.');
      }
      setAssetModalVisible(false);
      fetchAssets();
    } catch (err) {
      Alert.alert('Hata', err.message || 'Kayıt işlemi başarısız.');
    } finally {
      setModalSaving(false);
    }
  };

  // Delete
  const handleDeleteAsset = (asset) => {
    Alert.alert(
      'Demirbaş Silinecek',
      `"${asset.name}" (${asset.asset_code}) silinecek. Emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await mobileApi.deleteAsset(asset.id);
              Alert.alert('Bilgi', 'Demirbaş silindi.');
              fetchAssets();
            } catch (err) {
              Alert.alert('Hata', err.message || 'Silme işlemi başarısız.');
            }
          }
        }
      ]
    );
  };

  // Open Assign Modal
  const handleOpenAssign = async (asset) => {
    setAssignModalAsset(asset);
    setAssignNotes('');
    try {
      const res = await mobileApi.getUsers();
      setUsersList(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedUserId(String(res.data[0].id));
      }
    } catch (e) {}
  };

  // Submit Assign
  const handleConfirmAssign = async () => {
    if (!selectedUserId) {
      Alert.alert('Uyarı', 'Lütfen zimmetlenecek personeli seçiniz.');
      return;
    }
    setAssignLoading(true);
    try {
      await mobileApi.assignAsset({
        asset_id: assignModalAsset.id,
        user_id: parseInt(selectedUserId, 10),
        notes: assignNotes
      });
      Alert.alert('Başarılı', 'Demirbaş personele zimmetlendi.');
      setAssignModalAsset(null);
      fetchAssets();
    } catch (err) {
      Alert.alert('Hata', err.message || 'Zimmetleme başarısız.');
    } finally {
      setAssignLoading(false);
    }
  };

  // Open Return Modal
  const handleOpenReturn = (asset) => {
    setReturnModalAsset(asset);
    setReturnNotes('');
    setReturnStatus('depoda');
  };

  // Submit Return
  const handleConfirmReturn = async () => {
    setReturnLoading(false);
    try {
      await mobileApi.returnAsset({
        asset_id: returnModalAsset.id,
        new_status: returnStatus,
        notes: returnNotes
      });
      Alert.alert('Başarılı', 'Demirbaş başarıyla depoya iade alındı.');
      setReturnModalAsset(null);
      fetchAssets();
    } catch (err) {
      Alert.alert('Hata', err.message || 'İade alma başarısız.');
    } finally {
      setReturnLoading(false);
    }
  };

  // Open Fault Modal
  const handleOpenFault = (asset) => {
    setFaultModalAsset(asset);
    setFaultDescription('');
  };

  // Submit Fault
  const handleConfirmFault = async () => {
    if (!faultDescription.trim()) {
      Alert.alert('Uyarı', 'Lütfen arıza detayını yazınız.');
      return;
    }
    setFaultLoading(true);
    try {
      await mobileApi.reportFault(faultModalAsset.id, {
        description: faultDescription,
        priority: 'high'
      });
      Alert.alert('Başarılı', 'Arıza kaydı açıldı, cihaz arızalı durumuna alındı.');
      setFaultModalAsset(null);
      fetchAssets();
    } catch (err) {
      Alert.alert('Hata', err.message || 'Arıza bildirilemedi.');
    } finally {
      setFaultLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'depoda': return colors.statusDepoda;
      case 'zimmetli': return colors.statusZimmetli;
      case 'arizali': return colors.statusArizali;
      case 'bakimda': return colors.statusBakimda;
      default: return colors.statusHurda;
    }
  };

  const renderAssetItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.assetCard}>
        {/* Top row */}
        <View style={styles.cardHeader}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{item.asset_code}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '25', borderColor: statusColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Title & Category */}
        <Text style={styles.assetName}>{item.name}</Text>
        <Text style={styles.assetMeta}>
          📂 {item.category} • 🏷️ {item.brand || '-'} {item.model || ''}
        </Text>
        <Text style={styles.assetSerial}>
          🔢 Seri No: <Text style={styles.monoText}>{item.serial_number}</Text>
        </Text>

        {/* Status detail box */}
        {item.status === 'zimmetli' ? (
          <View style={styles.assignedBox}>
            <Text style={styles.assignedLabel}>👤 Zimmetli Personel:</Text>
            <Text style={styles.assignedValue} numberOfLines={2}>
              {item.assigned_to_user_name || item.assigned_user_name || item.user_name || 'Personel Zimmetinde'}
            </Text>
          </View>
        ) : item.status === 'depoda' ? (
          <View style={styles.unassignedBox}>
            <Text style={styles.unassignedText}>📦 Depoda Boşta (Zimmetsiz)</Text>
          </View>
        ) : item.status === 'arizali' ? (
          <View style={[styles.unassignedBox, { borderColor: 'rgba(239, 68, 68, 0.4)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Text style={[styles.unassignedText, { color: colors.danger }]}>⚠️ Cihaz Arızada / Teknik Serviste</Text>
          </View>
        ) : item.status === 'bakimda' ? (
          <View style={[styles.unassignedBox, { borderColor: 'rgba(245, 158, 11, 0.4)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <Text style={[styles.unassignedText, { color: colors.warning }]}>🔧 Periyodik Bakımda</Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setDetailModalAsset(item)}
          >
            <Text style={styles.actionBtnText}>👁️ Detay</Text>
          </TouchableOpacity>

          {isAdmin && item.status === 'depoda' ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnAssign]}
              onPress={() => handleOpenAssign(item)}
            >
              <Text style={[styles.actionBtnText, { color: colors.statusZimmetli }]}>
                💼 Zimmetle
              </Text>
            </TouchableOpacity>
          ) : isAdmin && item.status === 'zimmetli' ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnReturn]}
              onPress={() => handleOpenReturn(item)}
            >
              <Text style={[styles.actionBtnText, { color: colors.statusDepoda }]}>
                🔄 İade Al
              </Text>
            </TouchableOpacity>
          ) : null}

          {item.status !== 'arizali' && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleOpenFault(item)}
            >
              <Text style={[styles.actionBtnText, { color: colors.danger }]}>
                ⚠️ Arıza
              </Text>
            </TouchableOpacity>
          )}

          {isAdmin && (
            <>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleOpenEdit(item)}
              >
                <Text style={styles.actionBtnText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleDeleteAsset(item)}
              >
                <Text style={[styles.actionBtnText, { color: colors.danger }]}>🗑️</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.pageTitle}>Demirbaş Envanteri</Text>
          <Text style={styles.pageSubtitle}>{assets.length} Adet Kayıtlı Cihaz</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreate}>
            <Text style={styles.addBtnText}>➕ Yeni Cihaz</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Demirbaş adı, kod, seri no veya marka ara..."
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

      {/* Filter Chips - Status */}
      <View style={styles.chipsRowContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContent}
        >
          {STATUSES.map((st) => (
            <TouchableOpacity
              key={st.key}
              style={[
                styles.chip,
                statusFilter === st.key && styles.chipActive,
                st.color && statusFilter === st.key && { borderColor: st.color }
              ]}
              onPress={() => setStatusFilter(st.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  statusFilter === st.key && styles.chipTextActive,
                  st.color && statusFilter === st.key && { color: st.color }
                ]}
              >
                {st.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter Chips - Categories */}
      <View style={styles.chipsRowContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catChip,
                categoryFilter === cat && styles.catChipActive
              ]}
              onPress={() => setCategoryFilter(cat)}
            >
              <Text
                style={[
                  styles.catChipText,
                  categoryFilter === cat && styles.catChipTextActive
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.accentCyan} />
          <Text style={styles.loadingText}>Demirbaşlar yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderAssetItem}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>Kayıtlı Demirbaş Bulunamadı</Text>
              <Text style={styles.emptyDesc}>Arama veya filtre kriterlerinizi değiştirebilirsiniz.</Text>
            </View>
          }
        />
      )}

      {/* Detail / QR Modal */}
      <Modal
        visible={Boolean(detailModalAsset)}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalAsset(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📱 Cihaz Detayı & QR</Text>
              <TouchableOpacity onPress={() => setDetailModalAsset(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {detailModalAsset && (
              <ScrollView style={{ maxHeight: 420 }}>
                {/* QR Code representation */}
                <View style={styles.qrCodeBox}>
                  <Text style={styles.qrCodeIcon}>⬛⬜⬛</Text>
                  <Text style={styles.qrCodeText}>{detailModalAsset.asset_code}</Text>
                  <Text style={styles.qrSerialText}>SN: {detailModalAsset.serial_number}</Text>
                </View>

                <Text style={styles.detailTitle}>{detailModalAsset.name}</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Demirbaş Kodu:</Text>
                  <Text style={styles.detailVal}>{detailModalAsset.asset_code}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Kategori:</Text>
                  <Text style={styles.detailVal}>{detailModalAsset.category}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Marka / Model:</Text>
                  <Text style={styles.detailVal}>{detailModalAsset.brand} {detailModalAsset.model}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Seri Numarası:</Text>
                  <Text style={styles.detailValMono}>{detailModalAsset.serial_number}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Durum:</Text>
                  <Text style={[styles.detailVal, { color: getStatusColor(detailModalAsset.status), fontWeight: '700' }]}>
                    {detailModalAsset.status.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey}>Zimmetli Personel:</Text>
                  <Text style={styles.detailVal}>{detailModalAsset.assigned_to_user_name || 'Yok (Depoda)'}</Text>
                </View>
                {detailModalAsset.notes ? (
                  <View style={styles.detailNotesBox}>
                    <Text style={styles.detailKey}>Açıklama / Not:</Text>
                    <Text style={styles.detailNotes}>{detailModalAsset.notes}</Text>
                  </View>
                ) : null}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setDetailModalAsset(null)}
            >
              <Text style={styles.modalCloseBtnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add / Edit Asset Modal */}
      <Modal
        visible={assetModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAssetModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAsset ? '✏️ Demirbaşı Düzenle' : '➕ Yeni Demirbaş Ekle'}
              </Text>
              <TouchableOpacity onPress={() => setAssetModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Demirbaş / Cihaz Adı *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: Dell XPS 15 Laptop"
                  placeholderTextColor={colors.textMuted}
                  value={modalForm.name}
                  onChangeText={(val) => setModalForm((prev) => ({ ...prev, name: val }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kategori</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CATEGORIES.filter((c) => c !== 'Tümü').map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catChip,
                        modalForm.category === cat && styles.catChipActive
                      ]}
                      onPress={() => setModalForm((prev) => ({ ...prev, category: cat }))}
                    >
                      <Text
                        style={[
                          styles.catChipText,
                          modalForm.category === cat && styles.catChipTextActive
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Seri Numarası *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: SN-9988223"
                  placeholderTextColor={colors.textMuted}
                  value={modalForm.serial_number}
                  onChangeText={(val) => setModalForm((prev) => ({ ...prev, serial_number: val }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Marka</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: Lenovo, HP, Dell"
                  placeholderTextColor={colors.textMuted}
                  value={modalForm.brand}
                  onChangeText={(val) => setModalForm((prev) => ({ ...prev, brand: val }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Model</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: ThinkPad T14 Gen 3"
                  placeholderTextColor={colors.textMuted}
                  value={modalForm.model}
                  onChangeText={(val) => setModalForm((prev) => ({ ...prev, model: val }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cihaz Durumu</Text>
                <View style={styles.statusSelectRow}>
                  {STATUSES.filter((s) => s.key).map((st) => (
                    <TouchableOpacity
                      key={st.key}
                      style={[
                        styles.statusSelectBtn,
                        modalForm.status === st.key && { backgroundColor: st.color }
                      ]}
                      onPress={() => setModalForm((prev) => ({ ...prev, status: st.key }))}
                    >
                      <Text
                        style={[
                          styles.statusSelectText,
                          modalForm.status === st.key && { color: '#fff', fontWeight: '700' }
                        ]}
                      >
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notlar / Açıklama</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  placeholder="Cihaz hakkında ek bilgi veya zimmet notu..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  value={modalForm.notes}
                  onChangeText={(val) => setModalForm((prev) => ({ ...prev, notes: val }))}
                />
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAssetModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveAsset}
                disabled={modalSaving}
              >
                {modalSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign Modal */}
      <Modal
        visible={Boolean(assignModalAsset)}
        transparent
        animationType="slide"
        onRequestClose={() => setAssignModalAsset(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>💼 Demirbaş Zimmetle</Text>
              <TouchableOpacity onPress={() => setAssignModalAsset(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {assignModalAsset && (
              <Text style={styles.modalDesc}>
                {assignModalAsset.name} ({assignModalAsset.asset_code}) cihazını zimmetlemek için personel seçiniz:
              </Text>
            )}

            <Text style={styles.label}>Personel Seçimi:</Text>
            <ScrollView style={{ maxHeight: 160, marginBottom: spacing.md }}>
              {usersList.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={[
                    styles.userSelectRow,
                    selectedUserId === String(u.id) && styles.userSelectRowActive
                  ]}
                  onPress={() => setSelectedUserId(String(u.id))}
                >
                  <Text style={styles.userSelectName}>{u.full_name}</Text>
                  <Text style={styles.userSelectDept}>{u.department} ({u.email})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Zimmet Notu / Tutanak Açıklaması:</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Örn: Proje süresince teslim edildi..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={assignNotes}
                onChangeText={setAssignNotes}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAssignModalAsset(null)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.statusZimmetli }]}
                onPress={handleConfirmAssign}
                disabled={assignLoading}
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
        visible={Boolean(returnModalAsset)}
        transparent
        animationType="slide"
        onRequestClose={() => setReturnModalAsset(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔄 Zimmet İade Al</Text>
              <TouchableOpacity onPress={() => setReturnModalAsset(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {returnModalAsset && (
              <Text style={styles.modalDesc}>
                {returnModalAsset.name} ({returnModalAsset.asset_code}) zimmetten iade alınıyor.
              </Text>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>İade Sonrası Durum:</Text>
              <View style={styles.statusSelectRow}>
                {['depoda', 'bakimda', 'arizali'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.statusSelectBtn,
                      returnStatus === st && { backgroundColor: getStatusColor(st) }
                    ]}
                    onPress={() => setReturnStatus(st)}
                  >
                    <Text
                      style={[
                        styles.statusSelectText,
                        returnStatus === st && { color: '#fff', fontWeight: '700' }
                      ]}
                    >
                      {st.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>İade Notu / Kontrol:</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Örn: Cihaz sağlam teslim alındı..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={returnNotes}
                onChangeText={setReturnNotes}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setReturnModalAsset(null)}
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

      {/* Fault Report Modal */}
      <Modal
        visible={Boolean(faultModalAsset)}
        transparent
        animationType="slide"
        onRequestClose={() => setFaultModalAsset(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚠️ Arıza Bildir</Text>
              <TouchableOpacity onPress={() => setFaultModalAsset(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {faultModalAsset && (
              <Text style={styles.modalDesc}>
                {faultModalAsset.name} ({faultModalAsset.asset_code}) için teknik arıza bildiriminde bulunun.
              </Text>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Arıza Detayı ve Belirtiler *</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Örn: Cihaz açılmıyor, ekranda çizgiler var..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={faultDescription}
                onChangeText={setFaultDescription}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setFaultModalAsset(null)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.danger }]}
                onPress={handleConfirmFault}
                disabled={faultLoading}
              >
                {faultLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Arızayı Bildir</Text>
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
  chipsRowContainer: {
    marginVertical: 4
  },
  chipsScrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    alignItems: 'center'
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.bgSurface,
    marginRight: 8,
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
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.bgSurfaceSubtle,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  catChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight
  },
  catChipText: {
    fontSize: 12,
    color: colors.textMuted
  },
  catChipTextActive: {
    color: colors.accentCyan,
    fontWeight: '700'
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 80
  },
  assetCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.md
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  assetName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4
  },
  assetMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  assetSerial: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.textSecondary
  },
  assignedBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: radius.sm,
    padding: 8,
    marginTop: spacing.sm
  },
  assignedLabel: {
    fontSize: 11,
    color: colors.statusZimmetli,
    fontWeight: '600'
  },
  assignedValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2
  },
  unassignedBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius.sm,
    padding: 6,
    marginTop: spacing.sm
  },
  unassignedText: {
    fontSize: 11,
    color: colors.textMuted
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
    paddingTop: spacing.sm,
    flexWrap: 'wrap'
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  actionBtnAssign: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.12)'
  },
  actionBtnReturn: {
    borderColor: 'rgba(59, 130, 246, 0.4)',
    backgroundColor: 'rgba(59, 130, 246, 0.12)'
  },
  actionBtnText: {
    fontSize: 12,
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
  emptyDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
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
  },
  qrCodeBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  qrCodeIcon: {
    fontSize: 48
  },
  qrCodeText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
    marginTop: 6
  },
  qrSerialText: {
    color: '#666',
    fontSize: 12
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle
  },
  detailKey: {
    fontSize: 12,
    color: colors.textSecondary
  },
  detailVal: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600'
  },
  detailValMono: {
    fontSize: 12,
    color: colors.accentCyan,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  detailNotesBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.bgSurfaceSubtle,
    padding: spacing.sm,
    borderRadius: radius.sm
  },
  detailNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  modalCloseBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.bgSurface,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center'
  },
  modalCloseBtnText: {
    color: colors.textPrimary,
    fontWeight: '600'
  },
  userSelectRow: {
    padding: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSurfaceSubtle,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  userSelectRowActive: {
    borderColor: colors.accentCyan,
    backgroundColor: 'rgba(56, 189, 248, 0.15)'
  },
  userSelectName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary
  },
  userSelectDept: {
    fontSize: 11,
    color: colors.textSecondary
  }
});
