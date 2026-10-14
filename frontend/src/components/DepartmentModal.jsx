import React, { useState, useEffect } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function DepartmentModal({ isOpen, onClose, department, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(department);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        description: department.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
  }, [department, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning('Departman / birim adı zorunludur.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.updateDepartment(department.id, formData);
        toast.success('Departman bilgileri başarıyla güncellendi.');
      } else {
        await api.createDepartment(formData);
        toast.success('Yeni departman başarıyla oluşturuldu.');
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
            <Building2 size={20} color="#0284c7" />
            <span>{isEditing ? `Departman Düzenle: ${department.name}` : 'Yeni Departman / Birim Ekle'}</span>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Departman / Birim Adı *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Örn: Siber Güvenlik ve Operasyon Dairesi"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Açıklama / Görev Kapsamı</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Bu birimin görev tanımı, operasyon alanı veya sorumlulukları..."
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
              <span>{loading ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Departmanı Oluştur'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
