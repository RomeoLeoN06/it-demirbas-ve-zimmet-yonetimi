import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function FaultReportModal({ isOpen, onClose, asset, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [faultDescription, setFaultDescription] = useState('');

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!faultDescription.trim()) {
      toast.warning('Lütfen arıza detayını açıklayınız.');
      return;
    }

    setLoading(true);
    try {
      await api.reportFault(asset.id, { fault_description: faultDescription });
      toast.success('Arıza bildirimi kaydedildi ve durum güncellendi.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Arıza bildirimi kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={20} color="#ef4444" />
            <span>Arıza Durumu Bildir</span>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                padding: 14,
                borderRadius: 'var(--radius-md)',
                marginBottom: 16,
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#f87171' }}>Arıza Bildirilen Cihaz:</div>
              <strong style={{ fontSize: '0.95rem' }}>{asset.name}</strong>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Kod: {asset.asset_code} | Seri: {asset.serial_number}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Arıza Açıklaması ve Belirtiler *</label>
              <textarea
                className="form-textarea"
                placeholder="Örn: Ekranda dikey çizgiler oluşuyor, cihaz aniden kapanıyor, şarj almıyor..."
                value={faultDescription}
                onChange={(e) => setFaultDescription(e.target.value)}
                required
                style={{ minHeight: 110 }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-danger" disabled={loading}>
              <AlertTriangle size={16} />
              <span>{loading ? 'Kaydediliyor...' : 'Arızayı Bildir'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
