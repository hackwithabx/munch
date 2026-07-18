import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardEditor from "@/components/DashboardEditor";

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

  return (
    <DashboardEditor
      userId={user.id}
      initialProfile={profileQuery.data}
      initialLinks={linksQuery.data || []}
    />
  );
}
