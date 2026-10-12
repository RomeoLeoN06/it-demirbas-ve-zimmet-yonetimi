import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  Archive,
  UserCheck,
  Users,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ onNavigateTab }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      setStats(res.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
        <Activity size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <div>Gösterge paneli verileri yükleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)',
          border: '1px solid var(--border-highlight)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          marginBottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 4 }}>
            Hoş Geldiniz, {user?.full_name} 👋
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Kurum IT Demirbaş ve Zimmet Durumu Genel Özeti (Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigateTab('assets')}>
            <Boxes size={16} />
            <span>Envanteri İncele</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigateTab('my-assets')}>
            <UserCheck size={16} />
            <span>Zimmetli Cihazlarım</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="stats-grid">
        {/* Total Assets */}
        <div className="stat-card" onClick={() => onNavigateTab('assets')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Boxes size={26} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Toplam IT Demirbaşı</div>
            <div className="stat-value">{stats.totalAssets}</div>
            <div className="stat-subtext">Sistemde kayıtlı donanım</div>
          </div>
        </div>

        {/* Faulty Assets */}
        <div className="stat-card" onClick={() => onNavigateTab('assets')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <AlertTriangle size={26} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Arızalı Cihazlar</div>
            <div className="stat-value" style={{ color: stats.faultyAssets > 0 ? '#f87171' : 'inherit' }}>
              {stats.faultyAssets}
            </div>
            <div className="stat-subtext">Müdahale ve servis bekleyen</div>
          </div>
        </div>

        {/* In Stock / Idle */}
        <div className="stat-card" onClick={() => onNavigateTab('assets')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Archive size={26} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Boşta / Depoda Bekleyen</div>
            <div className="stat-value" style={{ color: '#60a5fa' }}>{stats.idleAssets}</div>
            <div className="stat-subtext">Zimmetlemeye hazır cihaz</div>
          </div>
        </div>

        {/* Assigned */}
        <div className="stat-card" onClick={() => onNavigateTab('assets')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <UserCheck size={26} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Personele Zimmetli</div>
            <div className="stat-value" style={{ color: '#34d399' }}>{stats.assignedAssets}</div>
            <div className="stat-subtext">Kullanımda olan donanımlar</div>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown & Recent Movements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Categories Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} color="#38bdf8" />
              <span>Kategori Bazlı Dağılım</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Donanım Tipleri</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats.categoryStats?.map((c) => {
              const pct = stats.totalAssets > 0 ? Math.round((c.count / stats.totalAssets) * 100) : 0;
              return (
                <div key={c.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{c.category}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {c.count} adet ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-surface)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'var(--primary-gradient)',
                        borderRadius: 4,
                        transition: 'width 0.5s ease-out'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Users size={18} color="#8b5cf6" />
              <span>Departman Zimmet Dağılımı</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Birim Bazında</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats.departmentStats?.length > 0 ? (
              stats.departmentStats.map((d) => {
                const pct = stats.assignedAssets > 0 ? Math.round((d.count / stats.assignedAssets) * 100) : 0;
                return (
                  <div key={d.department || 'Birim Yok'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{d.department || 'Birim Belirtilmemiş'}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {d.count} cihaz ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg-surface)', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                          borderRadius: 4
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                Henüz departman zimmeti bulunmuyor.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Movements and Audit Logs Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Activity size={18} color="#10b981" />
            <span>Son Zimmet Hareketleri ve Sistem Logları</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigateTab('assignments')}>
            <span>Tümünü Gör</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>İşlem / Aksiyon</th>
                <th>Açıklama & Detay</th>
                <th>İşlemi Yapan</th>
                <th>Tarih & Saat</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentLogs?.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: 4,
                        background:
                          log.action === 'zimmetlendi' ? 'rgba(16, 185, 129, 0.15)' :
                          log.action === 'iade_edildi' ? 'rgba(59, 130, 246, 0.15)' :
                          log.action === 'ariza_bildirildi' ? 'rgba(239, 68, 68, 0.15)' :
                          'rgba(148, 163, 184, 0.15)',
                        color:
                          log.action === 'zimmetlendi' ? '#34d399' :
                          log.action === 'iade_edildi' ? '#60a5fa' :
                          log.action === 'ariza_bildirildi' ? '#f87171' :
                          '#94a3b8'
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td>{log.details}</td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{log.user_name || 'Sistem'}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
