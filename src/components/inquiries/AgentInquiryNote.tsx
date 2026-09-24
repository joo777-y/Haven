"use client";

import { useState, useTransition } from "react";
import { Lock, Edit3, Trash2, Check, X, Loader2, StickyNote } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  saveInquiryNoteAction,
  deleteInquiryNoteAction,
} from "@/lib/properties/actions";

interface AgentInquiryNoteProps {
  inquiryId: string;
  initialNote?: string | null;
}

export default function AgentInquiryNote({
  inquiryId,
  initialNote,
}: AgentInquiryNoteProps) {
  const [note, setNote] = useState<string | null>(initialNote || null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(initialNote || "");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const handleOpenEdit = () => {
    setFeedback(null);
    setDraftText(note || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFeedback(null);
    setDraftText(note || "");
    setIsEditing(false);
  };

  const handleSave = () => {
    setFeedback(null);
    if (!draftText.trim()) {
      handleDelete();
      return;
    }

    startTransition(async () => {
      const res = await saveInquiryNoteAction(inquiryId, draftText.trim());
      if (res.success) {
        setNote(draftText.trim());
        setIsEditing(false);
        setFeedback({ type: "success", message: "Private note saved." });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to save note.",
        });
      }
    });
  };

  const handleDelete = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await deleteInquiryNoteAction(inquiryId);
      if (res.success) {
        setNote(null);
        setDraftText("");
        setIsEditing(false);
        setFeedback({ type: "success", message: "Private note deleted." });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to delete note.",
        });
      }
    });
  };

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-2.5 transition-all text-xs">
      {/* Header with private advisor label */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
          <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Private Advisor Note
          </span>
          <span className="text-[10px] text-muted hidden sm:inline">
            (Confidential • Never shared with buyer)
          </span>
        </div>

        {/* Action buttons if not currently editing */}
        {!isEditing && (
          <div className="flex items-center gap-1.5">
            {note ? (
              <>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/80 hover:text-foreground hover:underline transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit Note</span>
                </button>
                <span className="text-muted/40">•</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500/80 hover:text-red-500 hover:underline transition-colors cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleOpenEdit}
                disabled={isPending}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:underline transition-colors cursor-pointer"
              >
                <StickyNote className="h-3 w-3" />
                <span>+ Add Note</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`text-[11px] px-2 py-1 rounded-md font-medium ${
            feedback.type === "error"
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Content view / edit mode */}
      {isEditing ? (
        <div className="space-y-2 pt-1">
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            disabled={isPending}
            placeholder="Record private buyer profile insights, financing details, follow-up reminders, or confidential advisory notes..."
            rows={3}
            maxLength={2000}
            className="w-full rounded-lg border border-divider bg-background/80 p-2.5 text-xs text-foreground placeholder:text-muted focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 resize-y"
          />

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted">
              {draftText.length}/2000 characters
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
                className="h-7 text-xs px-2.5"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isPending}
                className="h-7 text-xs px-3 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Check className="h-3 w-3 mr-1" />
                )}
                Save Note
              </Button>
            </div>
          </div>
        </div>
      ) : note ? (
        <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed bg-background/50 rounded-lg p-2.5 border border-amber-500/10">
          {note}
        </p>
      ) : (
        <p className="text-[11px] text-muted italic">
          No private advisor notes yet. Click "+ Add Note" to record private buyer qualifications or notes.
        </p>
      )}
    </div>
  );
}
