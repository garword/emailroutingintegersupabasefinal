# 🚀 Email Routing Manager - Final Version

Aplikasi web modern untuk mengelola Email Routing Cloudflare dengan sistem autentikasi lengkap dan antarmuka yang user-friendly. Dibangun dengan Next.js 15, TypeScript, dan Tailwind CSS.

## ✨ Fitur Utama

### 🔐 **Sistem Autentikasi**
- **Login System**: Form login yang aman dengan username dan password
- **Protected Routes**: Middleware untuk melindungi halaman dashboard
- **Session Management**: Manajemen sesi dengan localStorage dan cookies
- **Auto Redirect**: Pengalihan otomatis berdasarkan status autentikasi
- **Credentials**: Username: `windaa`, Password: `cantik`

### 📧 **Email Management**
- **Buat Email Routing Baru**: Generate alamat email custom yang diteruskan ke email tujuan
- **Mode Otomatis**: Generator nama Indonesia acak (contoh: `budisantoso8x9@domain.com`)
- **Mode Manual**: Input alias email sesuai keinginan
- **Hapus Email**: Hapus routing rule dari Cloudflare dan database
- **Daftar Email**: Tampilkan semua email routing yang telah dibuat

### 🎨 **User Interface**
- **Modern Design**: Antarmuka yang bersih dan intuitif dengan shadcn/ui
- **Dark Mode**: Dukungan mode gelap untuk kenyamanan mata
- **Responsive**: Optimal di desktop dan mobile
- **Loading States**: Indikator loading saat proses API
- **Toast Notifications**: Notifikasi sukses/error yang elegan
- **Multi-language**: Dukungan Bahasa Indonesia dan Inggris

### 🔐 **Keamanan**
- **API Token Management**: Token API Cloudflare yang aman
- **Environment Variables**: Tidak ada hardcoded credentials
- **Input Validation**: Validasi input otomatis
- **Error Handling**: Penanganan error yang komprehensif

### 📊 **Dashboard**
- **Statistics**: Total email, domain aktif, email aktif
- **Quick Actions**: Tombol refresh dan generate nama cepat
- **Real-time Updates**: Update otomatis setelah create/delete
- **Logout Function**: Tombol logout untuk keluar dari sistem

## 🛠️ Teknologi

### **Core Framework**
- **Frontend**: Next.js 15 dengan App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **API**: Cloudflare API v4 integration
- **Deployment**: Vercel (serverless)

### **UI Components**
- **Component Library**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Notifications**: Sonner toast notifications
- **State Management**: React Hooks + Zustand

### **Development Tools**
- **Package Manager**: npm
- **Linting**: ESLint dengan Next.js config
- **Database**: Supabase PostgreSQL
- **Authentication**: Custom auth system dengan middleware
- **Hosting**: Vercel (free tier compatible)

## 📋 Prerequisites

Sebelum menggunakan aplikasi ini, pastikan:

1. **Akun Cloudflare** dengan Email Routing enabled
2. **Domain** yang sudah dikonfigurasi MX record ke Cloudflare
3. **API Token** Cloudflare dengan permissions:
   - `Zone:Read`
   - `Email Routing Rules:Edit`
4. **Destination Email** yang sudah diverifikasi di Cloudflare dashboard

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/garword/EMAIL-ROUTING-FINAL.git
cd EMAIL-ROUTING-FINAL
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Buat file `.env.local` dari template:
```bash
cp .env.example .env.local
```

Kemudian isi dengan kredensial Supabase Anda:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-key"
```

### 4. Database Setup (Supabase)
1. Buat project di [Supabase](https://supabase.com)
2. Buka SQL Editor di Supabase dashboard
3. Copy dan jalankan isi file `supabase-schema.sql`
4. Verifikasi tabel sudah dibuat di Table Editor

### 5. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3001`

## ☁️ **Vercel Deployment**

Aplikasi ini sudah dikonfigurasi untuk deploy di Vercel free tier:

