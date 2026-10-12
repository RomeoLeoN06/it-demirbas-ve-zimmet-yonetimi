import React, { useState } from 'react';
import { X, QrCode, Search, CheckCircle, AlertTriangle, UserCheck, ShieldAlert, Laptop, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function QRScannerModal({ isOpen, onClose, onActionSuccess, onOpenAssign, onOpenReturn, onOpenFault }) {
  const [scanQuery, setScanQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannedAsset, setScannedAsset] = useState(null);
  const toast = useToast();

  if (!isOpen) return null;

  const handleSearch = async (queryToSearch) => {
    const q = (queryToSearch || scanQuery).trim();
    if (!q) {
      toast.warning('Lütfen bir QR içerik veya demirbaş kodu girin.');
      return;
    }

    setLoading(true);
    try {
      // Try to parse if it's JSON from QR
      let code = q;
      try {
        const parsed = JSON.parse(q);
        if (parsed.code) code = parsed.code;
        else if (parsed.serial) code = parsed.serial;
      } catch (e) {
        // Not JSON, use raw string
      }

      const res = await api.getAssetById(code);
      if (res.data) {
        setScannedAsset(res.data);
        toast.success(`Cihaz bulundu: ${res.data.name}`);
      }
    } catch (err) {
      toast.error('Belirtilen QR veya seri numarasına sahip demirbaş bulunamadı.');
      setScannedAsset(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoScan = (sampleCode) => {
    setScanQuery(sampleCode);
    handleSearch(sampleCode);
  };

  const resetScanner = () => {
    setScannedAsset(null);
    setScanQuery('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <QrCode size={22} color="#0284c7" />
            <span>QR Kod Okuma & Cihaz Tanıma</span>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {!scannedAsset ? (
            <div>
              <div
                style={{
                  border: '2px dashed var(--border-highlight)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '30px 20px',
                  textAlign: 'center',
                  background: 'rgba(2, 132, 199, 0.04)',
                  marginBottom: 20
                }}
              >
                <QrCode size={56} color="#38bdf8" style={{ marginBottom: 14 }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>
                  QR Kod Tara veya Demirbaş Kodunu Gir
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Saha personeli cihaz üzerindeki etiketi okutarak anında teknik detaylara ve zimmet işlemlerine erişebilir.
                </p>

                <div style={{ display: 'flex', gap: 8, maxWidth: 380, margin: '0 auto' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Örn: DMB-2026-001 veya Seri No"
                    value={scanQuery}
                    onChange={(e) => setScanQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoFocus
                  />
                  <button className="btn btn-primary" onClick={() => handleSearch()} disabled={loading}>
                    <Search size={16} />
                    <span>Sorgula</span>
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Hızlı Test / Simüle Okutma Seçenekleri:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDemoScan('DMB-2026-001')}>
                    MacBook Pro (DMB-2026-001)
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDemoScan('DMB-2026-005')}>
                    Depodaki Monitör (DMB-2026-005)
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDemoScan('DMB-2026-008')}>
                    Arızalı Yazıcı (DMB-2026-008)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Asset Identified Card */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: 18,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-highlight)',
                  marginBottom: 20
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span className="table-asset-code" style={{ marginBottom: 6 }}>{scannedAsset.asset_code}</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{scannedAsset.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {scannedAsset.brand} {scannedAsset.model}
                    </div>
                  </div>
                  <span className={`badge badge-${scannedAsset.status}`}>
                    <span className="badge-dot" />
                    {scannedAsset.status}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 12,
                    fontSize: '0.84rem',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: 12
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Seri No:</span>
                    <strong>{scannedAsset.serial_number}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Kategori:</span>
                    <strong>{scannedAsset.category}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Alım Tarihi:</span>
                    <span>{scannedAsset.purchase_date || 'Belirtilmemiş'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Garanti Bitiş:</span>
                    <span>{scannedAsset.warranty_end_date || 'Belirtilmemiş'}</span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Mevcut Zimmetli Personel:</span>
                    {scannedAsset.assigned_user_name ? (
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                        {scannedAsset.assigned_user_name} ({scannedAsset.assigned_user_department || 'Birim Yok'})
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Cihaz depoda boşta bekliyor</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Field Actions (Personele Teslim Et, Cihazı Geri Kabul Et, Arıza Bildir) */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase' }}>
                  Hızlı Saha İşlemleri:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                  {scannedAsset.status !== 'zimmetli' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        onClose();
                        if (onOpenAssign) onOpenAssign(scannedAsset);
                      }}
                    >
                      <UserCheck size={16} />
                      <span>Personele Teslim Et</span>
                    </button>
                  )}

                  {scannedAsset.status === 'zimmetli' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: '#10b981', color: '#34d399' }}
                      onClick={() => {
                        onClose();
                        if (onOpenReturn) onOpenReturn(scannedAsset);
                      }}
                    >
                      <CheckCircle size={16} />
                      <span>Geri Kabul Et</span>
                    </button>
                  )}

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      onClose();
                      if (onOpenFault) onOpenFault(scannedAsset);
                    }}
                  >
                    <AlertTriangle size={16} />
                    <span>Arıza Durumu Bildir</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {scannedAsset ? (
            <button className="btn btn-secondary btn-sm" onClick={resetScanner}>
              Başka Cihaz Tara
            </button>
          ) : <div />}
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
