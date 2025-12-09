
import { createClient } from '@supabase/supabase-js';

// 1. Go to https://supabase.com/ -> Create New Project
// 2. Go to Project Settings -> API
// 3. Copy "Project URL" and "anon public" key below:

const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Only initialize if keys are present to prevent crashes
export const supabase = (SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL') 
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

/**
 * GUIDE TO MIGRATING TO SUPABASE:
 * 
 * 1. Storage (Audio):
 *    - Create a 'bucket' named 'songs'.
 *    - Set bucket to "Public".
 *    - Upload your MP3s.
 *    - The URL will be: `${SUPABASE_URL}/storage/v1/object/public/songs/filename.mp3`
 * 
 * 2. Database (Votes):
 *    - Create table 'votes'.
 *    - Columns: id (int8), user_name (text), user_email (text), vote_ids (int8[] - array of integers), created_at (timestamptz).
 *    - Update storage.ts to write to this table instead of localStorage.
 */