1. **Push ke GitHub**: Pastikan kode sudah di GitHub repository
2. **Import ke Vercel**: Import project dari Vercel dashboard
3. **Set Environment Variables**: Tambahkan variabel berikut di Vercel:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
4. **Deploy**: Klik deploy dan tunggu build selesai

📖 **Panduan lengkap**: Lihat [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md) untuk instruksi detail.

## 🔑 **Login Credentials**

Untuk mengakses aplikasi, gunakan credentials berikut:

- **Username**: `windaa`
- **Password**: `cantik`

## 📁 Struktur Project

```
src/
├── app/
│   ├── api/
│   │   ├── cloudflare/
│   │   │   ├── config/
│   │   │   │   └── route.ts          # API untuk konfigurasi Cloudflare
│   │   │   └── zones/
│   │   │       └── route.ts          # API untuk fetch zones
│   │   └── email-routing/
│   │       ├── route.ts              # GET/POST email routing
│   │       └── [id]/
│   │           └── route.ts          # DELETE email routing
│   ├── dashboard/
│   │   ├── config/
│   │   │   └── page.tsx            # Halaman konfigurasi
│   │   └── page.tsx               # Dashboard utama (protected)
│   ├── login/
│   │   └── page.tsx               # Halaman login
│   ├── layout.tsx                  # Root layout dengan AuthProvider
│   ├── page.tsx                   # Halaman utama dengan redirect
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── language-selector.tsx      # Komponen pemilih bahasa
├── contexts/
│   └── auth-context.tsx          # Authentication context
├── lib/
│   ├── db.ts                     # Prisma database client
│   ├── utils.ts                  # Utility functions
│   ├── translations.ts           # Multi-language support
│   └── cloudflare-api.ts        # Cloudflare API integration
├── hooks/
│   ├── use-toast.ts             # Toast hook
│   └── use-mobile.ts            # Mobile detection hook
└── prisma/
    └── schema.prisma            # Database schema
```

## 🔗 API Endpoints

### Authentication
- **GET** `/` - Redirect ke login atau dashboard
- **GET** `/login` - Halaman login
- **GET** `/dashboard` - Dashboard (protected)

### Cloudflare Zones
- **GET** `/api/cloudflare/zones`
  - Fetch semua active zones dari akun Cloudflare
  - Response: `{ success: boolean, zones: Zone[] }`

### Cloudflare Config
- **GET** `/api/cloudflare/config`
  - Fetch konfigurasi API Cloudflare
  - Response: `{ success: boolean, config: CloudflareConfig }`

### Email Routing
- **GET** `/api/email-routing`
  - Fetch semua email routing dari database
  - Response: `{ success: boolean, emails: EmailRouting[] }`

- **POST** `/api/email-routing`
  - Buat email routing baru
  - Body: `{ zoneId, aliasPart, destinationEmail }`
  - Response: `{ success: boolean, email: EmailRouting }`

- **DELETE** `/api/email-routing/[id]`
  - Hapus email routing
  - Body: `{ ruleId }`
  - Response: `{ success: boolean, message: string }`

## 📊 Database Schema

```sql
-- Cloudflare Configuration Table
CREATE TABLE cloudflare_config (
  id          TEXT PRIMARY KEY,
  apiToken    TEXT NOT NULL,
  accountId   TEXT NOT NULL,
  d1DatabaseId TEXT,
  workerApiToken TEXT,
  kvStorageId TEXT,
  destinationEmails TEXT,
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Email Routing Table
CREATE TABLE email_routing (
  id          TEXT PRIMARY KEY,
  zoneId      TEXT NOT NULL,
  zoneName    TEXT NOT NULL,
  aliasPart   TEXT NOT NULL,
  fullEmail   TEXT NOT NULL,
  ruleId      TEXT UNIQUE NOT NULL,    -- UUID dari Cloudflare API
  destination TEXT NOT NULL,
  isActive    BOOLEAN DEFAULT true,
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 UI Components

### Authentication Flow
1. **Login Page**: Form login dengan username/password
2. **Session Management**: localStorage + cookies untuk persistence
3. **Protected Routes**: Middleware untuk proteksi dashboard
4. **Auto Redirect**: Pengalihan berdasarkan auth status

### Main Dashboard
1. **Header**: Logo, title, language selector, config, logout, dark mode
2. **Create Form**: 
   - Domain selector dropdown
   - Auto/Manual mode toggle
   - Destination email input
   - Create button dengan loading state
3. **Email List**: 
   - Card-based layout
   - Copy to clipboard functionality
   - Delete button dengan konfirmasi
   - Status badges
4. **Sidebar**: 
   - Statistics cards
   - Quick actions
   - Security info

### Indonesian Name Generator
```javascript
const indonesianFirstNames = [
  "budi", "siti", "agus", "dewi", "eko", "rina", 
  // ... 30+ nama Indonesia
];

