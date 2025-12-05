# 🚀 Quick Setup Guide - Supabase Integration

## 📋 Langkah 1: Buat Project Supabase

1. Kunjungi [supabase.com](https://supabase.com)
2. Sign up atau login
3. Klik "New Project"
4. Beri nama project dan pilih database password
5. Tunggu hingga project selesai dibuat

## 📋 Langkah 2: Jalankan SQL Schema

1. Di dashboard Supabase, klik menu "SQL Editor"
2. Copy semua isi dari file `supabase-schema.sql`
3. Paste di SQL Editor
4. Klik "Run" untuk mengeksekusi

## 📋 Langkah 3: Dapatkan API Keys

1. Klik menu "Project Settings" (gear icon)
2. Klik "API"
3. Copy values berikut:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public**: Key untuk akses publik
   - **service_role**: Key untuk akses admin (RAHASIA)

## 📋 Langkah 4: Konfigurasi di Aplikasi

1. Buka aplikasi: http://localhost:3000
2. Login dengan:
   - Username: `windaa`
   - Password: `cantik`
3. Klik tombol "Database" di header
4. Isi form konfigurasi:
   - **Supabase Project URL**: URL dari langkah 3
   - **Anonymous Key**: Key anonim dari langkah 3
   - **Service Role Key**: Key service role dari langkah 3
5. Klik "Test Koneksi" untuk verifikasi
6. Jika berhasil, klik "Simpan Pengaturan"

## 🔧 Troubleshooting

### Error: "Table system_settings does not exist"
**Solusi**: Pastikan Anda sudah menjalankan SQL schema di langkah 2

### Error: "Connection failed"
**Solusi**: 
- Periksa URL dan API keys
- Pastikan project sudah aktif
- Coba test dengan service key

### Error: "Failed to save settings"
**Solusi**:
- Pastikan service role key benar
- Check RLS policies di Supabase
- Refresh halaman dan coba lagi

## 🎯 Setelah Setup Berhasil

- Semua data email routing tersimpan di Supabase
- API keys tersimpan aman dan terenkripsi
- Tidak perlu edit file `.env` lagi
- Dapat diakses dari multiple device

## 📞 Bantuan

Jika mengalami masalah:
1. Check browser console (F12) untuk error details
2. Pastikan semua langkah di atas diikuti dengan benar
3. Refresh halaman dan coba lagi
4. Restart development server: `npm run dev`

---
**Status**: ✅ Ready to use