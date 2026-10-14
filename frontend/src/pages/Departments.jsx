import React, { useState, useEffect } from 'react';
import {
  Building2,
  Shield,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Laptop,
  CheckCircle,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import DepartmentModal from '../components/DepartmentModal';
import RoleModal from '../components/RoleModal';

export default function Departments({ onNavigateTab }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'roles'

  // Departments State
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [departmentModalState, setDepartmentModalState] = useState({ isOpen: false, department: null });

  // Roles State
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleSearch, setRoleSearch] = useState('');
  const [roleModalState, setRoleModalState] = useState({ isOpen: false, role: null });

  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const res = await api.getDepartments({ search: departmentSearch });
      setDepartments(res.data || []);
    } catch (err) {
      toast.error('Departman listesi yüklenemedi.');
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const res = await api.getRoles();
      setRoles(res.data || []);
    } catch (err) {
      toast.error('Rol listesi yüklenemedi.');
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'departments') {
      fetchDepartments();
    } else {
      fetchRoles();
    }
  }, [activeTab, departmentSearch]);

  const handleDeleteDepartment = async (dep) => {
    if (!window.confirm(`"${dep.name}" departmanını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await api.deleteDepartment(dep.id);
      toast.success('Departman başarıyla silindi.');
      fetchDepartments();
    } catch (err) {
      toast.error(err.message || 'Departman silinemedi.');
    }
  };

  const handleDeleteRole = async (role) => {
    if (role.is_system === 1) {
      toast.warning('Sistem varsayılan rolleri silinemez.');
      return;
    }

    if (!window.confirm(`"${role.display_name}" rolünü sistemden kaldırmak istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await api.deleteRole(role.id);
      toast.success('Rol başarıyla silindi.');
      fetchRoles();
    } catch (err) {
      toast.error(err.message || 'Rol silinemedi.');
    }
  };

  const filteredRoles = roles.filter((r) => {
    if (!roleSearch.trim()) return true;
    const q = roleSearch.toLowerCase();
    return (
      r.display_name?.toLowerCase().includes(q) ||
      r.name?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={24} color="#0284c7" />
            <span>Departman, Birim & Rol Yönetimi</span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Kurumsal birimlerin, çalışma departmanlarının ve yetki rollerinin veritabanı üzerinden yönetimi
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {activeTab === 'departments' ? (
            <button
              className="btn btn-primary"
              onClick={() => setDepartmentModalState({ isOpen: true, department: null })}
            >
              <Plus size={18} />
              <span>Yeni Departman Ekle</span>
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setRoleModalState({ isOpen: true, role: null })}
            >
              <Plus size={18} />
              <span>Yeni Rol Tanımla</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern Tab Switcher */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          className={`btn ${activeTab === 'departments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('departments')}
        >
          <Building2 size={16} />
          <span>Kurumsal Birimler & Departmanlar ({departments.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'roles' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('roles')}
        >
          <Shield size={16} />
          <span>Yetki ve Rol Tanımları ({roles.length})</span>
        </button>
      </div>

      {/* TAB 1: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div>
          {/* Search Filter */}
          <div className="filter-bar" style={{ marginBottom: 16 }}>
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Departman Adı veya Açıklama Ara..."
                value={departmentSearch}
                onChange={(e) => setDepartmentSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Department Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Departman / Birim Adı</th>
                  <th>Görev & Kapsam Açıklaması</th>
                  <th style={{ textAlign: 'center' }}>Personel Sayısı</th>
                  <th style={{ textAlign: 'center' }}>Zimmetli Cihaz</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {departmentsLoading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                      Departmanlar yükleniyor...
                    </td>
                  </tr>
                ) : departments.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                      Kayıtlı departman bulunamadı.
                    </td>
                  </tr>
                ) : (
                  departments.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(2, 132, 199, 0.12)',
                              color: '#0284c7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Building2 size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              ID: #{d.id} • Eklenme: {d.created_at ? new Date(d.created_at).toLocaleDateString('tr-TR') : '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 360 }}>
                          {d.description || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Açıklama belirtilmemiş</span>}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className="badge"
                          style={{
                            background: d.user_count > 0 ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface)',
                            color: d.user_count > 0 ? '#0284c7' : 'var(--text-muted)',
                            fontWeight: 700
                          }}
                        >
                          <Users size={13} style={{ marginRight: 4 }} />
                          {d.user_count} Personel
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className="badge"
                          style={{
                            background: d.asset_count > 0 ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface)',
                            color: d.asset_count > 0 ? '#10b981' : 'var(--text-muted)',
                            fontWeight: 700
                          }}
                        >
                          <Laptop size={13} style={{ marginRight: 4 }} />
                          {d.asset_count} Cihaz
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            className="btn-icon btn-action-edit"
                            style={{ width: 32, height: 32 }}
                            onClick={() => setDepartmentModalState({ isOpen: true, department: d })}
                            title="Departmanı Düzenle"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            className="btn-icon btn-action-delete"
                            style={{ width: 32, height: 32 }}
                            onClick={() => handleDeleteDepartment(d)}
                            title="Departmanı Sil"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES */}
      {activeTab === 'roles' && (
        <div>
          {/* Search Filter */}
          <div className="filter-bar" style={{ marginBottom: 16 }}>
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Rol Adı, Sistem Kodu veya Açıklama Ara..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Roles Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rol Tanımı & Görünen Ad</th>
                  <th>Sistem Rol Kodu</th>
                  <th>Yetki Açıklaması</th>
                  <th style={{ textAlign: 'center' }}>Tür</th>
                  <th style={{ textAlign: 'center' }}>Kullanıcı Sayısı</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {rolesLoading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                      Roller yükleniyor...
                    </td>
                  </tr>
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                      Kayıtlı rol bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 'var(--radius-sm)',
                              background: r.is_system ? 'rgba(239, 68, 68, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                              color: r.is_system ? '#ef4444' : '#8b5cf6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Shield size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.display_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              ID: #{r.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code style={{ background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: 4, fontSize: '0.8rem', color: '#0284c7' }}>
                          {r.name}
                        </code>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 360 }}>
                          {r.description || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Açıklama belirtilmemiş</span>}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {r.is_system === 1 ? (
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(239, 68, 68, 0.12)',
                              color: '#ef4444',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Lock size={12} />
                            Sistem Rolü
                          </span>
                        ) : (
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(139, 92, 246, 0.12)',
                              color: '#8b5cf6',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Sparkles size={12} />
                            Özel Rol
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className="badge"
                          style={{
                            background: r.user_count > 0 ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface)',
                            color: r.user_count > 0 ? '#0284c7' : 'var(--text-muted)',
                            fontWeight: 700
                          }}
                        >
                          <Users size={13} style={{ marginRight: 4 }} />
                          {r.user_count} Kullanıcı
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            className="btn-icon btn-action-edit"
                            style={{ width: 32, height: 32 }}
                            onClick={() => setRoleModalState({ isOpen: true, role: r })}
                            title="Rolü Düzenle"
                          >
                            <Edit2 size={15} />
                          </button>

                          {r.is_system === 1 ? (
                            <button
                              className="btn-icon"
                              style={{ width: 32, height: 32, opacity: 0.3, cursor: 'not-allowed' }}
                              disabled
                              title="Sistem rolleri silinemez"
                            >
                              <Lock size={15} />
                            </button>
                          ) : (
                            <button
                              className="btn-icon btn-action-delete"
                              style={{ width: 32, height: 32 }}
                              onClick={() => handleDeleteRole(r)}
                              title="Rolü Sil"
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
          </div>
        </div>
      )}

      {/* Modals */}
      <DepartmentModal
        isOpen={departmentModalState.isOpen}
        department={departmentModalState.department}
        onClose={() => setDepartmentModalState({ isOpen: false, department: null })}
        onSuccess={() => fetchDepartments()}
      />

      <RoleModal
        isOpen={roleModalState.isOpen}
        role={roleModalState.role}
        onClose={() => setRoleModalState({ isOpen: false, role: null })}
        onSuccess={() => fetchRoles()}
      />
    </div>
  );
}
