import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hntjwvbbmpvxogdqmxtf.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudGp3dmJibXB2eG9nZHFteHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk5MzI1MDEsImV4cCI6MTk4NTUwODUwMX0.AwZPouiFmg9cIk3uCRjtaXftf7IdFbz85OpcM2El0As";
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
