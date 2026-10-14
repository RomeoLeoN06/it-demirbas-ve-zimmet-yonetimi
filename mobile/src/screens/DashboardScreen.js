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
  const { user, isAdmin, logout } = useAuth();
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
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user?.full_name}</Text>
          <Text style={styles.userDept}>
            {user?.department || 'Genel Personel'} • {user?.role === 'admin' ? 'Yönetici' : 'Personel'}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards Grid */}
      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.kpiCard, { borderColor: colors.accentCyan }]}
          onPress={() => onNavigateTab && onNavigateTab('assets')}
        >
          <Text style={styles.kpiVal}>{stats?.totalAssets ?? '—'}</Text>
          <Text style={styles.kpiLbl}>Toplam Donanım ➜</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.kpiCard, { borderColor: colors.statusZimmetli }]}
          onPress={() => onNavigateTab && onNavigateTab(isAdmin ? 'assignments' : 'my')}
        >
          <Text style={[styles.kpiVal, { color: colors.statusZimmetli }]}>
            {stats?.assignedAssets ?? '—'}
          </Text>
          <Text style={styles.kpiLbl}>Zimmetli Cihaz ➜</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.kpiCard, { borderColor: colors.statusDepoda }]}
          onPress={() => onNavigateTab && onNavigateTab('assets')}
        >
          <Text style={[styles.kpiVal, { color: colors.statusDepoda }]}>
            {stats?.idleAssets ?? '—'}
          </Text>
          <Text style={styles.kpiLbl}>Depoda Boşta ➜</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.kpiCard, { borderColor: colors.statusArizali }]}
          onPress={() => onNavigateTab && onNavigateTab('assets')}
        >
          <Text style={[styles.kpiVal, { color: colors.statusArizali }]}>
            {stats?.faultyAssets ?? '—'}
          </Text>
          <Text style={styles.kpiLbl}>Arızalı Donanım ➜</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Navigation Grid */}
      <Text style={styles.sectionTitle}>Hızlı Erişim & İşlemler</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionGridItem}
          onPress={() => onNavigateTab && onNavigateTab('assets')}
        >
          <Text style={styles.actionGridIcon}>📦</Text>
          <Text style={styles.actionGridTitle}>Demirbaşlar</Text>
          <Text style={styles.actionGridSub}>Envanter Listesi</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={styles.actionGridItem}
            onPress={() => onNavigateTab && onNavigateTab('assignments')}
          >
            <Text style={styles.actionGridIcon}>📋</Text>
            <Text style={styles.actionGridTitle}>Zimmetler</Text>
            <Text style={styles.actionGridSub}>Teslim & İadeler</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionGridItem}
          onPress={() => onNavigateTab && onNavigateTab('scan')}
        >
          <Text style={styles.actionGridIcon}>📷</Text>
          <Text style={styles.actionGridTitle}>QR & Barkod</Text>
          <Text style={styles.actionGridSub}>Saha Cihaz Tanı</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionGridItem}
          onPress={() => onNavigateTab && onNavigateTab('my')}
        >
          <Text style={styles.actionGridIcon}>💼</Text>
          <Text style={styles.actionGridTitle}>Zimmetlerim</Text>
          <Text style={styles.actionGridSub}>Kişisel Cihazlar</Text>
        </TouchableOpacity>

        {isAdmin && (
          <>
            <TouchableOpacity
              style={styles.actionGridItem}
              onPress={() => onNavigateTab && onNavigateTab('users')}
            >
              <Text style={styles.actionGridIcon}>👥</Text>
              <Text style={styles.actionGridTitle}>Kullanıcılar</Text>
              <Text style={styles.actionGridSub}>Personel Yönetimi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionGridItem}
              onPress={() => onNavigateTab && onNavigateTab('departments')}
            >
              <Text style={styles.actionGridIcon}>🏢</Text>
              <Text style={styles.actionGridTitle}>Birimler</Text>
              <Text style={styles.actionGridSub}>Departman & Roller</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.actionGridItem}
          onPress={() => onNavigateTab && onNavigateTab('profile')}
        >
          <Text style={styles.actionGridIcon}>⚙️</Text>
          <Text style={styles.actionGridTitle}>Profil & Ayar</Text>
          <Text style={styles.actionGridSub}>Hesap & Şifre</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity List */}
      <Text style={styles.sectionTitle}>Son Sistem Hareketleri</Text>
      <View style={styles.activityCard}>
        {stats?.recentLogs && stats.recentLogs.length > 0 ? (
          stats.recentLogs.slice(0, 6).map((log) => (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.logDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.logText}>{log.details}</Text>
                <Text style={styles.logTime}>
                  {new Date(log.created_at).toLocaleString('tr-TR')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyLogsText}>Henüz sistem hareketi kaydedilmemiş.</Text>
        )}
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
    paddingBottom: 60
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
    color: colors.textSecondary,
    marginTop: 2
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 10,
    marginTop: 6
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.md
  },
  actionGridItem: {
    width: '31%',
    backgroundColor: colors.bgCard,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center'
  },
  actionGridIcon: {
    fontSize: 24,
    marginBottom: 6
  },
  actionGridTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center'
  },
  actionGridSub: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2
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
  },
  emptyLogsText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10
  }
});
