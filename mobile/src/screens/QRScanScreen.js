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
  Modal
} from 'react-native';
import { mobileApi } from '../services/api';
import { colors, radius, spacing } from '../styles/theme';

export default function QRScanScreen() {
  const [scanInput, setScanInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannedAsset, setScannedAsset] = useState(null);

  // Field action modals
  const [actionModalType, setActionModalType] = useState(null); // 'assign' | 'return' | 'fault'
  const [actionNotes, setActionNotes] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [submittingAction, setSubmittingAction] = useState(false);

  const handleScanOrSearch = async (query) => {
    const q = (query || scanInput).trim();
    if (!q) {
      Alert.alert('Uyarı', 'Lütfen taranan QR içeriğini veya demirbaş kodunu giriniz.');
      return;
    }

    setLoading(true);
    try {
      let code = q;
      try {
        const parsed = JSON.parse(q);
        if (parsed.code) code = parsed.code;
        else if (parsed.serial) code = parsed.serial;
      } catch (e) {}

      const res = await mobileApi.getAssetById(code);
      setScannedAsset(res.data);
    } catch (err) {
      Alert.alert('Bulunamadı', 'Bu QR veya koda ait demirbaş bulunamadı.');
      setScannedAsset(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = async () => {
    try {
      const res = await mobileApi.getUsers({ limit: 50 });
      setUsersList(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedUserId(res.data[0].id.toString());
      }
      setActionNotes('Sahada personele teslim edildi.');
      setActionModalType('assign');
    } catch (err) {
      Alert.alert('Hata', 'Kullanıcı listesi alınamadı.');
    }
  };

  const handleOpenReturn = () => {
    setActionNotes('Sahada personelden teslim alındı.');
    setActionModalType('return');
  };

  const handleOpenFault = () => {
    setActionNotes('');
    setActionModalType('fault');
  };

  const submitFieldAction = async () => {
    if (!scannedAsset) return;
    setSubmittingAction(true);

    try {
      if (actionModalType === 'assign') {
        await mobileApi.assignAsset({
          asset_id: scannedAsset.id,
          user_id: parseInt(selectedUserId),
          handover_notes: actionNotes
        });
        Alert.alert('Başarılı', 'Cihaz başarıyla personele teslim edildi.');
      } else if (actionModalType === 'return') {
        await mobileApi.returnAsset({
          asset_id: scannedAsset.id,
          return_condition: 'depoda',
          return_notes: actionNotes
        });
        Alert.alert('Başarılı', 'Cihaz başarıyla geri kabul edildi.');
      } else if (actionModalType === 'fault') {
        await mobileApi.reportFault(scannedAsset.id, {
          fault_description: actionNotes || 'Sahada arıza bildirimi yapıldı.'
        });
        Alert.alert('Başarılı', 'Arıza durumu bildirildi.');
      }

      setActionModalType(null);
      // Refresh scanned asset
      handleScanOrSearch(scannedAsset.asset_code);
    } catch (err) {
      Alert.alert('İşlem Başarısız', err.message || 'İşlem gerçekleştirilemedi.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📷 Saha QR & Barkod Okuyucu</Text>
      <Text style={styles.subtitle}>Cihaz üzerindeki etiketi okutun veya test için seçim yapın</Text>

      {/* Camera Simulator & Input */}
      <View style={styles.scannerCard}>
        <View style={styles.cameraBox}>
          <Text style={styles.cameraCrosshair}>[ ⛶ ]</Text>
          <Text style={styles.cameraText}>Kamera Vizörü (Saha Modu Aktif)</Text>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="DMB-2026-001 veya QR verisi"
            placeholderTextColor={colors.textMuted}
            value={scanInput}
            onChangeText={setScanInput}
          />
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={() => handleScanOrSearch()}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.scanBtnText}>Sorgula</Text>}
          </TouchableOpacity>
        </View>

        {/* Demo Fast Scan Buttons */}
        <Text style={styles.demoPrompt}>Hızlı Saha Simülasyonu:</Text>
        <View style={styles.demoBtnRow}>
          <TouchableOpacity
            style={styles.demoChip}
            onPress={() => {
              setScanInput('DMB-2026-001');
              handleScanOrSearch('DMB-2026-001');
            }}
          >
            <Text style={styles.demoChipText}>💻 MacBook Pro</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoChip}
            onPress={() => {
              setScanInput('DMB-2026-005');
              handleScanOrSearch('DMB-2026-005');
            }}
          >
            <Text style={styles.demoChipText}>🖥️ LG Monitör</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.demoChip}
            onPress={() => {
              setScanInput('DMB-2026-008');
              handleScanOrSearch('DMB-2026-008');
            }}
          >
            <Text style={styles.demoChipText}>🖨️ HP Yazıcı</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scanned Asset Details Card */}
      {scannedAsset && (
        <View style={styles.assetCard}>
          <View style={styles.assetHeader}>
            <View>
              <Text style={styles.assetCode}>{scannedAsset.asset_code}</Text>
              <Text style={styles.assetName}>{scannedAsset.name}</Text>
              <Text style={styles.assetModel}>{scannedAsset.brand} - {scannedAsset.model}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: scannedAsset.status === 'zimmetli' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)' }]}>
              <Text style={[styles.statusText, { color: scannedAsset.status === 'zimmetli' ? colors.statusZimmetli : colors.statusDepoda }]}>
                {scannedAsset.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Seri No:</Text>
              <Text style={styles.detailValue}>{scannedAsset.serial_number}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Kategori:</Text>
              <Text style={styles.detailValue}>{scannedAsset.category}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Alım Tarihi:</Text>
              <Text style={styles.detailValue}>{scannedAsset.purchase_date || '—'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Garanti Bitiş:</Text>
              <Text style={styles.detailValue}>{scannedAsset.warranty_end_date || '—'}</Text>
            </View>
          </View>

          <View style={styles.custodyBox}>
            <Text style={styles.custodyLabel}>Mevcut Zimmetli Personel:</Text>
            <Text style={styles.custodyValue}>
              {scannedAsset.assigned_user_name
                ? `👤 ${scannedAsset.assigned_user_name} (${scannedAsset.assigned_user_department || 'Birim Yok'})`
                : '📦 Depoda Boşta Bekliyor'}
            </Text>
          </View>

          {/* Quick Field Actions (Personele Teslim Et, Cihazı Geri Kabul Et, Arıza Bildir) */}
          <Text style={styles.actionSectionTitle}>⚡ Hızlı Saha İşlemleri:</Text>
          <View style={styles.actionBtnRow}>
            {scannedAsset.status !== 'zimmetli' ? (
              <TouchableOpacity style={styles.btnAssign} onPress={handleOpenAssign}>
                <Text style={styles.btnAssignText}>Personele Teslim Et</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btnReturn} onPress={handleOpenReturn}>
                <Text style={styles.btnReturnText}>Cihazı Geri Kabul Et</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.btnFault} onPress={handleOpenFault}>
              <Text style={styles.btnFaultText}>Arıza Bildir</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Field Action Modal */}
      <Modal
        visible={Boolean(actionModalType)}
        transparent
        animationType="slide"
        onRequestClose={() => setActionModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {actionModalType === 'assign' && 'Personele Teslim Et (Zimmetle)'}
              {actionModalType === 'return' && 'Cihazı Geri Kabul Et'}
              {actionModalType === 'fault' && 'Arıza Durumu Bildir'}
            </Text>

            {actionModalType === 'assign' && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.label}>Teslim Edilecek Personel:</Text>
                {usersList.map((u) => (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.userOption, selectedUserId === u.id.toString() && styles.userOptionActive]}
                    onPress={() => setSelectedUserId(u.id.toString())}
                  >
                    <Text style={[styles.userOptionText, selectedUserId === u.id.toString() && styles.userOptionTextActive]}>
                      {u.full_name} ({u.department})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>
              {actionModalType === 'fault' ? 'Arıza Açıklaması *' : 'İşlem Notu:'}
            </Text>
            <TextInput
              style={[styles.input, { minHeight: 70 }]}
              multiline
              value={actionNotes}
              onChangeText={setActionNotes}
              placeholder={actionModalType === 'fault' ? 'Arıza belirtilerini yazınız...' : 'Not...'}
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setActionModalType(null)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={submitFieldAction}
                disabled={submittingAction}
              >
                {submittingAction ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Onayla ve Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md
  },
  scannerCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.md
  },
  cameraBox: {
    height: 120,
    backgroundColor: colors.bgSurfaceSubtle,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.borderHighlight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md
  },
  cameraCrosshair: {
    fontSize: 32,
    color: colors.accentCyan,
    marginBottom: 4
  },
  cameraText: {
    fontSize: 11,
    color: colors.textMuted
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.bgSurfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13
  },
  scanBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    justifyContent: 'center'
  },
  scanBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13
  },
  demoPrompt: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 6
  },
  demoBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  demoChip: {
    backgroundColor: colors.bgSurface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  demoChipText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600'
  },
  assetCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderHighlight
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  assetCode: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.accentCyan,
    fontSize: 12,
    fontWeight: '700'
  },
  assetName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2
  },
  assetModel: {
    fontSize: 12,
    color: colors.textSecondary
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 10,
    marginBottom: 10
  },
  detailItem: {
    width: '50%',
    marginBottom: 8
  },
  detailLabel: {
    fontSize: 10,
    color: colors.textMuted
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary
  },
  custodyBox: {
    backgroundColor: colors.bgSurfaceSubtle,
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 14
  },
  custodyLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2
  },
  custodyValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentCyan
  },
  actionSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 8
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8
  },
  btnAssign: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: radius.md,
    alignItems: 'center'
  },
  btnAssignText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12
  },
  btnReturn: {
    flex: 1,
    backgroundColor: colors.statusZimmetli,
    paddingVertical: 11,
    borderRadius: radius.md,
    alignItems: 'center'
  },
  btnReturnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12
  },
  btnFault: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: colors.statusArizali,
    paddingVertical: 11,
    borderRadius: radius.md,
    alignItems: 'center'
  },
  btnFaultText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 12
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.md
  },
  modalCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 14
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600'
  },
  input: {
    backgroundColor: colors.bgSurfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    color: colors.textPrimary,
    padding: 10,
    fontSize: 13,
    marginBottom: 14
  },
  userOption: {
    padding: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSurfaceSubtle,
    marginBottom: 4
  },
  userOptionActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.accentCyan,
    borderWidth: 1
  },
  userOptionText: {
    fontSize: 12,
    color: colors.textSecondary
  },
  userOptionTextActive: {
    color: colors.accentCyan,
    fontWeight: '700'
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center'
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: '600'
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center'
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: '700'
  }
});
