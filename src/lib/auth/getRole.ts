import { createClient } from "@/lib/supabase/server";
import type { UserRoleState, Profile, Agent } from "@/types/auth";

export async function getUserRoleState(): Promise<UserRoleState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      agent: null,
      isAgent: false,
      isAdmin: false,
    };
  }

  // Query own profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Query own agent record (if registered as an agent)
  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profile as Profile | null,
    agent: agent as Agent | null,
    isAgent: !!agent,
    isAdmin: false,
  };
}
