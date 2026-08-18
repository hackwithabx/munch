import HomePageClient from "@/components/HomePageClient";
import { hasValidSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type HomePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const hasValidEnv = hasValidSupabasePublicEnv();
  let viewer: { username: string; displayName: string | null } | undefined;

  if (hasValidEnv) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const profileQuery = await supabase.from("profiles").select("username, display_name").eq("id", user.id).single();
        if (profileQuery.data) {
          viewer = {
            username: profileQuery.data.username,
            displayName: profileQuery.data.display_name,
          };
        }
      }
    } catch {
      viewer = undefined;
    }
  }

  return <HomePageClient initialQuery={params.q || ""} showConfigWarning={!hasValidEnv} viewer={viewer} />;
}
