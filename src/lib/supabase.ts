import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olwrgthvydukavmpfeiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sd3JndGh2eWR1a2F2bXBmZWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0ODY0MDAsImV4cCI6MjAyMzA2MjQwMH0.vHxYYRD8K1mPxwLz8ReVDxA3RVVYRCXbZYMLEHHCki8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  created_at: string;
  email: string;
};

export type Candidate = {
  id: string;
  created_at: string;
  user_id: string;
  linkedin_url: string;
  screening_notes: string;
  resume_path: string;
};

export type ExecutiveSummary = {
  id: string;
  created_at: string;
  candidate_id: string;
  brass_tax_criteria: Record<string, string>;
  sensory_criteria: Record<string, string>;
};