import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ReturnModal({ isOpen, onClose, asset, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [returnCondition, setReturnCondition] = useState('depoda');
  const [returnNotes, setReturnNotes] = useState('Cihaz personelden eksiksiz teslim alındı.');

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.returnAsset({
        asset_id: asset.id,
        return_condition: returnCondition,
        return_notes: returnNotes
      });
      toast.success('Demirbaş cihaz başarıyla zimmetten düşüldü.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Zimmetten düşme işlemi gerçekleştirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={20} color="#10b981" />
            <span>Zimmetten Düş (İade Al)</span>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                background: 'var(--bg-surface)',
                padding: 14,
                borderRadius: 'var(--radius-md)',
                marginBottom: 16,
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>İade Alınan Cihaz:</div>
              <strong style={{ fontSize: '0.95rem' }}>{asset.name}</strong>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Zimmetli Personel: <strong>{asset.assigned_user_name || 'Bilinmiyor'}</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cihazın İade Durumu *</label>
              <select
                className="form-select"
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
              >
                <option value="depoda">Depoya Alındı (Sağlam & Boşta)</option>
                <option value="bakimda">Bakıma / Temizliğe Alındı</option>
                <option value="arizali">Arızalı Teslim Alındı</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">İade / Teslim Alma Notu</label>
              <textarea
                className="form-textarea"
                placeholder="Örn: Adaptörüyle birlikte sağlam geri alındı..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <CheckCircle size={16} />
              <span>{loading ? 'İşleniyor...' : 'İadeyi Onayla'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
