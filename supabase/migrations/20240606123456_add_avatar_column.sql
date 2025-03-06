
-- Update the profiles table to ensure it has avatar_url column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
