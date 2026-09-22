import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be under 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const agentOnboardingSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company / Agency name is required")
    .max(150, "Company name must be under 150 characters"),
  professionalTitle: z
    .string()
    .min(2, "Professional title is required (e.g. Senior Broker)")
    .max(100, "Professional title must be under 100 characters"),
  bio: z
    .string()
    .min(20, "Please provide a professional bio of at least 20 characters")
    .max(2000, "Bio must be under 2000 characters"),
  phone: z
    .string()
    .min(7, "Valid phone number is required")
    .max(30, "Phone number is too long"),
  email: z
    .string()
    .min(1, "Professional email is required")
    .email("Valid professional email is required"),
  licenseNumber: z
    .string()
    .min(3, "Real estate license number is required")
    .max(50, "License number is too long"),
});

export type AgentOnboardingInput = z.infer<typeof agentOnboardingSchema>;

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters"),
  phone: z
    .string()
    .max(30, "Phone number is too long")
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(1000, "Bio must be under 1000 characters")
    .optional()
    .nullable(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
