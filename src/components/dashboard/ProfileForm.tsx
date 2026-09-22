"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { User, Phone, FileText, Camera, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { updateProfileAction } from "@/lib/auth/actions";
import { uploadAvatar } from "@/lib/supabase/storage";

export default function ProfileForm() {
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate size (< 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setError("Avatar image must be smaller than 3MB.");
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);

    try {
      const newUrl = await uploadAvatar(file, user.id);
      setAvatarUrl(newUrl);
      await refreshProfile();
      setSuccess("Profile photo updated successfully!");
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
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("phone", phone);
      formData.append("bio", bio);

      const res = await updateProfileAction(formData);

      if (!res.success) {
        setError(res.message || "Failed to update profile.");
      } else {
        setSuccess("Profile details saved successfully.");
        await refreshProfile();
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = fullName || user?.email?.split("@")[0] || "User";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{success}</span>
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex items-center gap-6 pb-6 border-b border-divider">
        <div className="relative group">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-xl font-semibold text-white overflow-hidden shadow-inner">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                className="object-cover"
              />
            ) : (
              userInitials
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 rounded-full bg-secondary text-white p-2 shadow-md hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            title="Change Avatar"
          >
            {isUploadingAvatar ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-base text-foreground">
            Profile Portrait
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            Upload a professional high-resolution photo (JPG, PNG, WebP up to 3MB).
          </p>
        </div>
      </div>

      {/* Profile Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          placeholder="Alexander Wright"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User className="h-4 w-4" />}
          required
        />

        <Input
          label="Contact Phone"
          type="tel"
          placeholder="+1 (555) 019-2834"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone className="h-4 w-4" />}
        />
      </div>

      <div className="space-y-1.5">
        <label className="block font-sans text-xs font-semibold text-primary">
          Personal Bio
        </label>
        <textarea
          rows={4}
          className="w-full rounded-lg border border-divider bg-surface px-4 py-2.5 font-sans text-sm text-foreground placeholder:text-muted/70 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          placeholder="Share your architectural interests, preferred cities, or personal bio..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isSaving}
        className="w-full sm:w-auto"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving changes...</span>
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
