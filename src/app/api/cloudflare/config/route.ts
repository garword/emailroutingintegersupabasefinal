import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Ambil konfigurasi API
export async function GET() {
  try {
    const { data: config, error } = await supabaseAdmin
      .from('cloudflare_config')
      .select('*')
      .single();

    if (error || !config) {
      if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
        console.error("Supabase error fetching config:", error);
      }

      return NextResponse.json({
        success: true,
        config: null,
        message: "Belum ada konfigurasi"
      });
    }

    const parsedEmails = config.destination_emails ? JSON.parse(config.destination_emails) : [];

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        apiToken: config.api_token ? "***" + config.api_token.slice(-4) : "",
        accountId: config.account_id ? "***" + config.account_id.slice(-4) : "",
        d1Database: config.d1_database ? "***" + config.d1_database.slice(-4) : "",
        workerApi: config.worker_api ? "***" + config.worker_api.slice(-4) : "",
        kvStorage: config.kv_storage ? "***" + config.kv_storage.slice(-4) : "",
        destinationEmails: parsedEmails,
        // Untuk keperluan internal, sediakan nilai penuh
        _full: {
          apiToken: config.api_token,
          accountId: config.account_id,
          d1Database: config.d1_database,
          workerApi: config.worker_api,
          kvStorage: config.kv_storage,
          destinationEmails: parsedEmails,
        }
      }
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil konfigurasi" },
      { status: 500 }
    );
  }
}

// POST - Simpan atau update konfigurasi API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiToken, accountId, d1Database, workerApi, kvStorage, destinationEmails } = body;

    // Validasi input
    if (!apiToken || !accountId || !d1Database || !workerApi || !kvStorage) {
      return NextResponse.json(
        { success: false, error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Cek apakah sudah ada konfigurasi
    const { data: existingConfig } = await supabaseAdmin
      .from('cloudflare_config')
      .select('id')
      .single();

    let config;
    const configData = {
      api_token: apiToken,
      account_id: accountId,
      d1_database: d1Database,
      worker_api: workerApi,
      kv_storage: kvStorage,
      destination_emails: destinationEmails ? JSON.stringify(destinationEmails) : "[]",
      updated_at: new Date().toISOString()
    };

    if (existingConfig) {
      // Update
      const { data, error } = await supabaseAdmin
        .from('cloudflare_config')
        .update(configData)
        .eq('id', existingConfig.id)
        .select()
        .single();

      if (error) throw error;
      config = data;
    } else {
      // Create
      const { data, error } = await supabaseAdmin
        .from('cloudflare_config')
        .insert({
          ...configData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      config = data;
    }

    // Parse kembali destination emails untuk response
    const parsedEmails = config.destination_emails ? JSON.parse(config.destination_emails) : [];

    return NextResponse.json({
      success: true,
      message: "Konfigurasi berhasil disimpan",
      config: {
        id: config.id,
        apiToken: "***" + config.api_token.slice(-4),
        accountId: "***" + config.account_id.slice(-4),
        d1Database: "***" + config.d1_database.slice(-4),
        workerApi: "***" + config.worker_api.slice(-4),
        kvStorage: "***" + config.kv_storage.slice(-4),
        destinationEmails: parsedEmails,
      }
    });
  } catch (error) {
    console.error("Error saving config:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan konfigurasi" },
      { status: 500 }
    );
  }
}

// PUT - Update konfigurasi API (untuk endpoint yang lebih semantic)
export async function PUT(request: NextRequest) {
  return POST(request);
}
