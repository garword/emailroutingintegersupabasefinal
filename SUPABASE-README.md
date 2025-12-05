# 🚀 Email Routing Manager - Supabase Integration

Aplikasi web modern untuk mengelola Email Routing Cloudflare dengan database Supabase dan sistem konfigurasi API yang lengkap.

## ✨ Fitur Baru Supabase Integration

### 🗄️ **Database Supabase**
- **Cloud Database**: Database yang scalable dan reliable
- **Real-time Updates**: Sinkronisasi data real-time
- **Auto Backup**: Backup data otomatis
- **Row Level Security**: Keamanan data tingkat baris

### 🔧 **Web-based Configuration**
- **No More .env Files**: Semua konfigurasi melalui web interface
- **API Key Management**: Kelola API keys langsung dari dashboard
- **Connection Testing**: Test koneksi database secara real-time
- **Encrypted Storage**: Data sensitif dienkripsi secara otomatis

### 🎯 **System Settings**
- **Dynamic Configuration**: Pengaturan aplikasi yang dapat diubah runtime
- **Multi-environment Support**: Mudah untuk development dan production
- **Secure Storage**: API keys dan credentials tersimpan aman

## 🛠️ Setup Instructions

### 1. Buat Project Supabase

1. Kunjungi [supabase.com](https://supabase.com)
2. Sign up atau login
3. Klik "New Project"
4. Pilih organization dan beri nama project
5. Tunggu hingga project selesai dibuat

### 2. Jalankan SQL Schema

1. Buka dashboard Supabase project Anda
2. Klik menu "SQL Editor"
3. Copy dan paste SQL schema dari file `supabase-schema.sql`
4. Klik "Run" untuk mengeksekusi schema

### 3. Dapatkan API Keys

1. Di dashboard Supabase, klik menu "Project Settings"
2. Klik "API"
3. Copy values berikut:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public**: Key untuk akses publik
   - **service_role**: Key untuk akses admin (RAHASIA)

### 4. Konfigurasi di Web Interface

1. Jalankan aplikasi: `npm run dev`
2. Login dengan credentials:
   - Username: `windaa`
   - Password: `cantik`
3. Klik tombol "Database" di header
4. Isi konfigurasi Supabase:
   - **Supabase Project URL**: URL project Anda
   - **Anonymous Key**: Key anonim dari dashboard
   - **Service Role Key**: Key service role (hanya untuk admin)
5. Klik "Test Koneksi" untuk verifikasi
6. Klik "Simpan Pengaturan" untuk menyimpan

## 📋 Panduan Konfigurasi

### Supabase Project URL
```
https://your-project-id.supabase.co
```
Dapatkan dari dashboard Supabase → Settings → API → Project URL

### Anonymous Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Dapatkan dari dashboard Supabase → Settings → API → anon public

### Service Role Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Dapatkan dari dashboard Supabase → Settings → API → service_role
⚠️ **JANGAN BAGIKAN key ini ke siapapun!**

## 🔗 API Endpoints Baru

### System Settings
- **GET** `/api/system-settings` - Ambil semua pengaturan sistem
- **POST** `/api/system-settings` - Update pengaturan sistem

### Connection Test
- **POST** `/api/test-supabase` - Test koneksi Supabase

### Updated Endpoints
- **GET** `/api/auth/login` - Login dengan Supabase
- **GET** `/api/email-routing` - Email routing dari Supabase

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Email Routing Table
```sql
CREATE TABLE email_routing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id VARCHAR(255) NOT NULL,
  zone_name VARCHAR(255) NOT NULL,
  alias_part VARCHAR(255) NOT NULL,
  full_email VARCHAR(255) NOT NULL,
  rule_id VARCHAR(255) UNIQUE NOT NULL,
  destination VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Cloudflare Config Table
```sql
CREATE TABLE cloudflare_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_token TEXT NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  d1_database TEXT,
  worker_api TEXT,
  kv_storage TEXT,
  destination_emails TEXT DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### System Settings Table
```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Security Features

### Encryption
- **Sensitive Data**: API keys dan tokens dienkripsi
- **Row Level Security**: Proteksi data tingkat baris
- **HTTPS Only**: Semua komunikasi terenkripsi

### Access Control
- **Role-based Access**: Admin dan user roles
- **Session Management**: JWT tokens dengan expiration
- **Rate Limiting**: Proteksi dari brute force attacks

## 🚀 Migration dari Local Database

Jika Anda sudah memiliki data di local SQLite:

1. Export data dari SQLite:
```bash
npm run db:export
```

2. Import ke Supabase melalui SQL Editor

3. Update konfigurasi di web interface

## 🛠️ Development

### Environment Variables
File `.env` hanya untuk development:
```env
# Default configuration (akan dioverride oleh settings di database)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

### Testing
```bash
# Test koneksi Supabase
curl -X POST http://localhost:3000/api/test-supabase \
  -H "Content-Type: application/json" \
  -d '{"supabaseUrl":"https://your-project.supabase.co","supabaseAnonKey":"your-key"}'
```

## 📝 Troubleshooting

### Connection Issues
1. Pastikan Supabase URL benar
2. Check API keys validity
3. Verify RLS policies
4. Test dengan "Test Koneksi" button

### Data Not Saving
1. Check service role key permissions
2. Verify table permissions
3. Check browser console untuk errors

### Performance Issues
1. Add indexes ke frequently queried columns
2. Use Supabase CDN untuk static assets
3. Enable caching di production

## 🎯 Benefits

### vs Local Database
- ✅ **Scalability**: Auto-scaling infrastructure
- ✅ **Reliability**: 99.9% uptime guarantee
- ✅ **Backups**: Automatic daily backups
- ✅ **Real-time**: Live data synchronization
- ✅ **Security**: Enterprise-grade security

### vs Hardcoded Configuration
- ✅ **Flexibility**: Change config without redeploy
- ✅ **Security**: No hardcoded secrets
- ✅ **Multi-env**: Easy environment switching
- ✅ **Audit Trail**: Track configuration changes
- ✅ **Team Collaboration**: Shared configuration

---

**Email Routing Manager with Supabase** - Solusi modern, scalable, dan aman untuk mengelola email routing dengan database cloud.

🔗 **GitHub Repository**: https://github.com/garword/jokowi

👤 **Developer**: garword

📅 **Last Updated**: 2025-01-18