import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Users,
  UserCheck,
  QrCode,
  LogOut,
  ShieldAlert,
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentTab, setCurrentTab, mobileOpen, setMobileOpen, onOpenScanner }) {
  const { user, isAdmin, logout } = useAuth();

  const handleNav = (tabId) => {
    setCurrentTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-icon">
          <Server size={24} />
        </div>
        <div className="brand-text">
          <h1>IT Demirbaş</h1>
          <p>Yapay Zeka & Dönüşüm</p>
        </div>
      </div>

      <div className="sidebar-menu">
        <div className="menu-category-title">Ana Menü</div>

        <button
          className={`menu-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNav('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Gösterge Paneli</span>
        </button>

        <button
          className={`menu-item ${currentTab === 'assets' ? 'active' : ''}`}
          onClick={() => handleNav('assets')}
        >
          <Boxes size={18} />
          <span>Demirbaş Envanteri</span>
        </button>

        <button
          className={`menu-item ${currentTab === 'scanner' ? 'active' : ''}`}
          onClick={() => {
            if (onOpenScanner) onOpenScanner();
            if (setMobileOpen) setMobileOpen(false);
          }}
        >
          <QrCode size={18} />
          <span>QR Kod / Barkod Oku</span>
        </button>

        <div className="menu-category-title">Zimmet & Saha</div>

        <button
          className={`menu-item ${currentTab === 'my-assets' ? 'active' : ''}`}
          onClick={() => handleNav('my-assets')}
        >
          <UserCheck size={18} />
          <span>Kişisel Zimmetlerim</span>
          {user?.assigned_asset_count > 0 && (
            <span className="menu-badge">{user.assigned_asset_count}</span>
          )}
        </button>

        <button
          className={`menu-item ${currentTab === 'assignments' ? 'active' : ''}`}
          onClick={() => handleNav('assignments')}
        >
          <ClipboardList size={18} />
          <span>Zimmet Yönetimi & Loglar</span>
        </button>


        {isAdmin && (
          <>
            <div className="menu-category-title">Yönetim</div>
            <button
              className={`menu-item ${currentTab === 'users' ? 'active' : ''}`}
              onClick={() => handleNav('users')}
            >
              <Users size={18} />
              <span>Kullanıcı & Rol Yönetimi</span>
            </button>
          </>
        )}

        <div className="menu-category-title">Hesap</div>

        <button
          className={`menu-item ${currentTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleNav('profile')}
        >
          <ShieldAlert size={18} />
          <span>Profilim ve Ayarlar</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="user-quick-profile">
          <img
            src={user?.avatar_url || 'https://ui-avatars.com/api/?name=User'}
            alt={user?.full_name}
            className="user-avatar"
          />
          <div className="user-info">
            <div className="name">{user?.full_name}</div>
            <span className={`role-badge ${user?.role === 'admin' ? 'admin' : 'personnel'}`}>
              {user?.role === 'admin' ? 'Sistem Yöneticisi' : 'Personel'}
            </span>
          </div>
          <button
            className="btn-icon"
            onClick={logout}
            title="Güvenli Çıkış"
            style={{ width: 34, height: 34 }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
