# Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü
## Aday Mühendis Değerlendirme Projesi: IT Demirbaş ve Zimmet Yönetim Sistemi

Bu proje; kurum içindeki bilgisayar, sunucu, monitör gibi donanımların sisteme kaydedildiği, durumlarının takip edildiği, her bir cihaza benzersiz **QR Kod** üretildiği ve personellere zimmetlendiği **Full-Stack Web** ve **React Native Mobil** uygulamasıdır.

---

## 🌟 Proje Özeti ve Temel Özellikler

| Alan | Karşılanan İsterler |
| :--- | :--- |
| **Kimlik Doğrulama (Auth)** | • **Google ile Giriş Yap** entegrasyonu ve demo simülasyonu<br>• Kullanıcı adı / e-posta ve şifre oluşturarak kayıt olma (Register)<br>• JWT tabanlı güvenli oturum yönetimi<br>• Profil bilgileri düzenleme ve şifre güncelleme<br>• Hızlı test için tek tıkla Yönetici (Admin) ve Personel giriş butonları |
| **Yetkilendirme (Rol Yönetimi)** | • **Admin** ve **Standart Personel** rol bazlı yetkilendirme altyapısı<br>• Yöneticiler için Kullanıcı Yönetim Ekranı (Yeni kullanıcı ekleme, silme, düzenleme, şifre sıfırlama) |
| **Dashboard (Gösterge Paneli)** | • Toplam donanım, arızalı cihazlar, depoda bekleyenler ve zimmetteki cihazlar (KPI Sayaçları)<br>• Kategori ve departman bazlı dinamik dağılım çubukları/grafikleri<br>• Son sistem ve zimmet aktiviteleri (Audit Log akışı) |
| **Envanter Yönetimi** | • Cihaz ekleme, silme, güncelleme (Marka, Model, Seri No, Alım Tarihi, Garanti, Maliyet)<br>• **Otomatik benzersiz taranabilir QR Kod üretimi**<br>• QR Kod önizleme, PNG olarak indirme ve fiziksel etiket yazdırma |
| **Zimmet Yönetimi** | • Personele teslim etme (Zimmetleme) ve zimmetten düşme (İade kabul)<br>• One-to-Many / Many-to-Many ilişkisel veritabanı kurgusu<br>• Detaylı geçmiş zimmet logları ve tarihçe takibi |
| **Arama & Filtreleme & UI/UX** | • Duruma (Depoda, Zimmetli, Arızalı, Bakımda, Hurda), kategoriye ve departmana göre filtreleme<br>• Canlı dinamik arama çubuğu ve çoklu sayfalama (Pagination: 10, 25, 50)<br>• Anlık bildirim mesajları (Toast / Snackbar: Başarılı, Hatalı, Uyarı)<br>• Ultra modern executive dark/light glassmorphic responsive tasarım |
| **Mobil Uygulama (React Native)** | • Kullanıcı adı/şifre ile mobil güvenli giriş<br>• **Kamera / QR Kod okuma ve cihaz tanıma** (Garanti, alım tarihi, kimde olduğu anında ekranda)<br>• **Hızlı Saha İşlemleri**: "Personele Teslim Et", "Cihazı Geri Kabul Et", "Arıza Durumu Bildir"<br>• **Kişisel Zimmet Ekranı**: Personelin kendi üzerine zimmetli donanımlarını listelemesi ve arıza bildirmesi |
| **DevOps & Dağıtım** | • **Docker ve docker-compose** ile tek tuşla ayağa kalkacak hazır mimari<br>• Nginx ters vekil ve API proxy yapılandırması |

---

## 🏗️ Mimari Yapı

