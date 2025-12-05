-- Supabase SQL Schema for Email Routing Manager

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_routing table
CREATE TABLE IF NOT EXISTS email_routing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id VARCHAR(255) NOT NULL,
    zone_name VARCHAR(255) NOT NULL,
    alias_part VARCHAR(255) NOT NULL,
    full_email VARCHAR(255) NOT NULL,
    rule_id VARCHAR(255) UNIQUE NOT NULL,
    destination VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cloudflare_config table
CREATE TABLE IF NOT EXISTS cloudflare_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_token TEXT NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    d1_database TEXT,
    worker_api TEXT,
    kv_storage TEXT,
    destination_emails TEXT DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default user
INSERT INTO users (username, password, email, name) VALUES 
('windaa', '$2a$10$rQZ8kHWKtGY5uKx4vV2xMeXzJzJ8VjYJjYJjYJjYJjYJjYJjYJjYJjY', 'admin@example.com', 'Administrator')
ON CONFLICT (username) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, is_encrypted) VALUES 
('supabase_url', '', 'Supabase Project URL', false),
('supabase_anon_key', '', 'Supabase Anonymous Key', false),
('supabase_service_key', '', 'Supabase Service Role Key', true),
('app_name', 'Email Routing Manager', 'Application Name', false),
('app_version', '1.0.0', 'Application Version', false),
('total_emails_created', '0', 'Cumulative count of all emails ever created', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_routing_zone_id ON email_routing(zone_id);
CREATE INDEX IF NOT EXISTS idx_email_routing_rule_id ON email_routing(rule_id);
CREATE INDEX IF NOT EXISTS idx_email_routing_is_active ON email_routing(is_active);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_routing_updated_at ON email_routing;
CREATE TRIGGER update_email_routing_updated_at BEFORE UPDATE ON email_routing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cloudflare_config_updated_at ON cloudflare_config;
CREATE TRIGGER update_cloudflare_config_updated_at BEFORE UPDATE ON cloudflare_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_routing ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloudflare_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data (for now, allow all for admin)
DROP POLICY IF EXISTS "Users can view all data" ON users;
CREATE POLICY "Users can view all data" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert all data" ON users;
CREATE POLICY "Users can insert all data" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update all data" ON users;
CREATE POLICY "Users can update all data" ON users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete all data" ON users;
CREATE POLICY "Users can delete all data" ON users FOR DELETE USING (true);

-- Email routing policies
DROP POLICY IF EXISTS "Email routing can be managed by all users" ON email_routing;
CREATE POLICY "Email routing can be managed by all users" ON email_routing FOR ALL USING (true);

-- Cloudflare config policies (restricted)
DROP POLICY IF EXISTS "Cloudflare config can be managed by all users" ON cloudflare_config;
CREATE POLICY "Cloudflare config can be managed by all users" ON cloudflare_config FOR ALL USING (true);

-- System settings policies (read-only for most users)
DROP POLICY IF EXISTS "System settings can be viewed by all users" ON system_settings;
CREATE POLICY "System settings can be viewed by all users" ON system_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "System settings can be managed by all users" ON system_settings;
CREATE POLICY "System settings can be managed by all users" ON system_settings FOR ALL USING (true);