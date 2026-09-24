"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  Building2,
  Phone,
  FileText,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Shield,
  Award,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { updateAgentProfileAction } from "@/lib/agent/actions";
import { uploadAvatar } from "@/lib/supabase/storage";
import { useAuth } from "@/components/auth/AuthProvider";

interface AgentProfileFormProps {
  userId: string;
  initialProfile: {
    fullName: string;
    avatarUrl: string | null;
    email: string;
    phone: string | null;
    bio: string | null;
  };
  initialAgent: {
    id: string;
    companyName: string | null;
    professionalTitle: string | null;
    bio: string | null;
    phone: string | null;
    licenseNumber: string | null;
    email: string | null;
  };
}

export default function AgentProfileForm({
  userId,
  initialProfile,
  initialAgent,
}: AgentProfileFormProps) {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(initialProfile.fullName || "");
  const [companyName, setCompanyName] = useState(
    initialAgent.companyName || ""
  );
  const [professionalTitle, setProfessionalTitle] = useState(
    initialAgent.professionalTitle || ""
  );
  const [phone, setPhone] = useState(
    initialAgent.phone || initialProfile.phone || ""
  );
  const [licenseNumber, setLicenseNumber] = useState(
    initialAgent.licenseNumber || ""
  );
  const [bio, setBio] = useState(
    initialAgent.bio || initialProfile.bio || ""
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialProfile.avatarUrl || null
  );

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("Avatar image must be smaller than 3MB.");
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);
    setSuccess(null);

    try {
      const newUrl = await uploadAvatar(file, userId);
      setAvatarUrl(newUrl);
      await refreshProfile();
      setSuccess("Profile photo updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to upload avatar image."
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const res = await updateAgentProfileAction({
        fullName: fullName.trim(),
        companyName: companyName.trim(),
        professionalTitle: professionalTitle.trim(),
        phone: phone.trim() || null,
        licenseNumber: licenseNumber.trim() || null,
        bio: bio.trim() || null,
      });

      if (!res.success) {
        setError(res.error || "Failed to update advisor credentials.");
      } else {
        setSuccess("Advisor credentials successfully updated!");
        await refreshProfile();
        router.refresh();
        setTimeout(() => setSuccess(null), 3500);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = fullName || initialProfile.email.split("@")[0] || "Advisor";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Alert banners */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{success}</span>
        </div>
      )}

      {/* 1. Advisor Avatar & Identity Card */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 rounded-2xl border border-divider bg-surface/60 p-6">
        <div className="relative group shrink-0">
          <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl bg-secondary/10 border-2 border-divider text-secondary font-display text-2xl font-bold overflow-hidden shadow-inner">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                sizes="112px"
                className="object-cover"
                unoptimized={
                  !avatarUrl.startsWith(
                    "https://afxgijkdaaidklzhwell.supabase.co"
                  )
                }
              />
            ) : (
              userInitials
            )}

            {isUploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-all cursor-pointer border-2 border-background"
            title="Change advisor profile photo"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h3 className="font-display text-lg font-bold text-foreground">
              {displayName}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-[10px] font-semibold text-secondary border border-secondary/20">
              <Shield className="h-3 w-3" />
              HAVEN Advisor
            </span>
          </div>

          <p className="text-xs text-muted">
            {initialProfile.email}
          </p>

          <p className="text-[11px] text-muted/80 pt-1">
            JPG, PNG or WebP. Maximum size 3MB. High-resolution portrait recommended for luxury client presentation.
          </p>
        </div>
      </div>

      {/* 2. Professional Credentials & Brokerage Information */}
      <div className="rounded-2xl border border-divider bg-surface p-6 sm:p-8 space-y-6">
        <div className="border-b border-divider pb-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            Advisor Professional Credentials
          </h2>
          <p className="text-xs text-muted mt-0.5">
            This information is presented to prospective clients across your residences and inquiry responses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Eleanor Vance"
            required
            leftIcon={<User className="h-4 w-4" />}
          />

          <Input
            label="Professional Title"
            value={professionalTitle}
            onChange={(e) => setProfessionalTitle(e.target.value)}
            placeholder="e.g. Senior Architectural Advisor"
            required
            leftIcon={<Briefcase className="h-4 w-4" />}
          />

          <Input
            label="Company / Brokerage"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. HAVEN Private Estates"
            required
            leftIcon={<Building2 className="h-4 w-4" />}
          />

          <Input
            label="License Number / ID"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="e.g. CA-DRE #01928472"
            leftIcon={<Award className="h-4 w-4" />}
          />

          <div className="md:col-span-2">
            <Input
              label="Direct Advisory Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 (310) 555-0192"
              leftIcon={<Phone className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Bio Textarea */}
        <div className="space-y-1.5 pt-2">
          <label
            htmlFor="agent-bio"
            className="block font-sans text-xs font-semibold text-primary"
          >
            Professional Bio & Expertise
          </label>
          <div className="relative">
            <textarea
              id="agent-bio"
              rows={4}
              maxLength={1000}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your architectural focus, prime territories, and background representing high-value acquisitions..."
              className="w-full rounded-lg border border-divider bg-surface px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted/70 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-y"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-muted">
            <span>Highlighted on your residence dossiers and advisor communications.</span>
            <span>{bio.length}/1000 characters</span>
          </div>
        </div>
      </div>

      {/* 3. Form Submission & Public Preview Link */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Link
          href="/agents"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Browse Public Advisor Directory</span>
        </Link>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="submit"
            disabled={isSaving}
            size="md"
            className="w-full sm:w-auto min-w-[160px]"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Changes...</span>
              </span>
            ) : (
              "Save Advisor Profile"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
