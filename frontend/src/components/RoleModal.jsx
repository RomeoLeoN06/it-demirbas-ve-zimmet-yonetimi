import React, { useState, useEffect } from 'react';
import { X, Shield, Save } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function RoleModal({ isOpen, onClose, role, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(role);

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: ''
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        display_name: role.display_name || '',
        description: role.description || ''
      });
    } else {
      setFormData({
        name: '',
        display_name: '',
        description: ''
      });
    }
  }, [role, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.display_name.trim()) {
      toast.warning('Rol görünen adı zorunludur.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.updateRole(role.id, formData);
        toast.success('Rol bilgileri güncellendi.');
      } else {
        await api.createRole(formData);
        toast.success('Yeni rol başarıyla tanımlandı.');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'İşlem gerçekleştirilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={20} color="#0284c7" />
            <span>{isEditing ? `Rol Düzenle: ${role.display_name}` : 'Yeni Rol ve Yetki Tanımı Ekle'}</span>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Rol Görünen Adı *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Örn: Donanım Sorumlusu veya Birim Amiri"
                value={formData.display_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                required
                autoFocus
              />
            </div>

            {!isEditing && (
              <div className="form-group">
                <label className="form-label">
                  Sistem Kodu (Opsiyonel)
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                    (Boş bırakılırsa addan otomatik üretilir)
                  </span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Örn: donanim_sorumlusu"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Yetki / Rol Açıklaması</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Bu role sahip kullanıcıların sistemdeki sorumlulukları ve yetki kapsamı..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Rolü Tanımla'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
