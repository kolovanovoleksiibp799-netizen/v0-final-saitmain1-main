-- Create function to increment views count
CREATE OR REPLACE FUNCTION increment_views(ad_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE advertisements 
    SET views_count = views_count + 1 
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to check and update expired VIP status
CREATE OR REPLACE FUNCTION update_expired_vip_status()
RETURNS void AS $$
BEGIN
    -- Update users with expired VIP status
    UPDATE users 
    SET role = 'user', vip_expires_at = NULL 
    WHERE role = 'vip' 
    AND vip_expires_at IS NOT NULL 
    AND vip_expires_at < NOW();
    
    -- Update advertisements with expired VIP status
    UPDATE advertisements 
    SET is_vip = FALSE, vip_expires_at = NULL 
    WHERE is_vip = TRUE 
    AND vip_expires_at IS NOT NULL 
    AND vip_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically promote user ads to VIP when user gets VIP status
CREATE OR REPLACE FUNCTION promote_user_ads_to_vip()
RETURNS TRIGGER AS $$
BEGIN
    -- If user role changed to VIP, promote all their active ads
    IF NEW.role = 'vip' AND (OLD.role IS NULL OR OLD.role != 'vip') THEN
        UPDATE advertisements 
        SET is_vip = TRUE, vip_expires_at = NEW.vip_expires_at
        WHERE user_id = NEW.id AND status = 'active';
    -- If user role changed from VIP, demote all their ads
    ELSIF OLD.role = 'vip' AND NEW.role != 'vip' THEN
        UPDATE advertisements 
        SET is_vip = FALSE, vip_expires_at = NULL
        WHERE user_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically promote/demote user ads when VIP status changes
DROP TRIGGER IF EXISTS promote_user_ads_on_vip_change ON users;
CREATE TRIGGER promote_user_ads_on_vip_change
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION promote_user_ads_to_vip();

-- Create function to get VIP statistics
CREATE OR REPLACE FUNCTION get_vip_stats()
RETURNS TABLE(
    total_vip_users INTEGER,
    active_vip_ads INTEGER,
    vip_revenue_potential NUMERIC,
    avg_vip_views NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM users WHERE role = 'vip' AND (vip_expires_at IS NULL OR vip_expires_at > NOW())),
        (SELECT COUNT(*)::INTEGER FROM advertisements WHERE is_vip = TRUE AND status = 'active'),
        (SELECT COALESCE(SUM(price), 0) FROM advertisements WHERE is_vip = TRUE AND status = 'active'),
        (SELECT COALESCE(AVG(views_count), 0) FROM advertisements WHERE is_vip = TRUE AND status = 'active');
END;
$$ LANGUAGE plpgsql;
