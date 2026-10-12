import React, { useState } from 'react';
import { X, KeyRound } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function PasswordResetModal({ isOpen, onClose, user }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.warning('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      await api.resetUserPassword(user.id, { new_password: newPassword });
      toast.success(`${user.full_name} kullanıcısının şifresi başarıyla güncellendi.`);
      setNewPassword('');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Şifre sıfırlanamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <KeyRound size={20} color="#f59e0b" />
            <span>Şifre Sıfırla</span>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
              <strong>{user.full_name}</strong> ({user.email}) için yeni bir şifre tanımlayınız.
            </p>

            <div className="form-group">
              <label className="form-label">Yeni Şifre *</label>
              <input
                type="password"
                className="form-input"
                placeholder="En az 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <span>{loading ? 'İşleniyor...' : 'Şifreyi Değiştir'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
