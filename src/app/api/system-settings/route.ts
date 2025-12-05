import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin, getSystemSetting, updateSystemSettingAdmin } from '@/lib/supabase'

// GET - Mendapatkan semua system settings
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key')

    if (error) {
      console.error('Error fetching system settings:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch system settings' },
        { status: 500 }
      )
    }

    // Filter sensitive data untuk non-admin
    const filteredData = data?.map(setting => ({
      ...setting,
      setting_value: setting.is_encrypted ? '***ENCRYPTED***' : setting.setting_value
    }))

    return NextResponse.json({
      success: true,
      settings: filteredData
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

    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      const isEncrypted = key.includes('key') || key.includes('token') || key.includes('secret')
      const description = getSettingDescription(key)
      
      return await updateSystemSettingAdmin(key, value as string, description, isEncrypted)
    })

    const results = await Promise.all(updatePromises)
    const allSuccess = results.every(result => result === true)

    if (!allSuccess) {
      return NextResponse.json(
        { success: false, error: 'Failed to update some settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
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