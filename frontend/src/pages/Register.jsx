import React, { useState } from 'react';
import { Server, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register({ onNavigateLogin }) {
  const { register, googleLogin } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    department: 'Yazılım ve Yapay Zeka',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.password) {
      toast.warning('Ad Soyad, E-posta ve Şifre alanları zorunludur.');
      return;
    }

    if (formData.password.length < 6) {
      toast.warning('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('Hesabınız başarıyla oluşturuldu! Hoş geldiniz.');
    } catch (err) {
      toast.error(err.message || 'Kayıt işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="icon-box">
            <Server size={30} />
          </div>
          <h2 className="auth-title">Yeni Hesap Oluştur</h2>
          <p className="auth-subtitle">IT Demirbaş ve Zimmet Sistemine Kayıt Olun</p>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          className="google-auth-btn"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Google ile Hızlı Kayıt Ol</span>
        </button>

        <div className="divider">VEYA FORM İLE KAYDOL</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Adınız ve Soyadınız *</label>
            <input
              type="text"
              name="full_name"
              className="form-input"
              placeholder="Örn: Mehmet Ali Kaya"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kurumsal E-posta Adresi *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="ad.soyad@kurum.gov.tr"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Güvenli Şifre Oluşturun *</label>
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

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Departman / Birim</label>
              <input
                type="text"
                name="department"
                className="form-input"
                placeholder="Yapay Zeka Laboratuvarı"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefon Numarası</label>
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

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            <span>{loading ? 'Kayıt Yapılıyor...' : 'Hesabı Oluştur'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: 22, textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Zaten bir hesabınız var mı?{' '}
          <button
            onClick={onNavigateLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
}
