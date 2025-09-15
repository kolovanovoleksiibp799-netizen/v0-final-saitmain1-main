-- Drop existing tables if they exist to recreate with proper structure
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS advertisements CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with enhanced fields
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'vip', 'moderator', 'admin')),
    is_banned BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    bio TEXT,
    vip_expires_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create advertisements table with enhanced fields
CREATE TABLE advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10,2),
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive', 'pending', 'rejected')),
    is_vip BOOLEAN DEFAULT FALSE,
    vip_expires_at TIMESTAMP WITH TIME ZONE,
    views_count INTEGER DEFAULT 0,
    contact_phone TEXT,
    contact_email TEXT,
    location TEXT,
    condition TEXT CHECK (condition IN ('new', 'used', 'refurbished')),
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for ad-based messaging
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertisement_id UUID NOT NULL REFERENCES advertisements(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table for better session management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_logs table for audit trail
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'user', 'advertisement', 'system'
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_nickname ON users(nickname);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_banned ON users(is_banned);
CREATE INDEX idx_advertisements_user_id ON advertisements(user_id);
CREATE INDEX idx_advertisements_category ON advertisements(category);
CREATE INDEX idx_advertisements_subcategory ON advertisements(subcategory);
CREATE INDEX idx_advertisements_status ON advertisements(status);
CREATE INDEX idx_advertisements_is_vip ON advertisements(is_vip);
CREATE INDEX idx_advertisements_created_at ON advertisements(created_at);
CREATE INDEX idx_messages_advertisement_id ON messages(advertisement_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON advertisements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set VIP status based on role
CREATE OR REPLACE FUNCTION update_vip_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'vip' AND (OLD.role IS NULL OR OLD.role != 'vip') THEN
        NEW.vip_expires_at = NOW() + INTERVAL '30 days';
    ELSIF NEW.role != 'vip' THEN
        NEW.vip_expires_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_vip_status BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_vip_status();

-- Create function to automatically set advertisement VIP status
CREATE OR REPLACE FUNCTION update_ad_vip_status()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_vip_expires TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT role, vip_expires_at INTO user_role, user_vip_expires
    FROM users WHERE id = NEW.user_id;
    
    IF user_role = 'vip' AND (user_vip_expires IS NULL OR user_vip_expires > NOW()) THEN
        NEW.is_vip = TRUE;
        NEW.vip_expires_at = user_vip_expires;
    ELSE
        NEW.is_vip = FALSE;
        NEW.vip_expires_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_advertisement_vip_status BEFORE INSERT OR UPDATE ON advertisements
    FOR EACH ROW EXECUTE FUNCTION update_ad_vip_status();

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Admins can do everything with users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin'))
);

-- Advertisements policies
CREATE POLICY "Anyone can view active advertisements" ON advertisements FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create advertisements" ON advertisements FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own advertisements" ON advertisements FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own advertisements" ON advertisements FOR DELETE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Admins and moderators can manage all advertisements" ON advertisements FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'moderator'))
);

-- Messages policies
CREATE POLICY "Users can view their own messages" ON messages FOR SELECT USING (
    auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);
CREATE POLICY "Users can update their received messages" ON messages FOR UPDATE USING (auth.uid()::text = receiver_id::text);

-- Sessions policies
CREATE POLICY "Users can view their own sessions" ON user_sessions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create their own sessions" ON user_sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own sessions" ON user_sessions FOR DELETE USING (auth.uid()::text = user_id::text);

-- Admin logs policies
CREATE POLICY "Admins can view all logs" ON admin_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
);
CREATE POLICY "Admins and moderators can create logs" ON admin_logs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role IN ('admin', 'moderator'))
);
