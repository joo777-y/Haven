"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Loader2, AlertCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createCollectionAction } from "@/lib/collections/actions";

interface CreateCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newCollection: { id: string; name: string }) => void;
}

export default function CreateCollectionDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateCollectionDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    if (isPending) return;
    setName("");
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a collection name.");
      return;
    }

    if (trimmed.length > 60) {
      setErrorMessage("Collection name cannot exceed 60 characters.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createCollectionAction(trimmed);
        if (!res.success || !res.data) {
          setErrorMessage(res.error || "Failed to create collection.");
        } else {
          setName("");
          onSuccess?.(res.data);
          onClose();
          router.refresh();
        }
      } catch (err) {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Collection"
      description="Curate a portfolio of residences for a specific lifestyle, project, or investment plan."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="Collection Name *"
          placeholder="e.g. Coastal Escapes, Cairo Penthouses, 2027 Goals"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          disabled={isPending}
          autoFocus
          required
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isPending}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isPending || !name.trim()}
            className="gap-2 text-xs"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <FolderPlus className="h-3.5 w-3.5" />
                <span>Create Collection</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
