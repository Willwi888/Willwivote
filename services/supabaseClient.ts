
import { createClient } from '@supabase/supabase-js';

// --- 雲端資料庫設定 (Supabase Setup) ---
// 已根據您提供的金鑰自動設定完成
// Project Ref: cqqulfilsrsrzxpatkwa

const SUPABASE_URL = 'https://cqqulfilsrsrzxpatkwa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcXVsZmlsc3Jzcnp4cGF0a3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNDI0NjIsImV4cCI6MjA4MDgxODQ2Mn0.4FkqWnd8xwiwYQJ44S934V8ljkuflrPV2g3LwC49aAY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
