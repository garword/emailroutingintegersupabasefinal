import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin, getSystemSetting, updateSystemSettingAdmin } from '@/lib/supabase'

// GET - Mendapatkan semua system settings
export async function GET() {
  try {
    // Selalu coba ambil dari Supabase terlebih dahulu
    let settings = []
    
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key')

      if (!error && data && data.length > 0) {
        // Filter sensitive data untuk non-admin
        settings = data.map(setting => ({
          ...setting,
          setting_value: setting.is_encrypted ? '***ENCRYPTED***' : setting.setting_value
        }))
        console.log('Loaded settings from Supabase:', settings.length, 'items')
      } else if (error) {
        console.error('Error loading from Supabase:', error)
      }
    } catch (supabaseError) {
      console.error('Supabase connection error:', supabaseError)
    }

    // Jika tidak ada data dari Supabase, fallback ke environment variables
    if (settings.length === 0) {
      console.log('No data from Supabase, using environment fallback')
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
      settings,
      source: settings.length > 0 && settings[0].id !== '1' ? 'supabase' : 'environment'
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

    console.log('Attempting to save settings:', Object.keys(settings))

    // Coba simpan ke Supabase jika tersedia
    try {
      const updatePromises = Object.entries(settings).map(async ([key, value]) => {
        const isEncrypted = key.includes('key') || key.includes('token') || key.includes('secret')
        const description = getSettingDescription(key)
        
        console.log(`Saving setting: ${key}, encrypted: ${isEncrypted}`)
        
        // Create Supabase client baru dengan credentials yang baru
        const supabaseUrl = settings.supabase_url || process.env.SUPABASE_URL
        const supabaseServiceKey = settings.supabase_service_key || process.env.SUPABASE_SERVICE_KEY
        
        if (!supabaseUrl || !supabaseServiceKey) {
          throw new Error('Supabase URL or Service Key not provided')
        }
        
        const { createClient } = await import('@supabase/supabase-js')
        const tempSupabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
        
        const { error } = await tempSupabaseAdmin
          .from('system_settings')
          .upsert({
            setting_key: key,
            setting_value: value as string,
            description: description,
            is_encrypted: isEncrypted,
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error(`Failed to save ${key}:`, error)
          return false
        }
        
        console.log(`Successfully saved ${key}`)
        return true
      })

      const results = await Promise.all(updatePromises)
      const allSuccess = results.every(result => result === true)

      if (allSuccess) {
        console.log('All settings saved successfully to Supabase')
        return NextResponse.json({
          success: true,
          message: 'Settings updated successfully to Supabase'
        })
      } else {
        const failedCount = results.filter(r => r === false).length
        throw new Error(`Failed to save ${failedCount} settings`)
      }
    } catch (supabaseError) {
      console.error('Failed to save to Supabase:', supabaseError)
      return NextResponse.json({
        success: false,
        error: `Failed to save to Supabase: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`,
        details: supabaseError
      }, { status: 500 })
    }
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