```
koordinatörlük/
├── backend/                  # Node.js + Express + SQLite + JWT + QRCode REST API
│   ├── src/
│   │   ├── config/           # Veritabanı bağlantısı ve tablo şeması
│   │   ├── controllers/      # Auth, Asset, Assignment, User, Stats denetleyicileri
│   │   ├── middleware/       # JWT doğrulama ve Admin rol denetleyicisi
│   │   ├── database/         # seed.js (Gerçekçi örnek IT demirbaşları ve kullanıcılar)
│   │   ├── routes/           # REST API uç noktaları
│   │   └── server.js         # Express uygulama sunucusu
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # React 18 + Vite + Modern Glassmorphic CSS (Web)
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, Pagination, QRModal, QRScannerModal, Modallar
│   │   ├── context/          # AuthContext, ToastContext
│   │   ├── pages/            # Login, Register, Dashboard, Assets, Assignments, Users, MyAssets, Profile
│   │   ├── services/         # API istemcisi
│   │   └── index.css         # Modern tasarım sistemi ve responsive tema değişkenleri
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── mobile/                   # React Native (Expo) Mobil Saha Uygulaması
│   ├── src/
│   │   ├── screens/          # LoginScreen, DashboardScreen, QRScanScreen, MyAssetsScreen
│   │   ├── services/         # Mobile API istemcisi
│   │   ├── context/          # AuthContext
│   │   └── styles/           # Mobile renk ve tema tokenları
│   ├── App.js
│   └── package.json
│
├── docker-compose.yml        # Tek tuşla tam full-stack başlatma
└── README.md
```

---

## 🔑 Hazır Test Hesapları

Sistemi anında test edebilmeniz için tohumlama (seed) veritabanına aşağıdaki hesaplar tanımlanmıştır (Giriş sayfasında tek tıkla butonla da açılabilir):

| Rol | E-posta | Şifre | Departman |
| :--- | :--- | :--- | :--- |
| **Sistem Yöneticisi (Admin)** | `admin@kurum.gov.tr` | `Admin123!` | Bilgi İşlem ve Yapay Zeka Dairesi |
| **Personel** | `ahmet.yilmaz@kurum.gov.tr` | `User123!` | Yazılım ve Yapay Zeka Geliştirme |
| **Personel** | `ayse.kaya@kurum.gov.tr` | `User123!` | Dijital Dönüşüm ve Koordinasyon |
| **Personel** | `mehmet.demir@kurum.gov.tr` | `User123!` | Sistem ve Siber Güvenlik |
| **Google Girişi** | *(Giriş ekranındaki "Google ile Giriş Yap" butonu)* | — | Dijital Dönüşüm |

---

## 🚀 Çalıştırma Yöntemleri

### Yöntem 1: Docker ve Docker Compose ile Tek Tuşla Çalıştırma (Önerilen)

Sistemi herhangi bir ek kuruluma ihtiyaç duymadan tek bir komutla ayağa kaldırabilirsiniz:

```bash
docker compose up --build
```

- **Web Arayüzü**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Sağlık Kontrolü**: `http://localhost:5000/api/health`

---

### Yöntem 2: Yerel Geliştirme Ortamında Çalıştırma

Gereksinimler: Node.js (v18+) ve npm.

#### 1. Backend API'yi Başlatma:
```bash
cd backend
npm install
npm run seed       # Örnek demirbaşlar ve personeller ile veritabanını doldurur
npm run dev        # Port 5000 üzerinde API sunucusunu başlatır
```

#### 2. Web Frontend'i Başlatma:
```bash
cd frontend
npm install
npm run dev        # Port 3000 üzerinde Vite geliştirme sunucusunu başlatır
```
Tarayıcınızda `http://localhost:3000` adresine gidin.

#### 3. React Native Mobil Uygulamayı Başlatma:
```bash
cd mobile
npm install
npm start          # Expo geliştirme menüsünü açar (Web, Android emulator veya Expo Go ile test edilebilir)
```

---

## 📡 REST API Uç Noktaları

### Kimlik Doğrulama & Profil (`/api/auth`)
- `POST /api/auth/login`: Kullanıcı adı/e-posta ve şifre ile giriş -> JWT üretir
- `POST /api/auth/register`: Yeni personel kaydı oluşturur
- `POST /api/auth/google`: Google hesabı ile giriş ve hesap bağlama
- `GET /api/auth/me`: Oturum açan kullanıcının profil ve zimmet özeti
- `PUT /api/auth/profile`: Profil bilgilerini güncelleme
- `PUT /api/auth/change-password`: Güvenli şifre değiştirme

