import React from 'react';
import { Menu, QrCode, Sun, Moon, ShieldCheck, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  currentTab,
  setMobileOpen,
  onOpenScanner,
  theme,
  toggleTheme
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
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
          title="Menüyü Aç"
        >
          <Menu size={22} />
        </button>
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
          <QrCode size={16} />
          <span>QR Tara</span>
        </button>

        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Açık Temaya Geç' : 'Karanlık Temaya Geç'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem'
          }}
        >
          <ShieldCheck size={16} color="#38bdf8" />
          <span style={{ color: 'var(--text-secondary)' }}>{user?.department || 'Genel'}</span>
        </div>
      </div>
    </header>
  );
}
