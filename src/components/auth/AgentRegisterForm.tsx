"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Briefcase,
  Phone,
  Mail,
  FileCheck,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { registerAgentAction } from "@/lib/auth/actions";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AgentRegisterForm() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("companyName", companyName);
      formData.append("professionalTitle", professionalTitle);
      formData.append("bio", bio);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("licenseNumber", licenseNumber);

      const res = await registerAgentAction(formData);

      if (!res.success) {
        setError(res.message || "Failed to register as an agent.");
        if (res.errors) setFieldErrors(res.errors);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      await refreshProfile();

      setTimeout(() => {
        router.push("/agent");
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
          <CheckCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-2xl font-semibold text-foreground">
            Welcome to the HAVEN Advisor Network
          </h3>
          <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
            Your agent profile has been created successfully. Redirecting you to your Agent Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Agency / Brokerage Firm"
          placeholder="e.g. Sotheby's International Realty"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          leftIcon={<Building2 className="h-4 w-4" />}
          error={fieldErrors.companyName?.[0]}
          required
        />

        <Input
          label="Professional Title"
          placeholder="e.g. Principal Architectural Broker"
          value={professionalTitle}
          onChange={(e) => setProfessionalTitle(e.target.value)}
          leftIcon={<Briefcase className="h-4 w-4" />}
          error={fieldErrors.professionalTitle?.[0]}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Professional Phone"
          type="tel"
          placeholder="+1 (555) 019-2834"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone className="h-4 w-4" />}
          error={fieldErrors.phone?.[0]}
          required
        />

        <Input
          label="Professional Inquiries Email"
          type="email"
          placeholder="advisor@brokerage.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          error={fieldErrors.email?.[0]}
          required
        />
      </div>

      <Input
        label="License / Accreditation Number"
        placeholder="e.g. DRE #01928472"
        value={licenseNumber}
        onChange={(e) => setLicenseNumber(e.target.value)}
        leftIcon={<FileCheck className="h-4 w-4" />}
        error={fieldErrors.licenseNumber?.[0]}
        required
      />

      <div className="space-y-1.5">
        <label className="block font-sans text-xs font-semibold text-primary">
          Professional Bio & Specializations
        </label>
        <textarea
          rows={4}
          className="w-full rounded-lg border border-divider bg-surface px-4 py-2.5 font-sans text-sm text-foreground placeholder:text-muted/70 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          placeholder="Describe your expertise, focus markets, landmark sales, and advisory approach (minimum 20 characters)..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
        />
        {fieldErrors.bio?.[0] && (
          <p className="text-xs text-red-500 font-medium">{fieldErrors.bio[0]}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Registering Agent Profile...</span>
          </>
        ) : (
          "Complete Agent Onboarding"
        )}
      </Button>
    </form>
  );
}
