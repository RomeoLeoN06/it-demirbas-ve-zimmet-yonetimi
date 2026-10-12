import React from 'react';
import { X, Download, Printer, Shield } from 'lucide-react';

export default function QRModal({ asset, onClose }) {
  if (!asset) return null;

  const handleDownload = () => {
    if (!asset.qr_code_data) return;
    const link = document.createElement('a');
    link.href = asset.qr_code_data;
    link.download = `QR_${asset.asset_code}_${asset.name.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Demirbaş QR Etiketi - ${asset.asset_code}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #fff;
            }
            .label-card {
              border: 2px dashed #0f172a;
              border-radius: 12px;
              padding: 24px;
              width: 320px;
              text-align: center;
            }
            .header {
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .sub {
              font-size: 10px;
              color: #64748b;
              margin-bottom: 12px;
            }
            .qr-img {
              width: 180px;
              height: 180px;
              margin-bottom: 12px;
            }
            .code {
              font-family: monospace;
              font-size: 16px;
              font-weight: bold;
              color: #0284c7;
              background: #f0f9ff;
              padding: 4px 8px;
              border-radius: 4px;
              display: inline-block;
              margin-bottom: 8px;
            }
            .details {
              font-size: 11px;
              color: #334155;
              line-height: 1.4;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">T.C. DİJİTAL DÖNÜŞÜM KOORDİNATÖRLÜĞÜ</div>
            <div class="sub">IT DEMİRBAŞ & ZİMMET ETİKETİ</div>
            <img class="qr-img" src="${asset.qr_code_data}" alt="QR" />
            <div class="code">${asset.asset_code}</div>
            <div class="details">
              <strong>${asset.name}</strong><br/>
              Seri No: ${asset.serial_number}<br/>
              Kategori: ${asset.category} | ${asset.brand}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Demirbaş QR Kod Etiketi</div>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
          <div
            style={{
              background: '#ffffff',
              padding: 20,
              borderRadius: 'var(--radius-lg)',
              display: 'inline-block',
              boxShadow: 'var(--shadow-md)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              marginBottom: 18
            }}
          >
            {asset.qr_code_data ? (
              <img
                src={asset.qr_code_data}
                alt={`QR ${asset.asset_code}`}
                style={{ width: 220, height: 220, display: 'block', borderRadius: 8 }}
              />
            ) : (
              <div style={{ padding: 40, color: '#64748b' }}>QR Kod oluşturulamadı</div>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <span className="table-asset-code" style={{ fontSize: '1rem', padding: '4px 14px' }}>
              {asset.asset_code}
            </span>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{asset.name}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
            {asset.brand} - {asset.model}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Seri No: <strong>{asset.serial_number}</strong>
          </p>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={16} />
            <span>Etiket Yazdır</span>
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={handleDownload}>
              <Download size={16} />
              <span>PNG İndir</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
