# 🔧 Troubleshooting Guide - Supabase Configuration

## 🚨 Masalah: Pengaturan Hilang Setelah Refresh

### Gejala:
- ✅ Test connection berhasil
- ✅ Save settings menunjukkan "berhasil"
- ❌ Setelah refresh halaman, pengaturan kembali kosong

### Penyebab Utama:
1. **RLS (Row Level Security) belum dikonfigurasi**
2. **Service Role Key tidak memiliki hak akses**
3. **Tabel tidak terbuat dengan benar**

### 🛠️ Solusi Langkah demi Langkah:

#### Langkah 1: Verifikasi SQL Schema
Buka Supabase Dashboard → SQL Editor dan jalankan ulang:
```sql
-- Enable RLS untuk system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Hapus policy yang ada (jika ada)
DROP POLICY IF EXISTS "System settings can be managed by all users" ON system_settings;
DROP POLICY IF EXISTS "System settings can be viewed by all users" ON system_settings;

-- Buat policy baru yang lebih permissive
CREATE POLICY "System settings can be managed by all users" ON system_settings
FOR ALL USING (true)
WITH CHECK (true);

-- Verifikasi tabel ada
SELECT * FROM system_settings LIMIT 1;
```

#### Langkah 2: Test Manual Insert
Di SQL Editor, coba insert manual:
```sql
INSERT INTO system_settings (setting_key, setting_value, description, is_encrypted) 
VALUES ('test_key', 'test_value', 'Test setting', false);
```

Jika berhasil, coba select:
```sql
SELECT * FROM system_settings WHERE setting_key = 'test_key';
```

#### Langkah 3: Check API Key Permissions
Pastikan Service Role Key memiliki permissions:
- Buka Supabase Dashboard → Settings → API
- Copy **service_role** key (bukan anon key)
- Pastikan key tidak expired

#### Langkah 4: Verifikasi di Browser
1. Buka browser dev tools (F12)
2. Coba save pengaturan
3. Lihat Console tab untuk error messages
4. Lihat Network tab untuk API response

### 🔍 Debug Information:

#### Di Console Browser:
Cari error messages seperti:
- `Failed to save supabase_url: ...`
- `RLS policy violation`
- `Permission denied`

#### Di Network Tab:
Check response dari:
- `POST /api/system-settings` - harus status 200
- `GET /api/system-settings` - harus mengembalikan data

#### Di Supabase Dashboard:
- Settings → Database → system_settings
- Verify data tersimpan di tabel

### 🚀 Quick Fix Script:

Jika semua langkah di atas gagal, jalankan script ini di SQL Editor:

```sql
-- Reset complete system_settings table
TRUNCATE TABLE system_settings;

-- Insert default settings dengan UUID yang benar
INSERT INTO system_settings (id, setting_key, setting_value, description, is_encrypted, created_at, updated_at) VALUES
(uuid_generate_v4(), 'supabase_url', '', 'Supabase Project URL', false, NOW(), NOW()),
(uuid_generate_v4(), 'supabase_anon_key', '', 'Supabase Anonymous Key', false, NOW(), NOW()),
(uuid_generate_v4(), 'supabase_service_key', '', 'Supabase Service Role Key', true, NOW(), NOW()),
(uuid_generate_v4(), 'app_name', 'Email Routing Manager', 'Application Name', false, NOW(), NOW()),
(uuid_generate_v4(), 'app_version', '2.0.0', 'Application Version', false, NOW(), NOW());

-- Grant semua permissions
ALTER TABLE system_settings OWNER TO postgres;
GRANT ALL ON system_settings TO postgres;
GRANT ALL ON system_settings TO authenticated;
GRANT ALL ON system_settings TO anon;

-- Force RLS allow all
CREATE POLICY "Allow all operations" ON system_settings
FOR ALL USING (true)
WITH CHECK (true);
```

### 📞 Jika Masih Bermasalah:

1. **Check Supabase Logs**: Dashboard → Settings → Logs
2. **Restart Browser**: Clear cache dan cookies
3. **Use Incognito Mode**: Untuk menghindari cache issues
4. **Contact Support**: Jika error tetap terjadi

### ✅ Verifikasi Berhasil:

Setelah perbaikan, verifikasi dengan:
1. Save pengaturan baru
2. Refresh halaman (F5)
3. Pengaturan harus tetap ada
4. Debug Information harus menunjukkan "Supabase Database"

---

**Status**: 📋 Ready for troubleshooting