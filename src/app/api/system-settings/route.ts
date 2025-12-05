import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin, getSystemSetting, updateSystemSettingAdmin } from '@/lib/supabase'

// GET - Mendapatkan semua system settings
export async function GET() {
  try {
    // Coba ambil dari Supabase, jika gagal fallback ke environment variables
    let settings = []
    
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key')

      if (!error && data) {
        // Filter sensitive data untuk non-admin
        settings = data.map(setting => ({
          ...setting,
          setting_value: setting.is_encrypted ? '***ENCRYPTED***' : setting.setting_value
        }))
      }
    } catch (supabaseError) {
      console.log('Supabase not available, using fallback')
    }

    // Fallback ke environment variables jika tidak ada data dari Supabase
    if (settings.length === 0) {
      const fallbackSettings = [
        {
          id: '1',
          setting_key: 'supabase_url',
          setting_value: process.env.SUPABASE_URL || '',
          description: 'Supabase Project URL',
          is_encrypted: false
        },
        {
          id: '2', 
          setting_key: 'supabase_anon_key',
          setting_value: process.env.SUPABASE_ANON_KEY || '',
          description: 'Supabase Anonymous Key',
          is_encrypted: false
        },
        {
          id: '3',
          setting_key: 'supabase_service_key',
          setting_value: process.env.SUPABASE_SERVICE_KEY ? '***ENCRYPTED***' : '',
          description: 'Supabase Service Role Key',
          is_encrypted: true
        },
        {
          id: '4',
          setting_key: 'app_name',
          setting_value: process.env.NEXT_PUBLIC_APP_NAME || 'Email Routing Manager',
          description: 'Application Name',
          is_encrypted: false
        },
        {
          id: '5',
          setting_key: 'app_version',
          setting_value: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
          description: 'Application Version',
          is_encrypted: false
        }
      ]
      settings = fallbackSettings
    }

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Error in GET /api/system-settings:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Update system settings
export async function POST(request: NextRequest) {
  try {
    const { settings } = await request.json()

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid settings data' },
        { status: 400 }
      )
    }

    // Coba simpan ke Supabase jika tersedia
    try {
      const updatePromises = Object.entries(settings).map(async ([key, value]) => {
        const isEncrypted = key.includes('key') || key.includes('token') || key.includes('secret')
        const description = getSettingDescription(key)
        
        return await updateSystemSettingAdmin(key, value as string, description, isEncrypted)
      })

      const results = await Promise.all(updatePromises)
      const allSuccess = results.every(result => result === true)

      if (allSuccess) {
        return NextResponse.json({
          success: true,
          message: 'Settings updated successfully to Supabase'
        })
      }
    } catch (supabaseError) {
      console.log('Failed to save to Supabase, using fallback')
    }

    // Fallback: Simpan ke environment variables (untuk development)
    // Dalam production, ini seharusnya tidak digunakan
    console.warn('Settings saved to console (development fallback only):', settings)
    
    return NextResponse.json({
      success: true,
      message: 'Settings received (Note: Database not configured, this is temporary)',
      warning: 'Please configure Supabase to persist settings permanently'
    })
  } catch (error) {
    console.error('Error in POST /api/system-settings:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function untuk mendapatkan deskripsi setting
function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    'supabase_url': 'Supabase Project URL',
    'supabase_anon_key': 'Supabase Anonymous Key',
    'supabase_service_key': 'Supabase Service Role Key',
    'app_name': 'Application Name',
    'app_version': 'Application Version',
    'default_language': 'Default Language',
    'max_email_per_domain': 'Maximum Email Per Domain',
    'session_timeout': 'Session Timeout (minutes)'
  }
  
  return descriptions[key] || `Setting for ${key}`
}