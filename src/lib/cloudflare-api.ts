import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with hardcoded credentials
// This ensures the client is always available even if env vars are not set
const supabaseUrl = process.env.SUPABASE_URL || 'https://ihqqrzcafzzmpgrwklox.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlocXFyemNhZnp6bXBncndrbG94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkwNzc4NSwiZXhwIjoyMDgwNDgzNzg1fQ.X5oErzhks42RGXonMKYs3qQpAmi2s2Pa-VZU0JbKtzM';

console.log('[cloudflare-api] Initializing Supabase client');
console.log('[cloudflare-api] URL:', supabaseUrl);
console.log('[cloudflare-api] Key exists:', !!supabaseServiceKey);

const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

export async function getCloudflareConfig() {
  try {
    const { data: config, error } = await supabaseClient
      .from('cloudflare_config')
      .select('*')
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Not "no rows" error
        console.error("Error fetching Cloudflare config:", error);
      }
      return null;
    }

    // Convert snake_case to camelCase for backward compatibility
    return config ? {
      id: config.id,
      apiToken: config.api_token,
      accountId: config.account_id,
      d1Database: config.d1_database,
      workerApi: config.worker_api,
      kvStorage: config.kv_storage,
      destinationEmails: config.destination_emails,
      createdAt: config.created_at,
      updatedAt: config.updated_at
    } : null;
  } catch (error) {
    console.error("Error fetching Cloudflare config:", error);
    return null;
  }
}

export async function callCloudflareAPI(
  endpoint: string,
  method: string = "GET",
  body?: Record<string, any>
) {
  const config = await getCloudflareConfig();

  if (!config) {
    throw new Error("Cloudflare config tidak ditemukan. Silakan setup API Config terlebih dahulu.");
  }

  const url = `https://api.cloudflare.com/client/v4${endpoint}`;
  const headers: HeadersInit = {
    "Authorization": `Bearer ${config.apiToken}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudflare API Error:", data);
      throw new Error(data.errors?.[0]?.message || "Cloudflare API Error");
    }

    return data;
  } catch (error) {
    console.error("Error calling Cloudflare API:", error);
    throw error;
  }
}
