const PLACEHOLDER_TOKENS = ["YOUR_PROJECT_REF", "YOUR_SUPABASE_ANON_KEY"];

export function hasValidSupabasePublicEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  return !PLACEHOLDER_TOKENS.some(
    (token) => supabaseUrl.includes(token) || supabaseAnonKey.includes(token),
  );
}
