import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch statistics
export async function GET() {
    try {
        // Get total emails created from system settings
        const { data: setting, error } = await supabase
            .from('system_settings')
            .select('setting_value')
            .eq('setting_key', 'total_emails_created')
            .single();

        if (error) {
            console.error('Error fetching total_emails_created:', error);
            // Return 0 if setting doesn't exist yet
            return NextResponse.json({
                success: true,
                totalEmailsCreated: 0
            });
        }

        const totalEmailsCreated = parseInt(setting?.setting_value || '0', 10);

        return NextResponse.json({
            success: true,
            totalEmailsCreated
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
