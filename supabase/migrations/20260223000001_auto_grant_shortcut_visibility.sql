-- Auto-grant shortcut visibility to owner
-- This migration creates a trigger that automatically adds the shortcut owner to shortcut_visibility

-- Create function to auto-grant visibility
CREATE OR REPLACE FUNCTION auto_grant_shortcut_visibility()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert visibility record for the shortcut owner
    INSERT INTO shortcut_visibility (shortcut_id, user_id, granted_by)
    VALUES (NEW.id, NEW.user_id, NEW.user_id)
    ON CONFLICT (shortcut_id, user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on shortcuts table
DROP TRIGGER IF EXISTS auto_grant_visibility_trigger ON shortcuts;

CREATE TRIGGER auto_grant_visibility_trigger
    AFTER INSERT ON shortcuts
    FOR EACH ROW
    EXECUTE FUNCTION auto_grant_shortcut_visibility();

-- Add unique constraint to prevent duplicate visibility entries
ALTER TABLE shortcut_visibility
DROP CONSTRAINT IF EXISTS shortcut_visibility_unique;

ALTER TABLE shortcut_visibility
ADD CONSTRAINT shortcut_visibility_unique 
UNIQUE (shortcut_id, user_id);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION auto_grant_shortcut_visibility() TO authenticated;

-- Backfill existing shortcuts that don't have visibility entries
INSERT INTO shortcut_visibility (shortcut_id, user_id, granted_by)
SELECT 
    s.id as shortcut_id,
    s.user_id as user_id,
    s.user_id as granted_by
FROM shortcuts s
WHERE NOT EXISTS (
    SELECT 1 
    FROM shortcut_visibility sv 
    WHERE sv.shortcut_id = s.id 
    AND sv.user_id = s.user_id
)
ON CONFLICT (shortcut_id, user_id) DO NOTHING;

-- Log the results
DO $$
DECLARE
    backfilled_count INTEGER;
BEGIN
    GET DIAGNOSTICS backfilled_count = ROW_COUNT;
    RAISE NOTICE 'Backfilled % shortcut visibility entries for owners', backfilled_count;
END $$;

RAISE NOTICE '====================================================';
RAISE NOTICE 'Auto-grant shortcut visibility trigger created!';
RAISE NOTICE 'All new shortcuts will automatically grant visibility to their owner';
RAISE NOTICE '====================================================';
