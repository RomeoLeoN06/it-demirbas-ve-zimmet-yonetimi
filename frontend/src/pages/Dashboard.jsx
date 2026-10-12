import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  Archive,
  UserCheck,
  Layers,
  Users,
  QrCode,
  PlusCircle,
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ onNavigateTab, onOpenScanner }) {
  const { user, isAdmin } = useAuth();
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
        <Activity size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12, color: 'var(--accent-cyan)' }} />
        <div style={{ fontWeight: 600 }}>Gösterge paneli verileri yükleniyor...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Sleek Compact Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.22) 0%, rgba(99, 102, 241, 0.12) 100%)',
          border: '1px solid var(--border-highlight)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              Hoş Geldiniz, {user?.full_name}
            </h2>
            <span style={{ fontSize: '1.1rem' }}>👋</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>
            IT Demirbaş ve Zimmet Durumu Genel Özeti (Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü)
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigateTab('assets')}>
            <Boxes size={15} />
            <span>Envanteri İncele</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigateTab('my-assets')}>
            <UserCheck size={15} />
            <span>Zimmetli Cihazlarım</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid - 4 Column Row */}
      <div className="stats-grid">
        {/* Total Assets */}
        <div className="stat-card" onClick={() => onNavigateTab('assets')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
            <Boxes size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Toplam IT Demirbaşı</div>
            <div className="stat-value">{stats.totalAssets}</div>
            <div className="stat-subtext">Sistemde kayıtlı donanım</div>
          </div>
        </div>

        {/* Faulty Assets */}
        <div className="stat-card" onClick={() => onNavigateTab('assets')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Arızalı Cihazlar</div>
            <div className="stat-value" style={{ color: stats.faultyAssets > 0 ? '#f87171' : '#ffffff' }}>
              {stats.faultyAssets}
            </div>
            <div className="stat-subtext">Servis bekleyen</div>
          </div>
        </div>

        {/* Idle / In Stock */}
        <div className="stat-card" onClick={() => onNavigateTab('assets')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
            <Archive size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Boşta / Depoda Bekleyen</div>
            <div className="stat-value" style={{ color: '#60a5fa' }}>{stats.idleAssets}</div>
            <div className="stat-subtext">Zimmetlemeye hazır</div>
          </div>
        </div>

        {/* Assigned */}
        <div className="stat-card" onClick={() => onNavigateTab('assets')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Personele Zimmetli</div>
            <div className="stat-value" style={{ color: '#34d399' }}>{stats.assignedAssets}</div>
            <div className="stat-subtext">Aktif kullanımda</div>
          </div>
        </div>
      </div>

      {/* 3-Column Balanced Analytics & Quick Action Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Card 1: Categories Breakdown */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title" style={{ fontSize: '0.98rem' }}>
              <Layers size={17} color="#38bdf8" />
              <span>Kategori Bazlı Dağılım</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Donanım Tipleri</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {stats.categoryStats?.slice(0, 5).map((c) => {
              const pct = stats.totalAssets > 0 ? Math.round((c.count / stats.totalAssets) * 100) : 0;
              return (
                <div key={c.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{c.category}</span>
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                      {c.count} adet <span style={{ color: '#94a3b8', fontWeight: 500 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: 6, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'var(--primary-gradient)',
                        borderRadius: 4
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Department Breakdown */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title" style={{ fontSize: '0.98rem' }}>
              <Users size={17} color="#a855f7" />
              <span>Departman Zimmet Dağılımı</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Birim Bazında</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {stats.departmentStats?.length > 0 ? (
              stats.departmentStats.slice(0, 5).map((d) => {
                const pct = stats.assignedAssets > 0 ? Math.round((d.count / stats.assignedAssets) * 100) : 0;
                return (
                  <div key={d.department || 'Birim Yok'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, color: '#ffffff' }}>{d.department || 'Birim Belirtilmemiş'}</span>
                      <span style={{ color: '#c084fc', fontWeight: 700 }}>
                        {d.count} cihaz <span style={{ color: '#94a3b8', fontWeight: 500 }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 6, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
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
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', padding: '16px' }}>
                Henüz departman zimmeti bulunmuyor.
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Quick Field Shortcuts & Logs Navigation Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div className="card-title" style={{ fontSize: '0.98rem' }}>
                <ShieldCheck size={17} color="#10b981" />
                <span>Saha & Hızlı Yönetim</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>Sistem Aktif</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginBottom: 14 }}>
              Donanım işlemleri ve zimmet kayıtlarını tek tıkla başlatın:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '9px 12px' }}
                onClick={() => {
                  if (onOpenScanner) onOpenScanner();
                }}
              >
                <QrCode size={16} color="#38bdf8" />
                <span>QR Kod / Barkod Okuyucu Başlat</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '9px 12px' }}
                onClick={() => onNavigateTab('assets')}
              >
                <PlusCircle size={16} color="#10b981" />
                <span>Demirbaş Envanterine Git</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '9px 12px' }}
                onClick={() => onNavigateTab('assignments')}
              >
                <FileText size={16} color="#f59e0b" />
                <span>Tüm Zimmet & Sistem Loglarını Görüntüle</span>
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(2, 132, 199, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
              Detaylı denetim kayıtları için:
            </div>
            <button
              onClick={() => onNavigateTab('assignments')}
              style={{
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>Loglar Sayfası</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
