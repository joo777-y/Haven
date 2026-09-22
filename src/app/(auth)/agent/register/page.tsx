import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AgentRegisterForm from "@/components/auth/AgentRegisterForm";

export const metadata: Metadata = {
  title: "Become an Advisor | HAVEN Real Estate Network",
  description: "Join HAVEN as a licensed real estate advisor to publish and manage luxury property listings.",
};

export default async function AgentRegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/agent/register");
  }

  // Check if user is already an agent
  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (agent) {
    redirect("/agent");
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-divider bg-surface p-8 shadow-sm">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary mb-3">
          Agent Self-Service Onboarding
        </span>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Join the HAVEN Advisor Network
        </h1>
        <p className="text-sm text-muted mt-2 max-w-lg mx-auto leading-relaxed">
          Provide your professional brokerage information and license accreditation to unlock full listing management and client inquiries.
        </p>
      </div>

      <AgentRegisterForm />
    </div>
  );
}
