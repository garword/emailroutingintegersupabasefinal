import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST - Test Supabase connection
export async function POST(request: NextRequest) {
  try {
    const { supabaseUrl, supabaseAnonKey, supabaseServiceKey } = await request.json()

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase URL and Anonymous Key are required' },
        { status: 400 }
      )
    }

    // Test connection dengan anon key
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    try {
      // Test dengan query yang lebih sederhana
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)

      if (error) {
        // Jika tabel tidak ada, coba buat dengan query sederhana
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          return NextResponse.json({
            success: false,
            error: 'Table system_settings does not exist. Please run the SQL schema first.',
            suggestion: 'Run the SQL schema in Supabase dashboard before testing connection.'
          }, { status: 400 })
        }
        
        return NextResponse.json({
          success: false,
          error: `Connection failed: ${error.message}`,
          details: error
        }, { status: 400 })
      }

      // Test dengan service key jika ada
      let serviceKeyTest = { success: true, message: 'Not tested' }
      if (supabaseServiceKey) {
        try {
          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
          const { data: adminData, error: adminError } = await supabaseAdmin
            .from('users')
            .select('*')
            .limit(1)

          if (adminError) {
            serviceKeyTest = { success: false, error: adminError.message }
          } else {
            serviceKeyTest = { success: true, message: 'Service key working' }
          }
        } catch (serviceError) {
          serviceKeyTest = { success: false, error: 'Service key invalid' }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Connection successful',
        tests: {
          anonKey: { success: true, message: 'Anonymous key working' },
          serviceKey: serviceKeyTest
        }
      })
    } catch (testError) {
      return NextResponse.json({
        success: false,
        error: 'Connection test failed',
        details: testError instanceof Error ? testError.message : 'Unknown error'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in POST /api/test-supabase:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}