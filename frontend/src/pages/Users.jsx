import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  KeyRound,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/Pagination';
import UserModal from '../components/UserModal';
import PasswordResetModal from '../components/PasswordResetModal';

export default function Users() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [rolesList, setRolesList] = useState([]);

  // Modals
  const [userModalState, setUserModalState] = useState({ isOpen: false, user: null });
  const [resetModalUser, setResetModalUser] = useState(null);

  useEffect(() => {
    api.getRoles().then((res) => setRolesList(res.data || [])).catch(() => {});
  }, []);

  const getRoleDisplayName = (roleName) => {
    const match = rolesList.find((r) => r.name === roleName);
    if (match) return match.display_name;
    if (roleName === 'admin') return 'Sistem Yöneticisi';
    if (roleName === 'personnel') return 'Standart Personel';
    return roleName;
  };

  const fetchUsers = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await api.getUsers({ page, limit, search, role: roleFilter });
      setUsers(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error('Kullanıcı listesi yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [search, roleFilter]);

  const handleDelete = async (user) => {
    if (user.id === currentUser.id) {
      toast.warning('Kendi hesabınızı silemezsiniz.');
      return;
    }

    if (!window.confirm(`"${user.full_name}" kullanıcısını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await api.deleteUser(user.id);
      toast.success('Kullanıcı sistemden silindi.');
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Kullanıcı silinemedi.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Kullanıcı ve Rol Yönetimi</h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Kurum personelleri, yönetici yetkileri, şifre sıfırlama ve hesap yönetimi
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setUserModalState({ isOpen: true, user: null })}
        >
          <UserPlus size={18} />
          <span>Yeni Kullanıcı Ekle</span>
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Ad Soyad, E-posta, Departman veya Telefon Ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tüm Roller</option>
            {rolesList.map((r) => (
              <option key={r.id} value={r.name}>
                {r.display_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table desktop-table-view">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Rol / Yetki</th>
              <th>Departman</th>
              <th>İletişim</th>
              <th>Zimmetli Cihaz Sayısı</th>
              <th>Durum</th>
              <th style={{ textAlign: 'right' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Kullanıcılar yükleniyor...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Kayıtlı kullanıcı bulunamadı.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={u.avatar_url || 'https://ui-avatars.com/api/?name=User'}
                        alt={u.full_name}
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{u.full_name}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'personnel'}`}>
                      {getRoleDisplayName(u.role)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{u.department || '—'}</td>
                  <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{u.phone || '—'}</td>
                  <td>
                    {u.assigned_asset_count > 0 ? (
                      <span className="badge-device-count positive">
                        {u.assigned_asset_count} Cihaz
                      </span>
                    ) : (
                      <span className="badge-device-count zero">0 Cihaz</span>
                    )}
                  </td>
                  <td>
                    {u.is_active ? (
                      <span className="status-indicator active">
                        <CheckCircle size={14} /> Aktif
                      </span>
                    ) : (
                      <span className="status-indicator inactive">
                        <XCircle size={14} /> Pasif
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      {/* Password Reset */}
                      <button
                        className="btn-icon btn-action-key"
                        style={{ width: 32, height: 32 }}
                        onClick={() => setResetModalUser(u)}
                        title="Şifresini Sıfırla"
                      >
                        <KeyRound size={15} />
                      </button>

                      {/* Edit */}
                      <button
                        className="btn-icon btn-action-edit"
                        style={{ width: 32, height: 32 }}
                        onClick={() => setUserModalState({ isOpen: true, user: u })}
                        title="Bilgilerini Düzenle"
                      >
                        <Edit2 size={15} />
                      </button>

                      {/* Delete */}
                      {u.id !== currentUser.id && (
                        <button
                          className="btn-icon btn-action-delete"
                          style={{ width: 32, height: 32 }}
                          onClick={() => handleDelete(u)}
                          title="Kullanıcıyı Sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile Cards for Users */}
        <div className="mobile-cards-view">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
              Kullanıcılar yükleniyor...
            </div>
          ) : users.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
              Kayıtlı kullanıcı bulunamadı.
            </div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="asset-mobile-card">
                <div className="mobile-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={u.avatar_url || 'https://ui-avatars.com/api/?name=User'}
                      alt={u.full_name}
                      style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.90rem', color: 'var(--text-primary)', display: 'block' }}>{u.full_name}</strong>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                  <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'personnel'}`}>
                    {getRoleDisplayName(u.role)}
                  </span>
                </div>

                <div className="mobile-card-details-grid">
                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Departman</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{u.department || '—'}</span>
                  </div>
                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Telefon</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{u.phone || '—'}</span>
                  </div>
                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Zimmetli Cihaz</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: u.assigned_asset_count > 0 ? '#38bdf8' : 'inherit' }}>
                      {u.assigned_asset_count || 0} Cihaz
                    </span>
                  </div>
                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Hesap Durumu</span>
                    {u.is_active ? (
                      <span className="status-indicator active" style={{ fontSize: '0.76rem' }}>
                        <CheckCircle size={12} /> Aktif
                      </span>
                    ) : (
                      <span className="status-indicator inactive" style={{ fontSize: '0.76rem' }}>
                        <XCircle size={12} /> Pasif
                      </span>
                    )}
                  </div>
                </div>

                <div className="mobile-card-actions">
                  <button
                    className="btn btn-secondary btn-sm mobile-action-btn"
                    onClick={() => setResetModalUser(u)}
                    title="Şifresini Sıfırla"
                  >
                    <KeyRound size={13} color="#f59e0b" />
                    <span>Şifre Sıfırla</span>
                  </button>

                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                    <button
                      className="btn-icon btn-action-edit"
                      style={{ width: 30, height: 30 }}
                      onClick={() => setUserModalState({ isOpen: true, user: u })}
                      title="Bilgilerini Düzenle"
                    >
                      <Edit2 size={13} />
                    </button>
                    {u.id !== currentUser.id && (
                      <button
                        className="btn-icon btn-action-delete"
                        style={{ width: 30, height: 30 }}
                        onClick={() => handleDelete(u)}
                        title="Kullanıcıyı Sil"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination
          pagination={pagination}
          onPageChange={(p) => fetchUsers(p)}
          onLimitChange={(l) => {
            setPagination((prev) => ({ ...prev, limit: l }));
            fetchUsers(1, l);
          }}
        />
      </div>

      <UserModal
        isOpen={userModalState.isOpen}
        user={userModalState.user}
        onClose={() => setUserModalState({ isOpen: false, user: null })}
        onSuccess={() => fetchUsers(pagination.page)}
      />

      <PasswordResetModal
        isOpen={Boolean(resetModalUser)}
        user={resetModalUser}
        onClose={() => setResetModalUser(null)}
      />
    </div>
  );
}
