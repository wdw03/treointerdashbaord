import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gkskeljvgphslkzctjfp.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrc2tlbGp2Z3Boc2xremN0amZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2Nzc1MzEsImV4cCI6MjEwNDI1MzUzMX0.Ivn1_8l1j_6HM46-NcKELDIVZk5L2COUNKGmA8kIOr4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