### Demirbaş Yönetimi (`/api/assets`)
- `GET /api/assets`: Demirbaş listeleme (arama, kategori, durum, sayfalama)
- `GET /api/assets/:id`: Demirbaş detayları, teknik özellikleri, QR verisi ve zimmet geçmişi
- `POST /api/assets`: [Admin] Yeni demirbaş ekleme ve otomatik benzersiz QR üretimi
- `PUT /api/assets/:id`: [Admin] Demirbaş bilgilerini güncelleme
- `DELETE /api/assets/:id`: [Admin] Demirbaş silme
- `POST /api/assets/:id/report-fault`: Cihaza arıza durumu bildirme

### Zimmet Yönetimi (`/api/assignments`)
- `POST /api/assignments`: [Admin] Cihazı personele zimmetleme (teslim etme)
- `POST /api/assignments/return`: [Admin] Cihazı geri teslim alma (depoya/bakıma)
- `GET /api/assignments/my-assets`: Personelin kendi üzerine zimmetli cihazları
- `GET /api/assignments/history`: [Admin] Zimmet logları ve tarihçe akışı

### Kullanıcı Yönetimi (`/api/users`)
- `GET /api/users`: [Admin] Kullanıcıları listeleme ve arama
- `POST /api/users`: [Admin] Yeni personel/yönetici hesabı açma
- `PUT /api/users/:id`: [Admin] Bilgileri ve yetkileri düzenleme
- `PUT /api/users/:id/reset-password`: [Admin] Kullanıcı şifresi sıfırlama
- `DELETE /api/users/:id`: [Admin] Kullanıcı silme

### İstatistikler & Gösterge Paneli (`/api/stats`)
- `GET /api/stats/dashboard`: KPI sayaçları, kategori/durum dağılımları ve loglar

---

## 📱 Mobil Uygulama (React Native) Ekranları

1. **Giriş Ekranı (Login)**: Güvenli JWT doğrulaması, kolay test butonları ve dinamik IP yapılandırma desteği.
2. **Saha QR Okuyucu (QRScanScreen)**: Kameradan veya simüle barkod okuyucudan cihaz kodunu tarar. Anında donanım sahibini, garanti süresini ve alım tarihini getirir.
3. **Hızlı Saha İşlemleri**: Saha personeli taranan cihaz için tek tıkla:
   - *"Personele Teslim Et"*
   - *"Cihazı Geri Kabul Et"*
   - *"Arıza Durumu Bildir"*
   işlemlerini sahada gerçekleştirir.
4. **Kişisel Zimmetlerim (MyAssetsScreen)**: Personel kendi üzerine zimmetli donanımları görür ve sorun olduğunda arıza bildirimi bırakabilir.
5. **Gösterge Paneli (DashboardScreen)**: Mobil cihaz üzerinden toplam donanım, arıza sayıları ve son hareketler.

---

## 🎨 Tasarım ve UI/UX Standartları

- **Kurumsal ve Zengin Estetik**: Yapay Zeka & Dijital Dönüşüm kimliğine uygun, derin lacivert/slate arkaplanlar, cam efekti (glassmorphism), yumuşak ışımalı butonlar ve Plus Jakarta Sans tipografisi.
- **Aydınlık / Karanlık Tema Desteği**: Tek tuşla Dark Mode ve Light Mode geçişi.
- **Tam Duyarlı (Responsive)**: Masaüstü, tablet ve mobil cihaz ekranlarına kusursuz uyum sağlayan esnek grid ve sidebar yapısı.
- **Anlık Geri Bildirim**: Her CRUD işleminde ekranın sağ alt köşesinde beliren animasyonlu Toast (Snackbar) mesajları.

---
*Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü Aday Mühendis Değerlendirme Projesi standartlarına ve isterlerine tam uyumlu olarak hazırlanmıştır.*
