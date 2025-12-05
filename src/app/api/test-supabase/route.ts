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
      const { data, error } = await supabase
        .from('system_settings')
        .select('count')
        .limit(1)

      if (error) {
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
            .select('count')
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
        details: testError
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