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
      console.log('Starting Supabase save process...')

      // Validate required fields first
      const supabaseUrl = settings.supabase_url || process.env.SUPABASE_URL
      const supabaseServiceKey = settings.supabase_service_key || process.env.SUPABASE_SERVICE_KEY

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing required Supabase credentials')
        throw new Error('Supabase URL or Service Key not provided')
      }

      console.log('Using Supabase URL:', supabaseUrl)
      console.log('Service Key available:', !!supabaseServiceKey)

      // Create Supabase client baru dengan credentials yang baru
      const { createClient } = await import('@supabase/supabase-js')
      const tempSupabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

      // Test connection first
      console.log('Testing Supabase connection...')
      const { data: testData, error: testError } = await tempSupabaseAdmin
        .from('system_settings')
        .select('count')
        .limit(1)

      if (testError) {
        console.error('Supabase connection test failed:', testError)
        throw new Error(`Supabase connection failed: ${testError.message}`)
      }

      console.log('Connection test passed, proceeding with save...')

      const updatePromises = Object.entries(settings).map(async ([key, value]) => {
        const isEncrypted = key.includes('key') || key.includes('token') || key.includes('secret')
        const description = getSettingDescription(key)

        console.log(`Processing setting: ${key}, encrypted: ${isEncrypted}, value length: ${value?.length || 0}`)

        try {
          const { error } = await tempSupabaseAdmin
            .from('system_settings')
            .upsert({
              setting_key: key,
              setting_value: value as string,
              description: description,
              is_encrypted: isEncrypted,
              updated_at: new Date().toISOString()
            }, { onConflict: 'setting_key' })

          if (error) {
            console.error(`Failed to save ${key}:`, error)
            return false
          }

          console.log(`Successfully saved ${key}`)
          return true
        } catch (itemError) {
          console.error(`Exception saving ${key}:`, itemError)
          return false
        }
      })

      const results = await Promise.all(updatePromises)
      const successCount = results.filter(r => r === true).length
      const failCount = results.filter(r => r === false).length

      console.log(`Save results: ${successCount} success, ${failCount} failed`)

      if (failCount > 0) {
        const failedKeys = Object.entries(settings)
          .filter(([key, value], index) => !results[index])
          .map(([key]) => key)

        throw new Error(`Failed to save ${failCount} settings: ${failedKeys.join(', ')}`)
      }

      console.log('All settings saved successfully to Supabase')

      // Auto-update .env.local
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const envPath = path.join(process.cwd(), '.env.local');

        // Read existing file or empty string
        let envContent = '';
        try {
          envContent = await fs.readFile(envPath, 'utf-8');
        } catch (error) {
          console.log('.env.local not found, creating new one');
        }

        const updates: Record<string, string> = {};
        if (settings.supabase_url) updates['SUPABASE_URL'] = settings.supabase_url;
        if (settings.supabase_anon_key) updates['SUPABASE_ANON_KEY'] = settings.supabase_anon_key;
        if (settings.supabase_service_key) updates['SUPABASE_SERVICE_KEY'] = settings.supabase_service_key;

        if (Object.keys(updates).length > 0) {
          // Parse existing .env.local line by line
          const lines = envContent.split('\n');
          const updatedLines: string[] = [];
          const processedKeys = new Set<string>();

          // Update existing lines
          for (const line of lines) {
            const trimmedLine = line.trim();

            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) {
              updatedLines.push(line);
              continue;
            }

            // Check if this line contains one of our keys
            const [key] = trimmedLine.split('=');
            if (key && updates[key] !== undefined) {
              // Replace with new value
              updatedLines.push(`${key}=${updates[key]}`);
              processedKeys.add(key);
            } else {
              // Keep the line as is
              updatedLines.push(line);
            }
          }

          // Append new keys that weren't in the file
          for (const [key, value] of Object.entries(updates)) {
            if (!processedKeys.has(key)) {
              updatedLines.push(`${key}=${value}`);
            }
          }

          // Join lines and ensure single trailing newline
          let newContent = updatedLines.join('\n');
          if (newContent && !newContent.endsWith('\n')) {
            newContent += '\n';
          }

          await fs.writeFile(envPath, newContent, 'utf-8');
          console.log('Successfully updated .env.local with new configuration');
        }
      } catch (envError) {
        console.error('Failed to update .env.local:', envError);
        // Don't fail the request if local file update fails
      }

      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully to Supabase',
        saved: successCount
      })
    } catch (supabaseError) {
      console.error('Failed to save to Supabase:', supabaseError)
      return NextResponse.json({
        success: false,
        error: `Failed to save to Supabase: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`,
        details: supabaseError instanceof Error ? supabaseError.stack : 'No details available'
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

// DELETE - Hapus semua system settings
export async function DELETE() {
  try {
    // Coba hapus dari Supabase jika tersedia
    try {
      const { error } = await supabaseAdmin
        .from('system_settings')
        .delete()
        .neq('setting_key', 'app_name') // Jangan hapus app_name
        .neq('setting_key', 'app_version') // Jangan hapus app_version

      if (error) {
        console.error('Error deleting from Supabase:', error)
        return NextResponse.json({
          success: false,
          error: `Failed to delete settings: ${error.message}`
        }, { status: 500 })
      }

      console.log('Successfully deleted Supabase settings from database')
      return NextResponse.json({
        success: true,
        message: 'Supabase configuration deleted successfully'
      })
    } catch (supabaseError) {
      console.error('Supabase not available for deletion:', supabaseError)
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in DELETE /api/system-settings:', error)
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