import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import QRScanScreen from './src/screens/QRScanScreen';
import MyAssetsScreen from './src/screens/MyAssetsScreen';
import { colors } from './src/styles/theme';

function MainNavigator() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'scan' | 'my'

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgMain} />

      {/* Screen Body */}
      <View style={styles.body}>
        {activeTab === 'dashboard' && <DashboardScreen onNavigateTab={setActiveTab} />}
        {activeTab === 'scan' && <QRScanScreen />}
        {activeTab === 'my' && <MyAssetsScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'dashboard' && styles.tabItemActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={styles.tabIcon}>📊</Text>
          <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]}>
            Gösterge
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'scan' && styles.tabItemActive]}
          onPress={() => setActiveTab('scan')}
        >
          <Text style={styles.tabIcon}>📷</Text>
          <Text style={[styles.tabLabel, activeTab === 'scan' && styles.tabLabelActive]}>
            QR & Saha
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'my' && styles.tabItemActive]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={styles.tabIcon}>💼</Text>
          <Text style={[styles.tabLabel, activeTab === 'my' && styles.tabLabelActive]}>
            Zimmetlerim
          </Text>
        </TouchableOpacity>
      </View>
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
  body: {
    flex: 1
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: 8,
    paddingBottom: 16
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: colors.accentCyan
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2
  },
  tabLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  tabLabelActive: {
    color: colors.accentCyan,
    fontWeight: '700'
  }
});
