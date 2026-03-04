-- Expand shortcuts.icon to support full public storage URLs for personal icons
-- Date: 2026-03-04

ALTER TABLE public.shortcuts
ALTER COLUMN icon TYPE TEXT;
