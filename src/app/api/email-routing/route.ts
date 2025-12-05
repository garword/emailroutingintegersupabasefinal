import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCloudflareConfig } from '@/lib/cloudflare-api';

// GET - List all email routing
export async function GET() {
  try {
    const { data: emails, error } = await supabase
      .from('email_routing')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      emails
    });
  } catch (error) {
    console.error('Error fetching email routing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new email routing
export async function POST(request: NextRequest) {
  try {
    const config = await getCloudflareConfig();

    if (!config) {
      return NextResponse.json({
        success: false,
        error: "Cloudflare API config belum dikonfigurasi. Silakan setup di Dashboard Config terlebih dahulu."
      }, { status: 400 });
    }

    const body = await request.json();
    const { zoneId, aliasPart, destinationEmail } = body;

    if (!zoneId || !aliasPart || !destinationEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: zoneId, aliasPart, destinationEmail'
      }, { status: 400 });
    }

    // Get zone details
    const zoneResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!zoneResponse.ok) {
      throw new Error(`Failed to get zone details: ${zoneResponse.status} ${zoneResponse.statusText}`);
    }

    const zoneData = await zoneResponse.json();
    const zoneName = zoneData.result.name;
    const fullEmail = `${aliasPart}@${zoneName}`;

    // Create email routing rule
    const routingResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/rules`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: true,
          matchers: [
            {
              type: "literal",
              field: "to",
              value: fullEmail
            }
          ],
          actions: [
            {
              type: "forward",
              value: [destinationEmail]
            }
          ],
          name: `Auto-generated via Email Manager`
        })
      }
    );

    if (!routingResponse.ok) {
      const errorData = await routingResponse.json();
      throw new Error(`Failed to create routing rule: ${errorData.message || routingResponse.statusText}`);
    }

    const routingData = await routingResponse.json();
    const ruleId = routingData.result.id;

    // Save to database
    const { data: newEmailRouting, error } = await supabase
      .from('email_routing')
      .insert({
        zone_id: zoneId,
        zone_name: zoneName,
        alias_part: aliasPart,
        full_email: fullEmail,
        rule_id: ruleId,
        destination: destinationEmail,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      email: newEmailRouting
    });
  } catch (error) {
    console.error('Error creating email routing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}