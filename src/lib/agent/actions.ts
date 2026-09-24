"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const agentProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required (minimum 2 characters)")
    .max(100, "Full name cannot exceed 100 characters")
    .optional(),
  companyName: z
    .string()
    .trim()
    .min(2, "Company/brokerage name is required (minimum 2 characters)")
    .max(120, "Company name cannot exceed 120 characters"),
  professionalTitle: z
    .string()
    .trim()
    .min(2, "Professional title is required (minimum 2 characters)")
    .max(100, "Professional title cannot exceed 100 characters"),
  bio: z
    .string()
    .trim()
    .max(1000, "Bio cannot exceed 1000 characters")
    .optional()
    .nullable(),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number cannot exceed 30 characters")
    .optional()
    .nullable(),
  licenseNumber: z
    .string()
    .trim()
    .max(50, "License ID cannot exceed 50 characters")
    .optional()
    .nullable(),
});

export type AgentProfileInput = z.infer<typeof agentProfileSchema>;

/**
 * Updates the authenticated real estate advisor's professional credentials.
 * Resolves identity strictly via auth.uid() -> agents.profile_id -> agents.id.
 * Never accepts or trusts client-supplied agent identifiers.
 */
export async function updateAgentProfileAction(
  rawData: AgentProfileInput
): Promise<ActionResult> {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // 2. Resolve advisor record strictly from auth.uid()
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (agentError || !agent) {
    return {
      success: false,
      error: "Advisor profile record not found. Please register as an advisor first.",
    };
  }

  // 3. Validate payload with Zod
  const parsed = agentProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
    };
  }

  // 4. Update profiles record (name, phone, bio)
  if (parsed.data.fullName) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone || null,
        bio: parsed.data.bio || null,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Error updating profile in agent update:", profileError);
    }
  }

  // 5. Update agents record strictly scoped to agent.id and profile_id = user.id
  const { error: updateError } = await supabase
    .from("agents")
    .update({
      company_name: parsed.data.companyName,
      professional_title: parsed.data.professionalTitle,
      bio: parsed.data.bio || null,
      phone: parsed.data.phone || null,
      license_number: parsed.data.licenseNumber || null,
    })
    .eq("id", agent.id)
    .eq("profile_id", user.id);

  if (updateError) {
    console.error("Error updating advisor profile:", updateError);
    return { success: false, error: "Failed to update advisor profile." };
  }

  // 5. Revalidate relevant views
  revalidatePath("/agent");
  revalidatePath("/agent/profile");
  revalidatePath("/agents");

  return { success: true };
}
