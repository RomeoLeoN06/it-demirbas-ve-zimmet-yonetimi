import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  ScrollView,
  Platform
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AssetsScreen from './src/screens/AssetsScreen';
import AssignmentsScreen from './src/screens/AssignmentsScreen';
import QRScanScreen from './src/screens/QRScanScreen';
import MyAssetsScreen from './src/screens/MyAssetsScreen';
import UsersScreen from './src/screens/UsersScreen';
import DepartmentsScreen from './src/screens/DepartmentsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { colors, radius, spacing } from './src/styles/theme';

const DRAWER_ITEMS = [
  {
    category: 'Ana Menü',
    items: [
      { id: 'dashboard', label: 'Gösterge Paneli', icon: '📊', color: '#38bdf8' },
      { id: 'assets', label: 'Demirbaş Envanteri', icon: '📦', color: '#10b981' },
      { id: 'scan', label: 'QR Kod & Barkod Oku', icon: '📷', color: '#c084fc' }
    ]
  },
  {
    category: 'Zimmet & Saha',
    items: [
      { id: 'my', label: 'Kişisel Zimmetlerim', icon: '💼', color: '#f59e0b', hasBadge: true }
    ]
  },
  {
    category: 'Yönetim (Admin)',
    adminOnly: true,
    items: [
      { id: 'assignments', label: 'Zimmet Yönetimi & Loglar', icon: '📋', color: '#f43f5e' },
      { id: 'users', label: 'Kullanıcı Yönetimi', icon: '👥', color: '#6366f1' },
      { id: 'departments', label: 'Departman & Rol Tanımları', icon: '🏢', color: '#8b5cf6' }
    ]
  },
  {
    category: 'Hesap',
    items: [
      { id: 'profile', label: 'Profilim ve Ayarlar', icon: '⚙️', color: '#06b6d4' }
    ]
  }
];

