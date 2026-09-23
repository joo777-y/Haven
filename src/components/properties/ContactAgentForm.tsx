"use client";

import { useState, useTransition } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle, Send, ShieldAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { createInquiryAction } from "@/lib/properties/actions";

interface ContactAgentFormProps {
  propertyId: string;
  propertyTitle: string;
  agentName?: string | null;
}

export default function ContactAgentForm({
  propertyId,
  propertyTitle,
  agentName,
}: ContactAgentFormProps) {
  const { user, isAgent } = useAuth();
  const [message, setMessage] = useState(
    "Hello, I am interested in this architectural residence and would like to schedule a private viewing or request additional documentation."
  );
  const [isPending, startTransition] = useTransition();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. If anonymous, prompt login with existing AuthModal
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // 2. Prevent agent accounts from submitting client inquiries
    if (isAgent) {
      setErrorMessage(
        "Advisor accounts cannot submit buyer inquiries. Please switch to a prospective client account."
      );
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage("Please enter an inquiry message with at least 5 characters.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createInquiryAction(propertyId, message);
        if (res.success) {
          setIsSuccess(true);
          setMessage("");
        } else {
          setErrorMessage(res.error || "Failed to submit inquiry. Please try again.");
        }
      } catch (err) {
        setErrorMessage("An unexpected error occurred while sending your inquiry.");
      }
    });
  };

  return (
    <div className="pt-4 border-t border-divider/60 space-y-4">
      <div className="space-y-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Private Inquiry
        </h4>
        <p className="text-xs text-muted">
          {agentName
            ? `Connect directly with ${agentName} regarding this residence.`
            : "Inquire with the listing desk regarding availability and tours."}
        </p>
      </div>

      {isSuccess ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Inquiry Successfully Dispatched
              </h5>
              <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90 leading-relaxed">
                Your message has been sent to the listing advisor. You can monitor
                the inquiry status anytime in your account workspace.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSuccess(false)}
            className="w-full text-xs"
          >
            Send Another Inquiry
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isAgent && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                You are logged in as an Advisor. Buyer inquiries are restricted to client accounts.
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="inquiry-message" className="sr-only">
              Inquiry Message
            </label>
            <textarea
              id="inquiry-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isPending || isAgent}
              placeholder="Write your private message or questions here..."
              className="w-full rounded-xl border border-divider bg-background p-3 text-xs text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed resize-none transition-colors"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isPending || isAgent}
            className="w-full flex items-center justify-center gap-2 text-xs"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Transmitting Inquiry...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Submit Inquiry</span>
              </>
            )}
          </Button>

          {!user && (
            <p className="text-center text-[11px] text-muted/70">
              You will be prompted to sign in before your inquiry is sent.
            </p>
          )}
        </form>
      )}

      {/* Auth Modal for Unauthenticated Users */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Sign in to Contact Advisor"
        description={`Sign in or create a HAVEN account to send your inquiry regarding ${propertyTitle}.`}
      />
    </div>
  );
}
