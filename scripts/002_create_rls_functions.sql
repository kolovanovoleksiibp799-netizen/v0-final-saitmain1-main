-- Create function to set application user context for RLS
CREATE OR REPLACE FUNCTION set_app_user(user_id UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current application user
CREATE OR REPLACE FUNCTION get_app_user()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies to use app user context instead of auth.uid()
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can do everything with users" ON users;
DROP POLICY IF EXISTS "Users can create advertisements" ON advertisements;
DROP POLICY IF EXISTS "Users can update their own advertisements" ON advertisements;
DROP POLICY IF EXISTS "Users can delete their own advertisements" ON advertisements;
DROP POLICY IF EXISTS "Admins and moderators can manage all advertisements" ON advertisements;
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON messages;
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Admins can view all logs" ON admin_logs;
DROP POLICY IF EXISTS "Admins and moderators can create logs" ON admin_logs;

-- Recreate policies with app user context
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (get_app_user() = id);
CREATE POLICY "Admins can do everything with users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = get_app_user() AND role IN ('admin'))
);

CREATE POLICY "Users can create advertisements" ON advertisements FOR INSERT WITH CHECK (get_app_user() = user_id);
CREATE POLICY "Users can update their own advertisements" ON advertisements FOR UPDATE USING (get_app_user() = user_id);
CREATE POLICY "Users can delete their own advertisements" ON advertisements FOR DELETE USING (get_app_user() = user_id);
CREATE POLICY "Admins and moderators can manage all advertisements" ON advertisements FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = get_app_user() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Users can view their own messages" ON messages FOR SELECT USING (
    get_app_user() = sender_id OR get_app_user() = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (get_app_user() = sender_id);
CREATE POLICY "Users can update their received messages" ON messages FOR UPDATE USING (get_app_user() = receiver_id);

CREATE POLICY "Users can view their own sessions" ON user_sessions FOR SELECT USING (get_app_user() = user_id);
CREATE POLICY "Users can create their own sessions" ON user_sessions FOR INSERT WITH CHECK (get_app_user() = user_id);
CREATE POLICY "Users can delete their own sessions" ON user_sessions FOR DELETE USING (get_app_user() = user_id);

CREATE POLICY "Admins can view all logs" ON admin_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = get_app_user() AND role = 'admin')
);
CREATE POLICY "Admins and moderators can create logs" ON admin_logs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = get_app_user() AND role IN ('admin', 'moderator'))
);
