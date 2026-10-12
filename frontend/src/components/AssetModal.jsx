import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  'Bilgisayar',
  'Monitör',
  'Sunucu',
  'Ağ Cihazı',
  'Yazıcı',
  'Tablet',
  'Telefon',
  'Diğer'
];

const STATUSES = [
  { value: 'depoda', label: 'Depoda (Boşta)' },
  { value: 'zimmetli', label: 'Zimmetli (Kullanımda)' },
  { value: 'arizali', label: 'Arızalı' },
  { value: 'bakimda', label: 'Bakımda / Serviste' },
  { value: 'hurda', label: 'Hurda / Hizmet Dışı' }
];

export default function AssetModal({ isOpen, onClose, asset, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(asset);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Bilgisayar',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    warranty_end_date: '',
    purchase_cost: '',
    status: 'depoda',
    notes: ''
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        category: asset.category || 'Bilgisayar',
        brand: asset.brand || '',
        model: asset.model || '',
        serial_number: asset.serial_number || '',
        purchase_date: asset.purchase_date || '',
        warranty_end_date: asset.warranty_end_date || '',
        purchase_cost: asset.purchase_cost || '',
        status: asset.status || 'depoda',
        notes: asset.notes || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'Bilgisayar',
        brand: '',
        model: '',
        serial_number: '',
        purchase_date: new Date().toISOString().split('T')[0],
        warranty_end_date: '',
        purchase_cost: '',
        status: 'depoda',
        notes: ''
      });
    }
  }, [asset, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.model || !formData.serial_number) {
      toast.warning('Cihaz adı, marka, model ve seri no alanları zorunludur.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.updateAsset(asset.id, formData);
        toast.success('Demirbaş cihaz başarıyla güncellendi.');
      } else {
        await api.createAsset(formData);
        toast.success('Yeni demirbaş kaydedildi ve QR kodu oluşturuldu.');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Demirbaş kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {isEditing ? `Demirbaş Güncelle: ${asset.asset_code}` : 'Yeni IT Demirbaşı Ekle'}
          </div>
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Cihaz / Donanım Tanımı *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Örn: MacBook Pro 16 M3 Max, Dell Latitude 5540"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Kategori *</label>
                <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cihaz Durumu</label>
                <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                  {STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>{st.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Marka *</label>
                <input
                  type="text"
                  name="brand"
                  className="form-input"
                  placeholder="Apple, Dell, Cisco..."
                  value={formData.brand}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Model *</label>
                <input
                  type="text"
                  name="model"
                  className="form-input"
                  placeholder="Örn: 5540 i7, DL380 Gen10"
                  value={formData.model}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Seri Numarası (Benzersiz) *</label>
              <input
                type="text"
                name="serial_number"
                className="form-input"
                placeholder="Örn: APL-MBP-9923841"
                value={formData.serial_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Satın Alım Tarihi</label>
                <input
                  type="date"
                  name="purchase_date"
                  className="form-input"
                  value={formData.purchase_date}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Garanti Bitiş Tarihi</label>
                <input
                  type="date"
                  name="warranty_end_date"
                  className="form-input"
                  value={formData.warranty_end_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Alım Maliyeti (₺)</label>
              <input
                type="number"
                name="purchase_cost"
                className="form-input"
                placeholder="Örn: 45000"
                value={formData.purchase_cost}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notlar ve Donanım Özellikleri</label>
              <textarea
                name="notes"
                className="form-textarea"
                placeholder="Örn: 32GB RAM, 1TB SSD, 2 yıl ek kurumsal destek paketi..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Kaydet ve QR Üret'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
