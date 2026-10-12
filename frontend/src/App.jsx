import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import QRScannerModal from './components/QRScannerModal';
import AssignModal from './components/AssignModal';
import ReturnModal from './components/ReturnModal';
import FaultReportModal from './components/FaultReportModal';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Assignments from './pages/Assignments';
import Users from './pages/Users';
import MyAssets from './pages/MyAssets';
import Profile from './pages/Profile';

export default function App() {
  const { user, loading, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Scanner quick actions state
  const [quickAssignAsset, setQuickAssignAsset] = useState(null);
  const [quickReturnAsset, setQuickReturnAsset] = useState(null);
  const [quickFaultAsset, setQuickFaultAsset] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-main)',
          color: 'var(--text-secondary)'
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(2, 132, 199, 0.2)',
            borderTopColor: '#38bdf8',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: 16
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontWeight: 600 }}>IT Demirbaş ve Zimmet Sistemi Yükleniyor...</div>
      </div>
    );
  }

  // Not logged in -> Show Auth screens
  if (!user) {
    if (authView === 'register') {
      return <Register onNavigateLogin={() => setAuthView('login')} />;
    }
    return <Login onNavigateRegister={() => setAuthView('register')} />;
  }

  // Logged in -> Render Main Dashboard App
  return (
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      <div className="main-content">
        <Navbar
          currentTab={currentTab}
          setMobileOpen={setMobileOpen}
          onOpenScanner={() => setIsScannerOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main className="page-wrapper">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigateTab={setCurrentTab}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}
          {currentTab === 'assets' && <Assets />}
          {currentTab === 'assignments' && <Assignments />}
          {currentTab === 'users' && isAdmin && <Users />}
          {currentTab === 'my-assets' && <MyAssets />}
          {currentTab === 'profile' && <Profile />}
        </main>

      </div>

      {/* Global QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onOpenAssign={(asset) => setQuickAssignAsset(asset)}
        onOpenReturn={(asset) => setQuickReturnAsset(asset)}
        onOpenFault={(asset) => setQuickFaultAsset(asset)}
      />

      {/* Quick Action Modals from Scanner */}
      <AssignModal
        isOpen={Boolean(quickAssignAsset)}
        asset={quickAssignAsset}
        onClose={() => setQuickAssignAsset(null)}
        onSuccess={() => {
          setQuickAssignAsset(null);
          // If on assets tab, user sees update
        }}
      />

      <ReturnModal
        isOpen={Boolean(quickReturnAsset)}
        asset={quickReturnAsset}
        onClose={() => setQuickReturnAsset(null)}
        onSuccess={() => {
          setQuickReturnAsset(null);
        }}
      />

      <FaultReportModal
        isOpen={Boolean(quickFaultAsset)}
        asset={quickFaultAsset}
        onClose={() => setQuickFaultAsset(null)}
        onSuccess={() => {
          setQuickFaultAsset(null);
        }}
      />
    </div>
  );
}
