// Cloudflare Workers Handler
interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
}

interface CloudflareConfig {
  apiToken: string;
  accountId: string;
  d1Database: string;
  workerApi: string;
  kvStorage: string;
  destinationEmails?: string[];
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // CORS headers
      const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
      }

      // GET Cloudflare Config
      if (path === '/api/cloudflare/config' && request.method === 'GET') {
        try {
          const result = await env.DB.prepare(
            'SELECT * FROM cloudflare_config LIMIT 1'
          ).first() as any;

          if (!result) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Config not found',
              }),
              { status: 404, headers }
            );
          }

          const config: CloudflareConfig = {
            apiToken: result.api_token ? '****' + result.api_token.slice(-4) : '',
            accountId: result.account_id || '',
            d1Database: result.d1_database || '',
            workerApi: result.worker_api ? '****' + result.worker_api.slice(-4) : '',
            kvStorage: result.kv_storage || '',
            destinationEmails: result.destination_emails ? JSON.parse(result.destination_emails) : [],
          };

          const fullConfig: any = {
            ...config,
            _full: {
              apiToken: result.api_token || '',
              accountId: result.account_id || '',
              d1Database: result.d1_database || '',
              workerApi: result.worker_api || '',
              kvStorage: result.kv_storage || '',
              destinationEmails: result.destination_emails ? JSON.parse(result.destination_emails) : [],
            },
          };

          return new Response(
            JSON.stringify({
              success: true,
              config: fullConfig,
            }),
            { headers }
          );
        } catch (error) {
          console.error('Error fetching config:', error);
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to fetch config: ' + (error as any).message,
            }),
            { status: 500, headers }
          );
        }
      }

      // POST Cloudflare Config
      if (path === '/api/cloudflare/config' && request.method === 'POST') {
        try {
          const body: CloudflareConfig = await request.json();

          const destinationEmails = JSON.stringify(body.destinationEmails || []);

          await env.DB.prepare(
            `INSERT OR REPLACE INTO cloudflare_config 
             (id, api_token, account_id, d1_database, worker_api, kv_storage, destination_emails, updated_at)
             VALUES (1, ?, ?, ?, ?, ?, ?, datetime('now'))`
          ).bind(
            body.apiToken,
            body.accountId,
            body.d1Database,
            body.workerApi,
            body.kvStorage,
            destinationEmails
          ).run();

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Config saved successfully',
              config: body,
            }),
            { headers }
          );
        } catch (error) {
          console.error('Error saving config:', error);
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to save config: ' + (error as any).message,
            }),
            { status: 500, headers }
          );
        }
      }

      // GET Email Routings
      if (path === '/api/email-routing' && request.method === 'GET') {
        try {
          const results = await env.DB.prepare(
            'SELECT * FROM email_routings ORDER BY created_at DESC'
          ).all() as any;

          return new Response(
            JSON.stringify({
              success: true,
              routings: results.results || [],
            }),
            { headers }
          );
        } catch (error) {
          console.error('Error fetching routings:', error);
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to fetch routings: ' + (error as any).message,
            }),
            { status: 500, headers }
          );
        }
      }

      // POST Email Routing
      if (path === '/api/email-routing' && request.method === 'POST') {
        try {
          const body = await request.json() as any;

          const id = crypto.randomUUID();
          
          await env.DB.prepare(
            `INSERT INTO email_routings (id, zone_id, zone_name, alias_part, full_email, destination, is_active, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
          ).bind(
            id,
            body.zoneId,
            body.zoneName,
            body.aliasPart,
            body.fullEmail,
            body.destination,
            body.isActive ? 1 : 0
          ).run();

          return new Response(
            JSON.stringify({
              success: true,
              id,
            }),
            { headers }
          );
        } catch (error) {
          console.error('Error creating routing:', error);
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to create routing: ' + (error as any).message,
            }),
            { status: 500, headers }
          );
        }
      }

      // DELETE Email Routing
      if (path.match(/^\/api\/email-routing\/[^/]+$/) && request.method === 'DELETE') {
        try {
          const id = path.split('/').pop();

          await env.DB.prepare(
            'DELETE FROM email_routings WHERE id = ?'
          ).bind(id).run();

          return new Response(
            JSON.stringify({
              success: true,
            }),
            { headers }
          );
        } catch (error) {
          console.error('Error deleting routing:', error);
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to delete routing: ' + (error as any).message,
            }),
            { status: 500, headers }
          );
        }
      }

      // GET Cloudflare Zones
      if (path === '/api/cloudflare/zones' && request.method === 'GET') {
        try {
          const config = await env.DB.prepare(
            'SELECT api_token, account_id FROM cloudflare_config LIMIT 1'
          ).first() as any;

          if (!config?.api_token) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'API token not configured',
              }),
              { status: 400, headers }
            );
          }

          // Call Cloudflare API
          const response = await fetch('https://api.cloudflare.com/client/v4/zones', {
            headers: {
              Authorization: `Bearer ${config.api_token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json() as any;

          if (!data.success) {
            return new Response(
              JSON.stringify({
                success: false,
                error: data.errors?.[0]?.message || 'Failed to fetch zones',
              }),
              { status: 400, headers }
            );
          }

          return new Response(
            JSON.stringify({
              success: true,
              zones: data.result,
            }),
            { headers }
          );
        } catch (error) {
          console.error('Error fetching zones:', error);
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Failed to fetch zones: ' + (error as any).message,
            }),
            { status: 500, headers }
          );
        }
      }

      // Health check
      if (path === '/' && request.method === 'GET') {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Email Routing Manager Worker is running',
            status: 'healthy',
          }),
          { headers }
        );
      }

      // 404 handler
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Not Found',
        }),
        { status: 404, headers }
      );

    } catch (error) {
      console.error('Unhandled error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal Server Error: ' + (error as any).message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};
