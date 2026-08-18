import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardEditor from "@/components/DashboardEditor";
import MyChasingList from "@/components/MyChasingList";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileQuery, linksQuery] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("social_links").select("*").eq("profile_id", user.id).order("display_order", { ascending: true }),
  ]);

  if (!profileQuery.data) {
    redirect("/login");
  }

  const chasesQuery = await supabase
    .from("profile_chases")
    .select("target_profile_id")
    .eq("chaser_profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const chaseNotesQuery = await supabase
    .from("chase_notes")
    .select("target_profile_id, note")
    .eq("chaser_profile_id", user.id);

  const targetIds = Array.from(new Set((chasesQuery.data || []).map((row) => row.target_profile_id)));
  const chasedProfilesQuery = targetIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, city")
        .in("id", targetIds)
    : { data: [] as Array<{ id: string; username: string; display_name: string | null; avatar_url: string | null; city: string | null }> };

  const chasedProfilesMap = new Map((chasedProfilesQuery.data || []).map((row) => [row.id, row]));
  const chaseNotesMap = new Map((chaseNotesQuery.data || []).map((row) => [row.target_profile_id, row.note]));
  const orderedChasedProfiles = targetIds
    .map((id) => chasedProfilesMap.get(id))
    .filter((item): item is { id: string; username: string; display_name: string | null; avatar_url: string | null; city: string | null } => Boolean(item));

  const chasedCardsWithNotes = orderedChasedProfiles.map((card) => ({
    ...card,
    note: chaseNotesMap.get(card.id) || "",
  }));

  return (
    <div className="space-y-6">
      <DashboardEditor
        userId={user.id}
        initialProfile={profileQuery.data}
        initialLinks={linksQuery.data || []}
      />
      <MyChasingList initialCards={chasedCardsWithNotes} />
    </div>
  );
}
