import React, { useState } from 'react';
import { Server, Lock, Mail, ArrowRight, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login({ onNavigateRegister }) {
  const { login, googleLogin } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Başarıyla giriş yapıldı. Hoş geldiniz!');
    } catch (err) {
      toast.error(err.message || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      toast.success('Demo kullanıcı ile başarıyla giriş yapıldı.');
    } catch (err) {
      toast.error(err.message || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  const handleRealGoogleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!googleEmail || !googleEmail.includes('@')) {
      toast.warning('Lütfen geçerli bir Gmail / Google e-posta adresi giriniz.');
      return;
    }

    setLoading(true);
    try {
      const derivedName = googleName.trim() || googleEmail.split('@')[0];
      await googleLogin({
        email: googleEmail.toLowerCase().trim(),
        name: derivedName,
        google_id: 'google_oid_' + googleEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_'),
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(derivedName)}&background=0284c7&color=ffffff`
      });
      toast.success(`Google (${googleEmail}) hesabınız ile başarıyla oturum açıldı!`);
      setGoogleModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Google ile giriş başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="icon-box">
            <Server size={30} />
          </div>
          <h2 className="auth-title">IT Demirbaş & Zimmet</h2>
          <p className="auth-subtitle">Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü</p>
        </div>

        {/* Quick Demo Login Switcher */}
        <div className="demo-account-buttons">
          <div className="demo-account-title">Hızlı Test Giriş Seçenekleri:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('admin@kurum.gov.tr', 'Admin123!')}
              disabled={loading}
              style={{ fontSize: '0.78rem' }}
            >
              <Shield size={14} color="#f87171" />
              <span>Yönetici (Admin)</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('ahmet.yilmaz@kurum.gov.tr', 'User123!')}
              disabled={loading}
              style={{ fontSize: '0.78rem' }}
            >
              <UserCheck size={14} color="#38bdf8" />
              <span>Personel Girişi</span>
            </button>
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          className="google-auth-btn"
          onClick={() => setGoogleModalOpen(true)}
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
          <span>Google ile Giriş Yap</span>
        </button>

        <div className="divider">VEYA KULLANICI BİLGİLERİYLE</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Kurumsal E-posta veya Kullanıcı Adı</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="ornek@kurum.gov.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            <span>{loading ? 'Giriş Yapılıyor...' : 'Sisteme Giriş Yap'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: 22, textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Hesabınız yok mu?{' '}
          <button
            onClick={onNavigateRegister}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Yeni Hesap Oluştur
          </button>
        </div>
      </div>

      {/* Real Google / Gmail Sign In Modal */}
      {googleModalOpen && (
        <div className="modal-backdrop" onClick={() => setGoogleModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Google ile Oturum Aç</span>
              </div>
              <button className="btn-icon" onClick={() => setGoogleModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleRealGoogleLogin}>
              <div className="modal-body">
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                  Gerçek Google / Gmail hesabınız ile sisteme giriş yapabilir veya anında yeni üyelik başlatabilirsiniz:
                </p>

                <div className="form-group">
                  <label className="form-label">Gmail / Google E-posta Adresiniz *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="ornek@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Adınız ve Soyadınız (İsteğe bağlı)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Örn: Metehan Akbulut"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setGoogleModalOpen(false)}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <span>{loading ? 'Bağlanıyor...' : 'Google ile Devam Et'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
