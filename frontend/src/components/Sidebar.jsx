import React, { useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Users,
  UserCheck,
  QrCode,
  LogOut,
  ShieldAlert,
  Server,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  {
    category: 'Ana Menü',
    items: [
      {
        id: 'dashboard',
        label: 'Gösterge Paneli',
        icon: LayoutDashboard,
        color: '#38bdf8',
        bgColor: 'rgba(56, 189, 248, 0.16)'
      },
      {
        id: 'assets',
        label: 'Demirbaş Envanteri',
        icon: Boxes,
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.16)'
      },
      {
        id: 'scanner',
        label: 'QR Kod / Barkod Oku',
        icon: QrCode,
        color: '#c084fc',
        bgColor: 'rgba(192, 132, 252, 0.16)',
        isScanner: true
      }
    ]
  },
  {
    category: 'Zimmet & Saha',
    items: [
      {
        id: 'my-assets',
        label: 'Kişisel Zimmetlerim',
        icon: UserCheck,
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.16)',
        hasBadge: true
      },
      {
        id: 'assignments',
        label: 'Zimmet Yönetimi & Loglar',
        icon: ClipboardList,
        color: '#f43f5e',
        bgColor: 'rgba(244, 63, 94, 0.16)'
      }
    ]
  },
  {
    category: 'Yönetim',
    adminOnly: true,
    items: [
      {
        id: 'users',
        label: 'Kullanıcı & Rol Yönetimi',
        icon: Users,
        color: '#6366f1',
        bgColor: 'rgba(99, 102, 241, 0.16)'
      }
    ]
  },
  {
    category: 'Hesap',
    items: [
      {
        id: 'profile',
        label: 'Profilim ve Ayarlar',
        icon: ShieldAlert,
        color: '#06b6d4',
        bgColor: 'rgba(6, 182, 212, 0.16)'
      }
    ]
  }
];

export default function Sidebar({
  currentTab,
  setCurrentTab,
  mobileOpen,
  setMobileOpen,
  onOpenScanner,
  isCollapsed,
  setIsCollapsed
}) {
  const { user, isAdmin, logout } = useAuth();
  const [hoverExpanded, setHoverExpanded] = useState(false);

  // If collapsed but hovered, it can expand temporarily
  const effectiveCollapsed = isCollapsed && !hoverExpanded;

  const handleNav = (item) => {
    if (item.isScanner) {
      if (onOpenScanner) onOpenScanner();
    } else {
      setCurrentTab(item.id);
    }
    if (setMobileOpen) setMobileOpen(false);
  };

  const handleItemClick = (item) => {
    // If it was collapsed and user clicks an icon, expand it or perform navigation
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    handleNav(item);
  };

  return (
    <aside
      className={`sidebar ${effectiveCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      onMouseEnter={() => {
        if (isCollapsed) setHoverExpanded(true);
      }}
      onMouseLeave={() => {
        if (isCollapsed) setHoverExpanded(false);
      }}
    >
      {/* Header */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <Server size={22} />
        </div>

        {!effectiveCollapsed && (
          <div className="brand-text">
            <h1>IT Demirbaş</h1>
            <p>Yapay Zeka & Dönüşüm</p>
          </div>
        )}

        {/* Toggle Collapse Button */}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Menüyü Genişlet (Sabitle)' : 'Menüyü Daralt (İkon Modu)'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Menu items */}
      <div className="sidebar-menu">
        {NAV_ITEMS.map((section, idx) => {
          if (section.adminOnly && !isAdmin) return null;

          return (
            <div key={idx} className="menu-section">
              {!effectiveCollapsed && (
                <div className="menu-category-title">{section.category}</div>
              )}
              {effectiveCollapsed && <div className="menu-divider" />}

              {section.items.map((item) => {
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    className={`menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleItemClick(item)}
                    title={effectiveCollapsed ? item.label : ''}
                  >
                    <div
                      className="menu-item-icon-wrapper"
                      style={{
                        backgroundColor: item.bgColor,
                        color: item.color,
                        boxShadow: isActive ? `0 0 12px ${item.bgColor}` : 'none'
                      }}
                    >
                      <item.icon size={19} />
                    </div>

                    {!effectiveCollapsed && (
                      <span className="menu-item-label">{item.label}</span>
                    )}

                    {!effectiveCollapsed && item.hasBadge && user?.assigned_asset_count > 0 && (
                      <span className="menu-badge">{user.assigned_asset_count}</span>
                    )}

                    {effectiveCollapsed && (
                      <div className="collapsed-tooltip">{item.label}</div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Profile */}
      <div className="sidebar-footer">
        <div className="user-quick-profile">
          <img
            src={user?.avatar_url || 'https://ui-avatars.com/api/?name=User'}
            alt={user?.full_name}
            className="user-avatar"
            onClick={() => handleNav({ id: 'profile' })}
          />

          {!effectiveCollapsed && (
            <div className="user-info">
              <div className="name">{user?.full_name}</div>
              <span className={`role-badge ${user?.role === 'admin' ? 'admin' : 'personnel'}`}>
                {user?.role === 'admin' ? 'Sistem Yöneticisi' : 'Personel'}
              </span>
            </div>
          )}

          {!effectiveCollapsed && (
            <button
              className="btn-icon"
              onClick={logout}
              title="Güvenli Çıkış"
              style={{ width: 32, height: 32 }}
            >
              <LogOut size={15} color="#f87171" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
