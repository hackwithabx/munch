import HomePageClient from "@/components/HomePageClient";
import { hasValidSupabasePublicEnv } from "@/lib/supabase/env";

type HomePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const hasValidEnv = hasValidSupabasePublicEnv();
  return <HomePageClient initialQuery={params.q || ""} showConfigWarning={!hasValidEnv} />;
}
