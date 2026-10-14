import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, RotateCcw, Activity, ShieldAlert, History } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/Pagination';

export default function Assignments() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'audit'

  // Assignments history state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [searchHistory, setSearchHistory] = useState('');

  // System audit logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPagination, setAuditPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [searchAudit, setSearchAudit] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchHistory = async (page = 1, limit = historyPagination.limit) => {
    setHistoryLoading(true);
    try {
      const res = await api.getAssignmentHistory({ page, limit, search: searchHistory });
      setHistory(res.data || []);
      setHistoryPagination(res.pagination);
    } catch (err) {
      toast.error('Zimmet hareket geçmişi yüklenemedi.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchAuditLogs = async (page = 1, limit = auditPagination.limit) => {
    setAuditLoading(true);
    try {
      const res = await api.getSystemAuditLogs({
        page,
        limit,
        search: searchAudit,
        action: actionFilter
      });
      setAuditLogs(res.data || []);
      setAuditPagination(res.pagination);
    } catch (err) {
      toast.error('Sistem denetim logları yüklenemedi.');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'assignments') {
      fetchHistory(1);
    } else {
      fetchAuditLogs(1);
    }
  }, [activeTab, searchHistory, searchAudit, actionFilter]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Zimmet ve Sistem Hareket Logları
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Tüm zimmet atamaları, iadeler, arıza kayıtları ve kurumsal denetim logları
        </p>
      </div>

      {/* Tabs */}
      <div className="assignments-tab-bar" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('assignments')}
        >
          <History size={15} />
          <span>Zimmet Hareket Geçmişi</span>
        </button>

        <button
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('audit')}
        >
          <Activity size={15} />
          <span>Sistem Denetim Logları (Audit)</span>
        </button>
      </div>

      {/* View 1: Assignments History */}
      {activeTab === 'assignments' && (
        <div>
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Personel Adı, Cihaz Kodu, Demirbaş Adı veya Yönetici Ara..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
              />
            </div>
            {searchHistory && (
              <button className="btn btn-secondary btn-sm" onClick={() => setSearchHistory('')}>
                <RotateCcw size={14} />
                <span>Temizle</span>
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="data-table desktop-table-view">
              <thead>
                <tr>
                  <th>Durum</th>
                  <th>Demirbaş Cihaz</th>
                  <th>Zimmetli Personel</th>
                  <th>Departman</th>
                  <th>Teslim Tarihi</th>
                  <th>İade Tarihi</th>
                  <th>İşlemi Yapan</th>
                  <th>Teslim / İade Notu</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      Zimmet logları yükleniyor...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
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
                        <div style={{ fontWeight: 700, marginTop: 2, color: 'var(--text-primary)' }}>{item.asset_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.asset_category}</div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--primary)', fontWeight: 700 }}>{item.user_name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.user_email}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.user_department || '—'}</td>
                      <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {item.assigned_date ? new Date(item.assigned_date).toLocaleDateString('tr-TR') : '—'}
                      </td>
                      <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {item.return_date ? (
                          <span style={{ color: '#2563eb', fontWeight: 600 }}>{new Date(item.return_date).toLocaleDateString('tr-TR')}</span>
                        ) : (
                          <span style={{ color: '#059669', fontWeight: 600 }}>Halen Kullanımda</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {item.assigned_by_name || 'Sistem Yöneticisi'}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 220 }}>
                        {item.return_notes ? (
                          <div>
                            <strong style={{ color: '#60a5fa' }}>İade:</strong> {item.return_notes}
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

            {/* Mobile Cards View for Assignments History */}
            <div className="mobile-cards-view">
              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
                  Zimmet logları yükleniyor...
                </div>
              ) : history.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
                  Kayıtlı zimmet hareketi bulunamadı.
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="asset-mobile-card">
                    {/* Header: Code, Category, Status */}
                    <div className="mobile-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="table-asset-code">{item.asset_code}</span>
                        <span className="mobile-category-pill">{item.asset_category}</span>
                      </div>
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
                    </div>

                    {/* Title */}
                    <div className="mobile-card-title-row">
                      <h3 className="mobile-card-title">{item.asset_name}</h3>
                    </div>

                    {/* Details Grid */}
                    <div className="mobile-card-details-grid">
                      <div className="mobile-detail-item">
                        <span className="mobile-detail-label">Zimmetli Personel</span>
                        <strong style={{ color: 'var(--primary)', fontSize: '0.80rem' }}>{item.user_name}</strong>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.user_email}
                        </div>
                      </div>

                      <div className="mobile-detail-item">
                        <span className="mobile-detail-label">Departman / Birim</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {item.user_department || '—'}
                        </span>
                      </div>

                      <div className="mobile-detail-item">
                        <span className="mobile-detail-label">Teslim Tarihi</span>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {item.assigned_date ? new Date(item.assigned_date).toLocaleDateString('tr-TR') : '—'}
                        </span>
                      </div>

                      <div className="mobile-detail-item">
                        <span className="mobile-detail-label">İade Durumu</span>
                        {item.return_date ? (
                          <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.76rem' }}>
                            {new Date(item.return_date).toLocaleDateString('tr-TR')} (İade)
                          </span>
                        ) : (
                          <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.76rem' }}>
                            Halen Kullanımda
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>İşlemi Yapan: </span>
                        {item.assigned_by_name || 'Sistem Yöneticisi'}
                      </div>
                      {(item.return_notes || item.handover_notes) && (
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Not: </span>
                          {item.return_notes ? `İade Notu: ${item.return_notes}` : item.handover_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <Pagination
              pagination={historyPagination}
              onPageChange={(p) => fetchHistory(p)}
              onLimitChange={(l) => {
                setHistoryPagination((prev) => ({ ...prev, limit: l }));
                fetchHistory(1, l);
              }}
            />
          </div>
        </div>
      )}

      {/* View 2: System Audit Logs */}
      {activeTab === 'audit' && (
        <div>
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Log detayı, kullanıcı adı veya cihaz kodu ara..."
                value={searchAudit}
                onChange={(e) => setSearchAudit(e.target.value)}
              />
            </div>

            <div className="filter-actions">
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">Tüm İşlemler</option>
                <option value="olusturuldu">Demirbaş Oluşturuldu</option>
                <option value="guncellendi">Demirbaş Güncellendi</option>
                <option value="zimmetlendi">Personele Zimmetlendi</option>
                <option value="iade_edildi">İade Edildi</option>
                <option value="ariza_bildirildi">Arıza Bildirildi</option>
                <option value="silindi">Demirbaş Silindi</option>
                <option value="giris_yapildi">Giriş Yapıldı</option>
              </select>

              {(searchAudit || actionFilter) && (
                <button className="btn btn-secondary btn-sm" onClick={() => { setSearchAudit(''); setActionFilter(''); }}>
                  <RotateCcw size={14} />
                  <span>Sıfırla</span>
                </button>
              )}
            </div>
          </div>

          <div className="table-container">
            <table className="data-table desktop-table-view">
              <thead>
                <tr>
                  <th>İşlem Tipi</th>
                  <th>İşlem Detayı / Açıklama</th>
                  <th>İlgili Cihaz</th>
                  <th>İşlemi Yapan Kullanıcı</th>
                  <th>Tarih ve Saat</th>
                </tr>
              </thead>
              <tbody>
                {auditLoading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      Denetim logları yükleniyor...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      Kayıtlı sistem logu bulunamadı.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            padding: '3px 8px',
                            borderRadius: 4,
                            background:
                              log.action === 'zimmetlendi' ? 'rgba(16, 185, 129, 0.2)' :
                              log.action === 'iade_edildi' ? 'rgba(59, 130, 246, 0.2)' :
                              log.action === 'ariza_bildirildi' ? 'rgba(239, 68, 68, 0.2)' :
                              log.action === 'olusturuldu' ? 'rgba(14, 165, 233, 0.2)' :
                              'rgba(148, 163, 184, 0.15)',
                            color:
                              log.action === 'zimmetlendi' ? '#34d399' :
                              log.action === 'iade_edildi' ? '#60a5fa' :
                              log.action === 'ariza_bildirildi' ? '#f87171' :
                              log.action === 'olusturuldu' ? '#38bdf8' :
                              '#cbd5e1'
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{log.details}</td>
                      <td>
                        {log.asset_code ? (
                          <div>
                            <span className="table-asset-code">{log.asset_code}</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{log.asset_name}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{log.user_name || 'Sistem'}</strong>
                        {log.user_email && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.user_email}</div>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile Cards for Audit Logs */}
            <div className="mobile-cards-view">
              {auditLoading ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
                  Denetim logları yükleniyor...
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
                  Kayıtlı sistem logu bulunamadı.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="asset-mobile-card">
                    {/* Header: Action Type & Date */}
                    <div className="mobile-card-header">
                      <span
                        style={{
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: 6,
                          background:
                            log.action === 'zimmetlendi' ? 'rgba(16, 185, 129, 0.2)' :
                            log.action === 'iade_edildi' ? 'rgba(59, 130, 246, 0.2)' :
                            log.action === 'ariza_bildirildi' ? 'rgba(239, 68, 68, 0.2)' :
                            log.action === 'olusturuldu' ? 'rgba(14, 165, 233, 0.2)' :
                            'rgba(148, 163, 184, 0.15)',
                          color:
                            log.action === 'zimmetlendi' ? '#34d399' :
                            log.action === 'iade_edildi' ? '#60a5fa' :
                            log.action === 'ariza_bildirildi' ? '#f87171' :
                            log.action === 'olusturuldu' ? '#38bdf8' :
                            '#cbd5e1'
                        }}
                      >
                        {log.action}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString('tr-TR')}
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.35 }}>
                      {log.details}
                    </div>

                    {/* Footer: Device & User info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingTop: 6, borderTop: '1px solid var(--border-subtle)', fontSize: '0.74rem' }}>
                      <div>
                        {log.asset_code ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span className="table-asset-code">{log.asset_code}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{log.asset_name}</span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {log.user_name || 'Sistem'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Pagination
              pagination={auditPagination}
              onPageChange={(p) => fetchAuditLogs(p)}
              onLimitChange={(l) => {
                setAuditPagination((prev) => ({ ...prev, limit: l }));
                fetchAuditLogs(1, l);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