function MainNavigator() {
  const { user, isAdmin, logout } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Not logged in -> Switch between Login & Register
  if (!user) {
    if (authView === 'register') {
      return <RegisterScreen onNavigateLogin={() => setAuthView('login')} />;
    }
    return <LoginScreen onNavigateRegister={() => setAuthView('register')} />;
  }

  // Yetki Sınırı: Standart personelin yönetici sekmelerine erişmesini engelle
  const adminOnlyTabs = ['assignments', 'users', 'departments'];
  const safeActiveTab = (!isAdmin && adminOnlyTabs.includes(activeTab)) ? 'dashboard' : activeTab;

  const handleSelectDrawerItem = (tabId) => {
    if (!isAdmin && adminOnlyTabs.includes(tabId)) {
      setActiveTab('dashboard');
    } else {
      setActiveTab(tabId);
    }
    setDrawerOpen(false);
  };

  const getScreenTitle = () => {
    switch (safeActiveTab) {
      case 'dashboard': return 'Gösterge Paneli';
      case 'assets': return 'Demirbaş Envanteri';
      case 'scan': return 'QR & Saha Cihaz Tanı';
      case 'my': return 'Kişisel Zimmetlerim';
      case 'assignments': return 'Zimmet Yönetimi & Loglar';
      case 'users': return 'Kullanıcı & Personel';
      case 'departments': return 'Departman & Roller';
      case 'profile': return 'Profilim ve Ayarlar';
      default: return 'IT Demirbaş & Zimmet';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgMain} />

      {/* Top Application Header */}
      <View style={styles.topAppBar}>
        <TouchableOpacity
          style={styles.menuDrawerBtn}
          onPress={() => setDrawerOpen(true)}
        >
          <Text style={styles.menuDrawerIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerAppTitle}>IT Demirbaş Mobil</Text>
          <Text style={styles.headerSubTitle}>{getScreenTitle()}</Text>
        </View>

        <TouchableOpacity
          style={styles.profileHeaderBtn}
          onPress={() => setActiveTab('profile')}
        >
          <View style={styles.userInitialsCircle}>
            <Text style={styles.userInitialsText}>
              {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'IT'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Screen Body */}
      <View style={styles.body}>
        {safeActiveTab === 'dashboard' && <DashboardScreen onNavigateTab={setActiveTab} />}
        {safeActiveTab === 'assets' && <AssetsScreen />}
        {safeActiveTab === 'scan' && <QRScanScreen />}
        {safeActiveTab === 'my' && <MyAssetsScreen />}
        {safeActiveTab === 'assignments' && isAdmin && <AssignmentsScreen />}
        {safeActiveTab === 'users' && isAdmin && <UsersScreen />}
        {safeActiveTab === 'departments' && isAdmin && <DepartmentsScreen />}
        {safeActiveTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'dashboard' && styles.tabItemActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={styles.tabIcon}>📊</Text>
          <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]} numberOfLines={1}>
            Gösterge
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'assets' && styles.tabItemActive]}
          onPress={() => setActiveTab('assets')}
        >
          <Text style={styles.tabIcon}>📦</Text>
          <Text style={[styles.tabLabel, activeTab === 'assets' && styles.tabLabelActive]} numberOfLines={1}>
            Demirbaş
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'scan' && styles.tabItemActive]}
          onPress={() => setActiveTab('scan')}
        >
          <Text style={styles.tabIcon}>📷</Text>
          <Text style={[styles.tabLabel, activeTab === 'scan' && styles.tabLabelActive]} numberOfLines={1}>
            QR & Saha
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'my' && styles.tabItemActive]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={styles.tabIcon}>💼</Text>
          <Text style={[styles.tabLabel, activeTab === 'my' && styles.tabLabelActive]} numberOfLines={1}>
            Zimmetim
          </Text>
          {user?.assigned_asset_count > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{user.assigned_asset_count}</Text>
            </View>
          )}
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'assignments' && styles.tabItemActive]}
            onPress={() => setActiveTab('assignments')}
          >
            <Text style={styles.tabIcon}>📋</Text>
            <Text style={[styles.tabLabel, activeTab === 'assignments' && styles.tabLabelActive]} numberOfLines={1}>
              Yönetim
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setDrawerOpen(true)}
        >
          <Text style={styles.tabIcon}>☰</Text>
          <Text style={styles.tabLabel} numberOfLines={1}>Menü</Text>
        </TouchableOpacity>
      </View>

      {/* Slide-out / Drawer Modal (Web Sidebar Equivalent) */}
      <Modal
        visible={drawerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
          />

          <View style={styles.drawerPanel}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerBrandIcon}>
                <Text style={{ fontSize: 20 }}>💻</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.drawerBrandTitle}>IT Demirbaş</Text>
                <Text style={styles.drawerBrandSub}>Tüm Sistem Menüleri</Text>
              </View>
              <TouchableOpacity
                style={styles.drawerCloseBtn}
                onPress={() => setDrawerOpen(false)}
              >
                <Text style={styles.drawerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* User Quick Info */}
            <View style={styles.drawerUserBox}>
              <View style={styles.drawerUserAvatar}>
                <Text style={styles.drawerUserAvatarText}>
                  {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'IT'}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.drawerUserName}>{user?.full_name}</Text>
                <Text style={styles.drawerUserRole}>
                  {user?.role === 'admin' ? '🛡️ Sistem Yöneticisi' : '👤 Personel'}
                </Text>
              </View>
            </View>

            {/* Menu Sections List */}
            <ScrollView style={{ flex: 1 }}>
              {DRAWER_ITEMS.map((section, sIdx) => {
                if (section.adminOnly && !isAdmin) return null;

                return (
                  <View key={sIdx} style={styles.drawerSection}>
                    <Text style={styles.drawerSectionTitle}>{section.category}</Text>

                    {section.items.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.drawerMenuItem,
                            isActive && styles.drawerMenuItemActive
                          ]}
                          onPress={() => handleSelectDrawerItem(item.id)}
                        >
                          <View
                            style={[
                              styles.drawerItemIconBox,
                              { backgroundColor: item.color + '22' }
                            ]}
                          >
                            <Text style={styles.drawerItemIcon}>{item.icon}</Text>
                          </View>
                          <Text
                            style={[
                              styles.drawerItemLabel,
                              isActive && styles.drawerItemLabelActive
                            ]}
                          >
                            {item.label}
                          </Text>
                          {item.hasBadge && user?.assigned_asset_count > 0 && (
                            <View style={styles.drawerBadge}>
                              <Text style={styles.drawerBadgeText}>
                                {user.assigned_asset_count}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>

            {/* Drawer Logout Footer */}
            <TouchableOpacity
              style={styles.drawerLogoutBtn}
              onPress={() => {
                setDrawerOpen(false);
                logout();
              }}
            >
              <Text style={styles.drawerLogoutText}>🚪 Güvenli Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle
  },
  menuDrawerBtn: {
    padding: 6,
    marginRight: 8
  },
  menuDrawerIcon: {
    fontSize: 22,
    color: colors.textPrimary
  },
  headerTitleBox: {
    flex: 1
  },
  headerAppTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  headerSubTitle: {
    fontSize: 11,
    color: colors.accentCyan,
    fontWeight: '600'
  },
  profileHeaderBtn: {
    padding: 2
  },
  userInitialsCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accentCyan
  },
  userInitialsText: {
    color: colors.accentCyan,
    fontSize: 12,
    fontWeight: '800'
  },
  body: {
    flex: 1
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 6,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    borderTopWidth: 2,
    borderTopColor: 'transparent',
    position: 'relative'
  },
  tabItemActive: {
    borderTopColor: colors.accentCyan
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center'
  },
  tabLabelActive: {
    color: colors.accentCyan,
    fontWeight: '700'
  },
  badgeCount: {
    position: 'absolute',
    top: -2,
    right: 14,
    backgroundColor: colors.warning,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1
  },
  badgeCountText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800'
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.65)'
  },
  drawerBackdrop: {
    flex: 1
  },
  drawerPanel: {
    width: 290,
    backgroundColor: colors.bgCard,
    height: '100%',
    padding: spacing.md,
    borderLeftWidth: 1,
    borderColor: colors.borderSubtle
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle
  },
  drawerBrandIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  drawerBrandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  drawerBrandSub: {
    fontSize: 11,
    color: colors.textSecondary
  },
  drawerCloseBtn: {
    padding: 6
  },
  drawerCloseText: {
    fontSize: 18,
    color: colors.textMuted
  },
  drawerUserBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    padding: 10,
    borderRadius: radius.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  drawerUserAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  drawerUserAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800'
  },
  drawerUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary
  },
  drawerUserRole: {
    fontSize: 11,
    color: colors.accentCyan,
    marginTop: 2
  },
  drawerSection: {
    marginBottom: spacing.md
  },
  drawerSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 4
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    marginBottom: 2
  },
  drawerMenuItemActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)'
  },
  drawerItemIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  drawerItemIcon: {
    fontSize: 14
  },
  drawerItemLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  drawerItemLabelActive: {
    color: colors.accentCyan,
    fontWeight: '700'
  },
  drawerBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full
  },
  drawerBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '800'
  },
  drawerLogoutBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm
  },
  drawerLogoutText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700'
  }
});
