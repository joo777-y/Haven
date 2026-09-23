"use client";

import { useState, useTransition } from "react";
import { Check, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { updateInquiryStatusAction } from "@/lib/properties/actions";
import type { InquiryStatus } from "@/types/property";

interface InquiryStatusControlProps {
  inquiryId: string;
  initialStatus: InquiryStatus;
}

export default function InquiryStatusControl({
  inquiryId,
  initialStatus,
}: InquiryStatusControlProps) {
  const [status, setStatus] = useState<InquiryStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdate = (targetStatus: "contacted" | "closed") => {
    setErrorMessage(null);
    const prevStatus = status;
    setStatus(targetStatus);

    startTransition(async () => {
      const res = await updateInquiryStatusAction(inquiryId, targetStatus);
      if (!res.success) {
        setStatus(prevStatus); // rollback
        setErrorMessage(res.error || "Failed to update inquiry status.");
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-divider/60 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-muted font-medium">Status:</span>
        {status === "new" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            New Inquiry
          </span>
        )}
        {status === "contacted" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Clock className="h-3 w-3" />
            Contacted
          </span>
        )}
        {status === "closed" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Closed
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {errorMessage && (
          <span className="text-[11px] text-red-500 max-w-[200px] truncate" title={errorMessage}>
            {errorMessage}
          </span>
        )}

        {status === "new" && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPending}
            onClick={() => handleUpdate("contacted")}
            className="text-xs gap-1.5 py-1 px-3 h-8"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            <span>Mark as Contacted</span>
          </Button>
        )}

        {status === "contacted" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => handleUpdate("closed")}
            className="text-xs gap-1.5 py-1 px-3 h-8 hover:border-emerald-500/40 hover:text-emerald-600"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            <span>Close Inquiry</span>
          </Button>
        )}

        {status === "closed" && (
          <span className="text-muted/60 text-[11px] italic">
            Inquiry archived
          </span>
        )}
      </div>
    </div>
  );
}
