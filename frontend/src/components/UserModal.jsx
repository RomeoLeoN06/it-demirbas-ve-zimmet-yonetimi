import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function UserModal({ isOpen, onClose, user, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(user);

  const [departmentsList, setDepartmentsList] = useState([]);
  const [rolesList, setRolesList] = useState([]);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'personnel',
    department: '',
    phone: ''
  });

  useEffect(() => {
    if (isOpen) {
      api.getDepartments().then((res) => setDepartmentsList(res.data || [])).catch(() => {});
      api.getRoles().then((res) => setRolesList(res.data || [])).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'personnel',
        department: user.department || '',
        phone: user.phone || ''
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        role: 'personnel',
        department: departmentsList.length > 0 ? departmentsList[0].name : '',
        phone: ''
      });
    }
  }, [user, isOpen, departmentsList]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      toast.warning('Ad Soyad ve E-posta zorunludur.');
      return;
    }

    if (!isEditing && !formData.password) {
      toast.warning('Yeni kullanıcı için ilk şifre zorunludur.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.updateUser(user.id, formData);
        toast.success('Kullanıcı bilgileri güncellendi.');
      } else {
        await api.createUser(formData);
        toast.success('Yeni kullanıcı başarıyla eklendi.');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Kullanıcı kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {isEditing ? `Kullanıcı Düzenle: ${user.full_name}` : 'Yeni Kullanıcı / Personel Ekle'}
          </div>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Ad Soyad *</label>
              <input
                type="text"
                name="full_name"
                className="form-input"
                placeholder="Örn: Burak Özdemir"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kurumsal E-posta *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Örn: burak.ozdemir@kurum.gov.tr"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isEditing}
              />
            </div>

            {!isEditing && (
              <div className="form-group">
                <label className="form-label">Başlangıç Şifresi *</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="En az 6 karakter"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Yetki / Rol *</label>
                <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                  {rolesList.length > 0 ? (
                    rolesList.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.display_name} {r.is_system === 1 ? '(Sistem Rolü)' : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="personnel">Standart Personel</option>
                      <option value="admin">Sistem Yöneticisi (Admin)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Telefon</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  placeholder="05xx xxx xx xx"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Departman / Birim *</label>
              <select
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Departman Seçiniz...</option>
                {departmentsList.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
                {formData.department && !departmentsList.some((d) => d.name === formData.department) && (
                  <option value={formData.department}>{formData.department} (Mevcut)</option>
                )}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Kullanıcıyı Oluştur'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
