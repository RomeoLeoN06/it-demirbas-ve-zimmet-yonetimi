import React from 'react';
import { Menu, QrCode, Sun, Moon, ShieldCheck, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  currentTab,
  setMobileOpen,
  onOpenScanner,
  theme,
  toggleTheme,
  isCollapsed,
  setIsCollapsed
}) {
  const { user } = useAuth();

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Yönetim ve Gösterge Paneli';
      case 'assets':
        return 'IT Demirbaş Envanteri';
      case 'assignments':
        return 'Zimmet Yönetimi & Hareket Geçmişi';
      case 'users':
        return 'Kullanıcı ve Rol Yönetimi';
      case 'my-assets':
        return 'Kişisel Zimmetli Cihazlarım';
      case 'profile':
        return 'Kullanıcı Profili ve Güvenlik';
      default:
        return 'IT Demirbaş ve Zimmet Sistemi';
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Mobile menu toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
          title="Menüyü Aç"
        >
          <Menu size={22} />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        {setIsCollapsed && (
          <button
            className="btn-icon sidebar-desktop-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Menüyü Genişlet' : 'Menüyü Daralt (İkon Modu)'}
            style={{ width: 34, height: 34 }}
          >
            {isCollapsed ? <PanelLeftOpen size={18} color="#38bdf8" /> : <PanelLeftClose size={18} />}
          </button>
        )}

        <div className="page-title">
          <h2>{getTabTitle()}</h2>
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenScanner}
          title="QR Kod / Barkod ile Cihaz Bul"
        >
          <QrCode size={16} color="#c084fc" />
          <span>QR Tara</span>
        </button>

        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Açık Temaya Geç' : 'Karanlık Temaya Geç'}
        >
          {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} />}
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 12px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem'
          }}
        >
          <ShieldCheck size={16} color="#38bdf8" />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            {user?.department || 'Genel'}
          </span>
        </div>
      </div>
    </header>
  );
}
