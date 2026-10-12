import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Shield, Phone, Building, Mail } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [profileData, setProfileData] = useState({
    full_name: '',
    department: '',
    phone: '',
    avatar_url: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        department: user.department || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      await api.updateProfile(profileData);
      await refreshUser();
      toast.success('Profil bilgileriniz başarıyla güncellendi.');
    } catch (err) {
      toast.error(err.message || 'Profil güncellenemedi.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.warning('Yeni şifreler birbiriyle eşleşmiyor.');
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.warning('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoadingPassword(true);
    try {
      await api.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      toast.success('Şifreniz başarıyla değiştirildi.');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.message || 'Şifre değiştirilemedi.');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Profil ve Hesap Ayarları</h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Kişisel bilgilerinizi güncelleyin ve hesap güvenliğinizi yönetin
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Profile Info Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <User size={18} color="#38bdf8" />
              <span>Profil Bilgileri</span>
            </div>
            <span className={`role-badge ${user?.role === 'admin' ? 'admin' : 'personnel'}`}>
              {user?.role === 'admin' ? 'Yönetici' : 'Personel'}
            </span>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <img
                src={profileData.avatar_url || 'https://ui-avatars.com/api/?name=User'}
                alt="Avatar"
                className="user-avatar"
                style={{ width: 64, height: 64 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Avatar Görsel URL:</div>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                  value={profileData.avatar_url}
                  onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Ad Soyad</label>
              <input
                type="text"
                className="form-input"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-posta (Değiştirilemez)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Departman / Birim</label>
              <input
                type="text"
                className="form-input"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefon Numarası</label>
              <input
                type="text"
                className="form-input"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loadingProfile} style={{ width: '100%' }}>
              <Save size={16} />
              <span>{loadingProfile ? 'Kaydediliyor...' : 'Bilgileri Güncelle'}</span>
            </button>
          </form>
        </div>

        {/* Password Change Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Lock size={18} color="#f59e0b" />
              <span>Şifre Değiştir</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Güvenlik</span>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Mevcut Şifre</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Yeni Şifre</label>
              <input
                type="password"
                className="form-input"
                placeholder="En az 6 karakter"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Yeni Şifre Tekrar</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-secondary" disabled={loadingPassword} style={{ width: '100%', marginTop: 12 }}>
              <Lock size={16} />
              <span>{loadingPassword ? 'Güncelleniyor...' : 'Şifreyi Değiştir'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
