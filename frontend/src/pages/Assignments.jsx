import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, RotateCcw, CheckCircle, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/Pagination';

export default function Assignments() {
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');

  const fetchHistory = async (page = 1, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await api.getAssignmentHistory({ page, limit, search });
      setHistory(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error('Zimmet hareket geçmişi yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, [search]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Zimmet Yönetimi ve Hareket Logları</h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Kurum personeline tahsis edilen tüm donanımların geçmiş ve aktif zimmet kayıtları
        </p>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Personel Adı, Cihaz Kodu, Demirbaş Adı veya Yönetici Ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <button className="btn btn-secondary btn-sm" onClick={() => setSearch('')}>
            <RotateCcw size={14} />
            <span>Temizle</span>
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Durum</th>
              <th>Demirbaş Cihaz</th>
              <th>Zimmetli Personel</th>
              <th>Departman</th>
              <th>Teslim Tarihi</th>
              <th>İade Tarihi</th>
              <th>İşlemi Yapan Yönetici</th>
              <th>Teslim / İade Notu</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Zimmet logları yükleniyor...
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Kayıtlı zimmet hareketi bulunamadı.
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.status === 'aktif' ? (
                      <span className="badge badge-zimmetli">
                        <span className="badge-dot" />
                        Aktif Zimmet
                      </span>
                    ) : (
                      <span className="badge badge-depoda">
                        <span className="badge-dot" />
                        İade Edildi
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="table-asset-code">{item.asset_code}</span>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>{item.asset_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.asset_category}</div>
                  </td>
                  <td>
                    <strong style={{ color: '#38bdf8' }}>{item.user_name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.user_email}</div>
                  </td>
                  <td>{item.user_department || '—'}</td>
                  <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {item.assigned_date ? new Date(item.assigned_date).toLocaleDateString('tr-TR') : '—'}
                  </td>
                  <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {item.return_date ? (
                      <span style={{ color: '#60a5fa' }}>{new Date(item.return_date).toLocaleDateString('tr-TR')}</span>
                    ) : (
                      <span style={{ color: '#34d399', fontWeight: 500 }}>Halen Kullanımda</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {item.assigned_by_name || 'Sistem Yöneticisi'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 240 }}>
                    {item.return_notes ? (
                      <div>
                        <strong>İade Notu:</strong> {item.return_notes}
                      </div>
                    ) : (
                      <div>{item.handover_notes || '—'}</div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <Pagination
          pagination={pagination}
          onPageChange={(p) => fetchHistory(p)}
          onLimitChange={(l) => {
            setPagination((prev) => ({ ...prev, limit: l }));
            fetchHistory(1, l);
          }}
        />
      </div>
    </div>
  );
}
