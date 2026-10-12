import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { mobileApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing } from '../styles/theme';

export default function DashboardScreen({ onNavigateTab }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await mobileApi.getDashboardStats();
      setStats(res.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} />}
    >
      {/* User Header */}
      <View style={styles.userBar}>
        <View>
          <Text style={styles.userName}>{user?.full_name}</Text>
          <Text style={styles.userDept}>{user?.department || 'Genel Personel'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards Grid */}
      <View style={styles.grid}>
        <View style={[styles.kpiCard, { borderColor: colors.accentCyan }]}>
          <Text style={styles.kpiVal}>{stats?.totalAssets ?? '—'}</Text>
          <Text style={styles.kpiLbl}>Toplam Donanım</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: colors.statusZimmetli }]}>
          <Text style={[styles.kpiVal, { color: colors.statusZimmetli }]}>
            {stats?.assignedAssets ?? '—'}
          </Text>
          <Text style={styles.kpiLbl}>Zimmetli Cihaz</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: colors.statusDepoda }]}>
          <Text style={[styles.kpiVal, { color: colors.statusDepoda }]}>
            {stats?.idleAssets ?? '—'}
          </Text>
          <Text style={styles.kpiLbl}>Depoda Boşta</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: colors.statusArizali }]}>
          <Text style={[styles.kpiVal, { color: colors.statusArizali }]}>
            {stats?.faultyAssets ?? '—'}
          </Text>
          <Text style={styles.kpiLbl}>Arızalı Donanım</Text>
        </View>
      </View>

      {/* Quick Action Navigation Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onNavigateTab && onNavigateTab('scan')}
        >
          <Text style={styles.actionBtnIcon}>📷</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionBtnTitle}>QR Kod Okut & Cihaz Tanı</Text>
            <Text style={styles.actionBtnSub}>Cihaz detaylarını gör ve sahada hızlı teslim/iade yap</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onNavigateTab && onNavigateTab('my')}
        >
          <Text style={styles.actionBtnIcon}>💼</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionBtnTitle}>Kişisel Zimmetlerimi İncele</Text>
            <Text style={styles.actionBtnSub}>Üzerinizdeki zimmetli cihazlar ve arıza bildirimleri</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Recent Activity List */}
      <Text style={styles.sectionTitle}>Son Sistem Hareketleri</Text>
      <View style={styles.activityCard}>
        {stats?.recentLogs?.slice(0, 5).map((log) => (
          <View key={log.id} style={styles.logRow}>
            <View style={styles.logDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.logText}>{log.details}</Text>
              <Text style={styles.logTime}>
                {new Date(log.created_at).toLocaleString('tr-TR')}
              </Text>
            </View>
          </View>
        ))}
      </View>
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
  userBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.md
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  userDept: {
    fontSize: 12,
    color: colors.textSecondary
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  logoutBtnText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '700'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.md
  },
  kpiCard: {
    width: '48%',
    backgroundColor: colors.bgCard,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  kpiVal: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2
  },
  kpiLbl: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  actionSection: {
    gap: 10,
    marginBottom: spacing.md
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    gap: 12
  },
  actionBtnIcon: {
    fontSize: 26
  },
  actionBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  actionBtnSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8
  },
  activityCard: {
    backgroundColor: colors.bgCard,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentCyan,
    marginTop: 4
  },
  logText: {
    fontSize: 12,
    color: colors.textPrimary
  },
  logTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2
  }
});
