"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Maximize2,
  Bell,
  CheckCircle,
  Save,
  Globe,
  Sliders,
  Shield,
} from "lucide-react";
import Button from "@/components/ui/Button";

export interface UserPreferences {
  currency: "USD" | "EGP" | "EUR" | "GBP";
  measurementUnit: "sqm" | "sqft";
  emailInquiryUpdates: boolean;
  emailPriceAlerts: boolean;
  emailDigest: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  currency: "USD",
  measurementUnit: "sqm",
  emailInquiryUpdates: true,
  emailPriceAlerts: true,
  emailDigest: false,
};

const STORAGE_KEY = "haven_user_preferences";

export default function SettingsForm() {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences((prev) => ({
          ...prev,
          ...JSON.parse(stored),
        }));
      }
    } catch {
      // Fallback to defaults
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      // Dispatch custom event for listeners
      window.dispatchEvent(
        new CustomEvent("haven_preferences_changed", { detail: preferences })
      );
      setSuccessMessage("Preferences saved successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch {
      // Ignore
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="rounded-2xl border border-divider bg-surface p-8 animate-pulse space-y-6">
        <div className="h-6 w-48 bg-divider/40 rounded-md" />
        <div className="h-24 bg-divider/20 rounded-xl" />
        <div className="h-24 bg-divider/20 rounded-xl" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {successMessage && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. Currency Preferences */}
      <div className="rounded-2xl border border-divider bg-surface p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-divider/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              Display Currency
            </h3>
            <p className="text-xs text-muted">
              Select your preferred currency for browsing property prices and valuations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              { code: "USD", symbol: "$", label: "US Dollar" },
              { code: "EGP", symbol: "E£", label: "Egyptian Pound" },
              { code: "EUR", symbol: "€", label: "Euro" },
              { code: "GBP", symbol: "£", label: "British Pound" },
            ] as const
          ).map((curr) => {
            const isSelected = preferences.currency === curr.code;
            return (
              <button
                type="button"
                key={curr.code}
                onClick={() =>
                  setPreferences((prev) => ({ ...prev, currency: curr.code }))
                }
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? "border-secondary bg-secondary/5 text-foreground ring-1 ring-secondary/40 shadow-xs"
                    : "border-divider bg-background/50 text-muted hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span className="font-display text-lg font-bold text-primary">
                  {curr.symbol}
                </span>
                <span className="font-sans text-xs font-semibold mt-1">
                  {curr.code}
                </span>
                <span className="text-[10px] text-muted">{curr.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Measurement Unit */}
      <div className="rounded-2xl border border-divider bg-surface p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-divider/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <Maximize2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              Area & Dimensions
            </h3>
            <p className="text-xs text-muted">
              Choose the unit used to represent interior living spaces and lot grounds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              setPreferences((prev) => ({ ...prev, measurementUnit: "sqm" }))
            }
            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
              preferences.measurementUnit === "sqm"
                ? "border-secondary bg-secondary/5 text-foreground ring-1 ring-secondary/40 shadow-xs"
                : "border-divider bg-background/50 text-muted hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <div>
              <p className="font-semibold text-xs text-foreground">
                Square Meters (m² / sqm)
              </p>
              <p className="text-[11px] text-muted mt-0.5">
                Standard metric measurement used in Egypt and Continental Europe.
              </p>
            </div>
            <div
              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                preferences.measurementUnit === "sqm"
                  ? "border-secondary bg-secondary"
                  : "border-divider"
              }`}
            >
              {preferences.measurementUnit === "sqm" && (
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setPreferences((prev) => ({ ...prev, measurementUnit: "sqft" }))
            }
            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
              preferences.measurementUnit === "sqft"
                ? "border-secondary bg-secondary/5 text-foreground ring-1 ring-secondary/40 shadow-xs"
                : "border-divider bg-background/50 text-muted hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <div>
              <p className="font-semibold text-xs text-foreground">
                Square Feet (ft² / sqft)
              </p>
              <p className="text-[11px] text-muted mt-0.5">
                Imperial measurement common in the US, UK, and international luxury markets.
              </p>
            </div>
            <div
              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                preferences.measurementUnit === "sqft"
                  ? "border-secondary bg-secondary"
                  : "border-divider"
              }`}
            >
              {preferences.measurementUnit === "sqft" && (
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* 3. Notification Preferences */}
      <div className="rounded-2xl border border-divider bg-surface p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-divider/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              Communication & Notifications
            </h3>
            <p className="text-xs text-muted">
              Control which email alerts and updates you receive from HAVEN advisors.
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          <label className="flex items-start gap-3 p-3 rounded-xl border border-divider bg-background/40 hover:border-primary/30 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={preferences.emailInquiryUpdates}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  emailInquiryUpdates: e.target.checked,
                }))
              }
              className="mt-0.5 h-4 w-4 rounded border-divider text-secondary focus:ring-secondary/30"
            />
            <div className="space-y-0.5">
              <span className="font-medium text-xs text-foreground block">
                Inquiry & Tour Scheduling Confirmations
              </span>
              <span className="text-[11px] text-muted block leading-relaxed">
                Receive immediate email confirmations when an advisor responds to your residence questions or arranges a viewing.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-divider bg-background/40 hover:border-primary/30 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={preferences.emailPriceAlerts}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  emailPriceAlerts: e.target.checked,
                }))
              }
              className="mt-0.5 h-4 w-4 rounded border-divider text-secondary focus:ring-secondary/30"
            />
            <div className="space-y-0.5">
              <span className="font-medium text-xs text-foreground block">
                Collection & Saved Property Price Adjustments
              </span>
              <span className="text-[11px] text-muted block leading-relaxed">
                Get notified if an estate in one of your curated collections or saved properties adjusts its offering price or status.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-divider bg-background/40 hover:border-primary/30 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={preferences.emailDigest}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  emailDigest: e.target.checked,
                }))
              }
              className="mt-0.5 h-4 w-4 rounded border-divider text-secondary focus:ring-secondary/30"
            />
            <div className="space-y-0.5">
              <span className="font-medium text-xs text-foreground block">
                Monthly HAVEN Architectural Digest
              </span>
              <span className="text-[11px] text-muted block leading-relaxed">
                A curated selection of newly discovered private residences, coastal estates, and exclusive architectural features.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 4. Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSaving}
          className="gap-2 text-xs shadow-xs"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
        </Button>
      </div>
    </form>
  );
}
