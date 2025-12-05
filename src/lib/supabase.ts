import { createClient } from '@supabase/supabase-js'

// Environment variables untuk Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key'

// Buat Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Buat Supabase admin client (dengan service key) untuk operasi yang membutuhkan hak akses penuh
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Tipe data untuk tabel
export interface User {
  id: string
  username: string
  password: string
  email?: string
  name?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EmailRouting {
  id: string
  zone_id: string
  zone_name: string
  alias_part: string
  full_email: string
  rule_id: string
  destination: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CloudflareConfig {
  id: string
  api_token: string
  account_id: string
  d1_database?: string
  worker_api?: string
  kv_storage?: string
  destination_emails: string
  created_at: string
  updated_at: string
}

export interface SystemSettings {
  id: string
  setting_key: string
  setting_value: string
  description?: string
  is_encrypted: boolean
  created_at: string
  updated_at: string
}

// Fungsi helper untuk mendapatkan konfigurasi sistem
export async function getSystemSetting(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single()

    if (error) {
      console.error('Error getting system setting:', error)
      return null
    }

    return data?.setting_value || null
  } catch (error) {
    console.error('Error getting system setting:', error)
    return null
  }
}

// Fungsi helper untuk mengupdate konfigurasi sistem
export async function updateSystemSetting(key: string, value: string, description?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: key,
        setting_value: value,
        description: description,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error updating system setting:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating system setting:', error)
    return false
  }
}

// Fungsi helper untuk mengupdate konfigurasi sistem dengan service key (untuk data sensitif)
export async function updateSystemSettingAdmin(key: string, value: string, description?: string, isEncrypted: boolean = false): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('system_settings')
      .upsert({
        setting_key: key,
        setting_value: value,
        description: description,
        is_encrypted: isEncrypted,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error updating system setting (admin):', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating system setting (admin):', error)
    return false
  }
}

// Fungsi untuk inisialisasi database jika belum ada data
export async function initializeDatabase(): Promise<boolean> {
  try {
    // Cek apakah sudah ada user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (userError) {
      console.error('Error checking users:', userError)
      return false
    }

    // Jika belum ada user, buat default user
    if (!users || users.length === 0) {
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash('cantik', 10)

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          username: 'windaa',
          password: hashedPassword,
          email: 'admin@example.com',
          name: 'Administrator',
          is_active: true
        })

      if (insertError) {
        console.error('Error creating default user:', insertError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  }
}