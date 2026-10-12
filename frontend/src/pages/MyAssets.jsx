import React, { useState, useEffect } from 'react';
import { UserCheck, QrCode, AlertTriangle, ShieldCheck, Laptop, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import QRModal from '../components/QRModal';
import FaultReportModal from '../components/FaultReportModal';

export default function MyAssets() {
  const { user } = useAuth();
  const toast = useToast();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [qrModalAsset, setQrModalAsset] = useState(null);
  const [faultModalAsset, setFaultModalAsset] = useState(null);

  const fetchMyAssets = async () => {
    setLoading(true);
    try {
      const res = await api.getMyAssets();
      setAssets(res.data || []);
    } catch (err) {
      toast.error('Zimmetli cihazlarınız alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAssets();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Üzerime Zimmetli IT Donanımları</h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Kurum tarafından adınıza tahsis edilmiş bilgisayar, monitör ve diğer çevre birimleri
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          Zimmetli cihazlar yükleniyor...
        </div>
      ) : assets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <UserCheck size={48} color="#64748b" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Üzerinizde Zimmetli Cihaz Bulunmuyor</h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto' }}>
            Şu anda adınıza kayıtlı herhangi bir donanım zimmeti görünmemektedir. İhtiyaç halinde IT Dairesi ile iletişime geçebilirsiniz.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {assets.map((asset) => (
            <div key={asset.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <span className="table-asset-code">{asset.asset_code}</span>
                <span className={`badge badge-${asset.status}`}>
                  <span className="badge-dot" />
                  {asset.status === 'zimmetli' ? 'Kullanımda' : asset.status}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{asset.name}</h3>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                {asset.brand} - {asset.model} ({asset.category})
              </div>

              <div
                style={{
                  background: 'var(--bg-surface-subtle)',
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginBottom: 16,
                  flex: 1
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Seri Numarası: </span>
                  <code>{asset.serial_number}</code>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Zimmet Tarihi: </span>
                  <strong>{asset.assigned_date ? new Date(asset.assigned_date).toLocaleDateString('tr-TR') : '—'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Garanti Bitiş: </span>
                  <span>{asset.warranty_end_date || 'Belirtilmemiş'}</span>
                </div>
                {asset.handover_notes && (
                  <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: 4 }}>
                    "{asset.handover_notes}"
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setQrModalAsset(asset)}
                >
                  <QrCode size={15} />
                  <span>QR Etiketi</span>
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setFaultModalAsset(asset)}
                >
                  <AlertTriangle size={15} />
                  <span>Arıza Bildir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <QRModal asset={qrModalAsset} onClose={() => setQrModalAsset(null)} />
      <FaultReportModal
        isOpen={Boolean(faultModalAsset)}
        asset={faultModalAsset}
        onClose={() => setFaultModalAsset(null)}
        onSuccess={fetchMyAssets}
      />
    </div>
  );
}