const indonesianLastNames = [
  "santoso", "pratama", "wijaya", "kusuma", 
  // ... 24+ marga Indonesia
];
```

## 🔧 Configuration

### Cloudflare API Token
Token yang digunakan dalam aplikasi:
- **Permissions**: Zone:Read, Email Routing Rules:Edit
- **Account ID**: Dapat diambil dari dashboard Cloudflare
- **Token**: Generate di Cloudflare API Tokens page

### Database Configuration
- **Type**: SQLite
- **Location**: `./db/custom.db`
- **ORM**: Prisma
- **Migrations**: Otomatis dengan `npm run db:push`

### Authentication Configuration
- **Username**: `windaa`
- **Password**: `cantik`
- **Session Storage**: localStorage + cookies
- **Middleware Protection**: All `/dashboard/*` routes

## 🚀 Production Deployment

### Build Command
```bash
npm run build
```

### Environment Variables untuk Production
```env
DATABASE_URL="file:./db/custom.db"
NODE_ENV="production"
```

### Security Notes
- API Token disimpan sebagai environment variable
- Tidak ada hardcoded credentials
- HTTPS untuk production
- Input validation di backend dan frontend
- Authentication middleware untuk proteksi routes

## 🧪 Testing

### Login Testing
1. Kunjungi `http://localhost:3000`
2. Akan di-redirect ke `/login`
3. Masukkan username: `windaa`, password: `cantik`
4. Seharusnya di-redirect ke `/dashboard`

### Email Routing Testing
1. Setup Cloudflare API token di dashboard config
2. Pilih domain dari dropdown
3. Pilih mode (Auto/Manual)
4. Masukkan email tujuan
5. Klik "Buat Email Routing"

### Logout Testing
1. Klik tombol logout di header
2. Seharusnya di-redirect ke `/login`
3. Session harus terhapus

## 🐛 Troubleshooting

### Common Issues

1. **Login Error 500**: Pastikan AuthProvider tersedia di layout
2. **API Error 401**: Check API token permissions
3. **Zone Not Found**: Pastikan zone status "active"
4. **Email Creation Failed**: Verifikasi MX record dan destination email
5. **Database Connection**: Check DATABASE_URL environment variable
6. **Middleware Error**: Pastikan cookie tersedia saat protected route diakses

### Debug Mode
Enable Prisma query logging:
```typescript
new PrismaClient({
  log: ['query'],
})
```

### Authentication Debug
Check browser console untuk:
- localStorage item "isAuthenticated"
- Cookie "isAuthenticated"
- AuthProvider availability

## 📞 Support

Jika mengalami masalah:
1. Check dev logs: `tail -f dev.log`
2. Verify Cloudflare configuration
3. Check database connection
4. Validate API token permissions
5. Test authentication flow

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

Project ini menggunakan MIT License.

---

**Email Routing Manager - Final Version** - Solusi modern dan aman untuk mengelola email Cloudflare dengan sistem autentikasi lengkap.

🔗 **GitHub Repository**: https://github.com/garword/EMAIL-ROUTING-FINAL

👤 **Developer**: garword

📅 **Last Updated**: 2025-01-18