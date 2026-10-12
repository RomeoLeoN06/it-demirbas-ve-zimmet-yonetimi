import React, { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AssignModal({ isOpen, onClose, asset, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('Eksiksiz ve çalışır vaziyette personele teslim edildi.');
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      api.getUsers({ limit: 100 })
        .then((res) => {
          setUsers(res.data || []);
          if (res.data && res.data.length > 0) {
            setSelectedUserId(res.data[0].id);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.warning('Lütfen zimmetlenecek personeli seçiniz.');
      return;
    }

    setLoading(true);
    try {
      await api.assignAsset({
        asset_id: asset.id,
        user_id: selectedUserId,
        handover_notes: handoverNotes,
        assigned_date: assignedDate
      });
      toast.success('Demirbaş cihaz başarıyla personele zimmetlendi.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Zimmetleme işlemi gerçekleştirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserCheck size={20} color="#10b981" />
            <span>Personele Zimmetle (Teslim Et)</span>
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
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Zimmetlenecek Cihaz:</div>
              <strong style={{ fontSize: '0.95rem' }}>{asset.name}</strong>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Kod: {asset.asset_code} | Seri: {asset.serial_number}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Zimmetlenecek Personel *</label>
              <select
                className="form-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.department || 'Birim Yok'}) - {u.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Teslim Tarihi</label>
              <input
                type="date"
                className="form-input"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teslim / Zimmet Notu</label>
              <textarea
                className="form-textarea"
                placeholder="Örn: Aksesuarlarıyla birlikte sağlam teslim edildi..."
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <UserCheck size={16} />
              <span>{loading ? 'Zimmetleniyor...' : 'Zimmeti Onayla'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
