import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  QrCode,
  Edit2,
  Trash2,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Eye
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/Pagination';
import QRModal from '../components/QRModal';
import AssetModal from '../components/AssetModal';
import AssignModal from '../components/AssignModal';
import ReturnModal from '../components/ReturnModal';
import FaultReportModal from '../components/FaultReportModal';

export default function Assets({ initialStatus = '', onFilterChange }) {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departmentsList, setDepartmentsList] = useState([]);

  useEffect(() => {
    if (initialStatus !== undefined) {
      setStatusFilter(initialStatus);
    }
  }, [initialStatus]);

  // Modals state
  const [qrModalAsset, setQrModalAsset] = useState(null);
  const [assetModalState, setAssetModalState] = useState({ isOpen: false, asset: null });
  const [assignModalAsset, setAssignModalAsset] = useState(null);
  const [returnModalAsset, setReturnModalAsset] = useState(null);
  const [faultModalAsset, setFaultModalAsset] = useState(null);

  useEffect(() => {
    api.getDepartments().then((res) => setDepartmentsList(res.data || [])).catch(() => {});
  }, []);

  const fetchAssets = useCallback(async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await api.getAssets({
        page,
        limit,
        search,
        status: statusFilter,
        category: categoryFilter,
        department: departmentFilter
      });
      setAssets(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error('Demirbaş listesi yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, departmentFilter, pagination.limit, toast]);

  useEffect(() => {
    fetchAssets(1);
  }, [search, statusFilter, categoryFilter, departmentFilter]);

  const handleDelete = async (asset) => {
    if (!window.confirm(`"${asset.name}" (${asset.asset_code}) demirbaşını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await api.deleteAsset(asset.id);
      toast.success('Demirbaş sistemden silindi.');
      fetchAssets(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Silme işlemi başarısız.');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setDepartmentFilter('');
    if (onFilterChange) onFilterChange('');
  };

  return (
    <div>
      {/* Top Header & New Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Demirbaş ve Cihaz Envanteri</h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Tüm IT ekipmanlarının durumu, garanti bilgisi ve zimmet kayıtları
          </p>
        </div>

        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setAssetModalState({ isOpen: true, asset: null })}
          >
            <Plus size={18} />
            <span>Yeni Demirbaş Ekle</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Seri No, Demirbaş Kodu, Cihaz Adı, Marka veya Personel Ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => {
              const val = e.target.value;
              setStatusFilter(val);
              if (onFilterChange) onFilterChange(val);
            }}
          >
            <option value="">Tüm Durumlar</option>
            <option value="depoda">Depoda (Boşta)</option>
            <option value="zimmetli">Zimmetli</option>
            <option value="arizali">Arızalı</option>
            <option value="bakimda">Bakımda</option>
            <option value="hurda">Hurda</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Tüm Kategoriler</option>
            <option value="Bilgisayar">Bilgisayar</option>
            <option value="Monitör">Monitör</option>
            <option value="Sunucu">Sunucu</option>
            <option value="Ağ Cihazı">Ağ Cihazı</option>
            <option value="Yazıcı">Yazıcı</option>
            <option value="Tablet">Tablet</option>
            <option value="Telefon">Telefon</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">Tüm Departmanlar</option>
            {departmentsList.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {(search || statusFilter || categoryFilter || departmentFilter) && (
            <button className="btn btn-secondary btn-sm" onClick={handleResetFilters} title="Filtreleri Temizle">
              <RotateCcw size={14} />
              <span>Sıfırla</span>
            </button>
          )}
        </div>
      </div>

      {/* Assets Table (Desktop / Tablet) */}
      <div className="table-container">
        <table className="data-table desktop-table-view">
          <thead>
            <tr>
              <th>Demirbaş Kodu</th>
              <th>Cihaz Tanımı & Model</th>
              <th>Kategori</th>
              <th>Seri Numarası</th>
              <th>Durum</th>
              <th>Zimmetli Personel</th>
              <th>Garanti Bitiş</th>
              <th style={{ textAlign: 'right' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Demirbaşlar yükleniyor...
                </td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Arama kriterlerine uygun demirbaş bulunamadı.
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <span className="table-asset-code">{asset.asset_code}</span>
                  </td>
                  <td>
                    <strong>{asset.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {asset.brand} - {asset.model}
                    </div>
                  </td>
                  <td>{asset.category}</td>
                  <td>
                    <code style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{asset.serial_number}</code>
                  </td>
                  <td>
                    <span className={`badge badge-${asset.status}`}>
                      <span className="badge-dot" />
                      {asset.status === 'depoda' ? 'Depoda' :
                       asset.status === 'zimmetli' ? 'Zimmetli' :
                       asset.status === 'arizali' ? 'Arızalı' :
                       asset.status === 'bakimda' ? 'Bakımda' : asset.status}
                    </span>
                  </td>
                  <td>
                    {asset.assigned_user_name ? (
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{asset.assigned_user_name}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {asset.assigned_user_department || 'Birim Yok'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>— Boşta —</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {asset.warranty_end_date ? (
                      <span
                        style={{
                          color: new Date(asset.warranty_end_date) < new Date() ? '#f87171' : 'inherit'
                        }}
                      >
                        {asset.warranty_end_date}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      {/* QR Modal Button */}
                      <button
                        className="btn-icon"
                        style={{ width: 32, height: 32 }}
                        onClick={() => setQrModalAsset(asset)}
                        title="QR Kodu ve Etiketi Görüntüle"
                      >
                        <QrCode size={15} color="#38bdf8" />
                      </button>

                      {/* Admin Custody Buttons */}
                      {isAdmin && asset.status !== 'zimmetli' && asset.status !== 'arizali' && asset.status !== 'hurda' && (
                        <button
                          className="btn-icon"
                          style={{ width: 32, height: 32 }}
                          onClick={() => setAssignModalAsset(asset)}
                          title="Personele Zimmetle"
                        >
                          <UserCheck size={15} color="#10b981" />
                        </button>
                      )}

                      {isAdmin && asset.status === 'zimmetli' && (
                        <button
                          className="btn-icon"
                          style={{ width: 32, height: 32 }}
                          onClick={() => setReturnModalAsset(asset)}
                          title="Zimmetten Düş (İade Al)"
                        >
                          <CheckCircle size={15} color="#f59e0b" />
                        </button>
                      )}

                      {/* Fault Report */}
                      <button
                        className="btn-icon"
                        style={{ width: 32, height: 32 }}
                        onClick={() => setFaultModalAsset(asset)}
                        title="Arıza Durumu Bildir"
                      >
                        <AlertTriangle size={15} color="#f87171" />
                      </button>

                      {/* Admin Edit/Delete */}
                      {isAdmin && (
                        <>
                          <button
                            className="btn-icon"
                            style={{ width: 32, height: 32 }}
                            onClick={() => setAssetModalState({ isOpen: true, asset })}
                            title="Düzenle"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn-icon"
                            style={{ width: 32, height: 32 }}
                            onClick={() => handleDelete(asset)}
                            title="Sil"
                          >
                            <Trash2 size={15} color="#ef4444" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile Cards View (Phones / Narrow Screens) */}
        <div className="mobile-cards-view">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
              Demirbaşlar yükleniyor...
            </div>
          ) : assets.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
              Arama kriterlerine uygun demirbaş bulunamadı.
            </div>
          ) : (
            assets.map((asset) => (
              <div key={asset.id} className="asset-mobile-card">
                {/* Header: Code, Category, Status */}
                <div className="mobile-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span className="table-asset-code">{asset.asset_code}</span>
                    <span className="mobile-category-pill">{asset.category}</span>
                  </div>
                  <span className={`badge badge-${asset.status}`}>
                    <span className="badge-dot" />
                    {asset.status === 'depoda' ? 'Depoda' :
                     asset.status === 'zimmetli' ? 'Zimmetli' :
                     asset.status === 'arizali' ? 'Arızalı' :
                     asset.status === 'bakimda' ? 'Bakımda' : asset.status}
                  </span>
                </div>

                {/* Title & Brand/Model */}
                <div className="mobile-card-title-row">
                  <h3 className="mobile-card-title">{asset.name}</h3>
                  <div className="mobile-card-subtitle">
                    {asset.brand} {asset.model ? `• ${asset.model}` : ''}
                  </div>
                </div>

                {/* 2x2 Details Grid: Serial No, Custody, Warranty, ID */}
                <div className="mobile-card-details-grid">
                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Seri Numarası</span>
                    <code className="mobile-serial-code" title={asset.serial_number}>
                      {asset.serial_number || '—'}
                    </code>
                  </div>

                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Zimmet Durumu</span>
                    {asset.assigned_user_name ? (
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.80rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {asset.assigned_user_name}
                        </span>
                        {asset.assigned_user_department && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {asset.assigned_user_department}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>— Boşta (Depoda) —</span>
                    )}
                  </div>

                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Garanti Bitiş</span>
                    <span
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        color: asset.warranty_end_date && new Date(asset.warranty_end_date) < new Date() ? '#f87171' : 'inherit'
                      }}
                    >
                      {asset.warranty_end_date || '—'}
                    </span>
                  </div>

                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Kayıt No</span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      ID #{asset.id}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mobile-card-actions">
                  <button
                    className="btn btn-secondary btn-sm mobile-action-btn"
                    onClick={() => setQrModalAsset(asset)}
                    title="QR Kodu ve Etiketi Görüntüle"
                  >
                    <QrCode size={13} color="#38bdf8" />
                    <span>QR</span>
                  </button>

                  {isAdmin && asset.status !== 'zimmetli' && asset.status !== 'arizali' && asset.status !== 'hurda' && (
                    <button
                      className="btn btn-secondary btn-sm mobile-action-btn"
                      onClick={() => setAssignModalAsset(asset)}
                      title="Personele Zimmetle"
                    >
                      <UserCheck size={13} color="#10b981" />
                      <span>Zimmetle</span>
                    </button>
                  )}

                  {isAdmin && asset.status === 'zimmetli' && (
                    <button
                      className="btn btn-secondary btn-sm mobile-action-btn"
                      onClick={() => setReturnModalAsset(asset)}
                      title="Zimmetten Düş (İade Al)"
                    >
                      <CheckCircle size={13} color="#f59e0b" />
                      <span>İade Al</span>
                    </button>
                  )}

                  <button
                    className="btn btn-secondary btn-sm mobile-action-btn"
                    onClick={() => setFaultModalAsset(asset)}
                    title="Arıza Durumu Bildir"
                  >
                    <AlertTriangle size={13} color="#f87171" />
                    <span>Arıza</span>
                  </button>

                  {isAdmin && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                      <button
                        className="btn-icon"
                        style={{ width: 30, height: 30 }}
                        onClick={() => setAssetModalState({ isOpen: true, asset })}
                        title="Düzenle"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn-icon"
                        style={{ width: 30, height: 30 }}
                        onClick={() => handleDelete(asset)}
                        title="Sil"
                      >
                        <Trash2 size={13} color="#ef4444" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination
          pagination={pagination}
          onPageChange={(p) => fetchAssets(p)}
          onLimitChange={(l) => {
            setPagination((prev) => ({ ...prev, limit: l }));
            fetchAssets(1, l);
          }}
        />
      </div>

      {/* Modals */}
      <QRModal asset={qrModalAsset} onClose={() => setQrModalAsset(null)} />

      <AssetModal
        isOpen={assetModalState.isOpen}
        asset={assetModalState.asset}
        onClose={() => setAssetModalState({ isOpen: false, asset: null })}
        onSuccess={() => fetchAssets(pagination.page)}
      />

      <AssignModal
        isOpen={Boolean(assignModalAsset)}
        asset={assignModalAsset}
        onClose={() => setAssignModalAsset(null)}
        onSuccess={() => fetchAssets(pagination.page)}
      />

      <ReturnModal
        isOpen={Boolean(returnModalAsset)}
        asset={returnModalAsset}
        onClose={() => setReturnModalAsset(null)}
        onSuccess={() => fetchAssets(pagination.page)}
      />

      <FaultReportModal
        isOpen={Boolean(faultModalAsset)}
        asset={faultModalAsset}
        onClose={() => setFaultModalAsset(null)}
        onSuccess={() => fetchAssets(pagination.page)}
      />
    </div>
  );
}
