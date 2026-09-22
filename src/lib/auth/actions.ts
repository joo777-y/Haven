"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  agentOnboardingSchema,
  profileUpdateSchema,
} from "@/lib/validations/auth";

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export async function signInAction(
  formData: FormData
): Promise<ActionResponse<{ redirectTo: string }>> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Please correct the form errors.",
    };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      message: error.message || "Invalid email or password.",
    };
  }

  if (!authData.user) {
    return {
      success: false,
      message: "Authentication failed. Please try again.",
    };
  }

  // Check if redirect query param was provided
  const redirectParam = formData.get("redirect")?.toString();

  // Check if user is an agent to choose default destination
  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", authData.user.id)
    .maybeSingle();

  const defaultDestination = agent ? "/agent" : "/dashboard";
  const targetRedirect = redirectParam && redirectParam.startsWith("/")
    ? redirectParam
    : defaultDestination;

  revalidatePath("/", "layout");
  return {
    success: true,
    data: { redirectTo: targetRedirect },
  };
}

export async function signUpAction(
  formData: FormData
): Promise<ActionResponse<{ requireEmailVerification: boolean }>> {
  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Please correct the form errors.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message || "Registration failed. Please try again.",
    };
  }

  const requireEmailVerification =
    !data.session && !!data.user && data.user.identities?.length !== 0;

  revalidatePath("/", "layout");

  return {
    success: true,
    message: requireEmailVerification
      ? "Account created! Please check your email to verify your account."
      : "Account created successfully!",
    data: { requireEmailVerification },
  };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPasswordAction(
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    email: formData.get("email"),
  };

  const parsed = forgotPasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Please enter a valid email address.",
    };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to send reset instructions.",
    };
  }

  return {
    success: true,
    message: "Password reset link has been sent to your email address.",
  };
}

export async function resetPasswordAction(
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = resetPasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Please correct the form errors.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to update password.",
    };
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    message: "Your password has been reset successfully.",
  };
}

export async function registerAgentAction(
  formData: FormData
): Promise<ActionResponse<{ agentId: string }>> {
  const rawData = {
    companyName: formData.get("companyName"),
    professionalTitle: formData.get("professionalTitle"),
    bio: formData.get("bio"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    licenseNumber: formData.get("licenseNumber"),
  };

  const parsed = agentOnboardingSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Please correct the form errors.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be signed in to register as an agent.",
    };
  }

  // Insert agent record
  const { data: agent, error } = await supabase
    .from("agents")
    .insert({
      profile_id: user.id,
      company_name: parsed.data.companyName,
      professional_title: parsed.data.professionalTitle,
      bio: parsed.data.bio,
      phone: parsed.data.phone,
      email: parsed.data.email,
      license_number: parsed.data.licenseNumber,
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to register agent profile.",
    };
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    message: "Agent profile registered successfully!",
    data: { agentId: agent.id },
  };
}

export async function updateProfileAction(
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || null,
    bio: formData.get("bio") || null,
  };

  const parsed = profileUpdateSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Please correct the form errors.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be signed in to update your profile.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      bio: parsed.data.bio,
    })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to update profile.",
    };
  }

  revalidatePath("/", "layout");
  return {
    success: true,
    message: "Profile updated successfully.",
  };
}
