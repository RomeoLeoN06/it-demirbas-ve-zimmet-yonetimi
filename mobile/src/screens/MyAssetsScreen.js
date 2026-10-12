import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { mobileApi } from '../services/api';
import { colors, radius, spacing } from '../styles/theme';

export default function MyAssetsScreen() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyAssets = async () => {
    setLoading(true);
    try {
      const res = await mobileApi.getMyAssets();
      setAssets(res.data || []);
    } catch (err) {
      Alert.alert('Hata', 'Zimmetli cihazlarınız alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAssets();
  }, []);

  const handleReportFault = (asset) => {
    Alert.prompt
      ? Alert.prompt(
          'Arıza Bildir',
          `"${asset.name}" için arıza açıklamasını giriniz:`,
          async (text) => {
            if (!text) return;
            try {
              await mobileApi.reportFault(asset.id, { fault_description: text });
              Alert.alert('Başarılı', 'Arıza bildirimi iletildi.');
              fetchMyAssets();
            } catch (e) {
              Alert.alert('Hata', 'Bildirim kaydedilemedi.');
            }
          }
        )
      : Alert.alert(
          'Arıza Bildirimi',
          `"${asset.name}" cihazında arıza bildirmek istiyor musunuz?`,
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Arızayı Bildir',
              style: 'destructive',
              onPress: async () => {
                try {
                  await mobileApi.reportFault(asset.id, {
                    fault_description: 'Mobil uygulama üzerinden arıza bildirildi.'
                  });
                  Alert.alert('Başarılı', 'Arıza bildirimi kaydedildi.');
                  fetchMyAssets();
                } catch (e) {
                  Alert.alert('Hata', 'Bildirim kaydedilemedi.');
                }
              }
            }
          ]
        );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.code}>{item.asset_code}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ZİMMETLİ</Text>
        </View>
      </View>

      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.model}>{item.brand} - {item.model} ({item.category})</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Seri No: {item.serial_number}</Text>
        <Text style={styles.infoText}>
          Teslim Tarihi: {item.assigned_date ? new Date(item.assigned_date).toLocaleDateString('tr-TR') : '—'}
        </Text>
        <Text style={styles.infoText}>Garanti: {item.warranty_end_date || 'Belirtilmemiş'}</Text>
      </View>

      <TouchableOpacity
        style={styles.faultBtn}
        onPress={() => handleReportFault(item)}
      >
        <Text style={styles.faultBtnText}>⚠️ Arıza Durumu Bildir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👤 Kişisel Zimmetli Cihazlarım</Text>
        <Text style={styles.subtitle}>Üzerinize tahsis edilmiş aktif IT donanımları</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : assets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Zimmetli Cihazınız Bulunmuyor</Text>
          <Text style={styles.emptySub}>Şu an adınıza tahsis edilmiş bir donanım yoktur.</Text>
        </View>
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchMyAssets}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain
  },
  header: {
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  list: {
    padding: spacing.md
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.accentCyan,
    fontSize: 12,
    fontWeight: '700'
  },
  badge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full
  },
  badgeText: {
    color: colors.statusZimmetli,
    fontSize: 9,
    fontWeight: '800'
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2
  },
  model: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10
  },
  infoBox: {
    backgroundColor: colors.bgSurfaceSubtle,
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 12,
    gap: 4
  },
  infoText: {
    fontSize: 11,
    color: colors.textSecondary
  },
  faultBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: colors.statusArizali,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center'
  },
  faultBtnText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 12
  },
  emptyCard: {
    backgroundColor: colors.bgCard,
    margin: spacing.md,
    borderRadius: radius.lg,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center'
  }
});
