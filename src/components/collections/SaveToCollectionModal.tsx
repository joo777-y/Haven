"use client";

import { useState, useEffect, useTransition } from "react";
import {
  FolderHeart,
  Plus,
  Check,
  Loader2,
  AlertCircle,
  FolderPlus,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getUserCollectionsForModalAction,
  createCollectionAction,
  togglePropertyCollectionsAction,
} from "@/lib/collections/actions";

interface SaveToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
  onSuccess?: () => void;
}

interface ModalCollectionItem {
  id: string;
  name: string;
  hasProperty: boolean;
}

export default function SaveToCollectionModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
  onSuccess,
}: SaveToCollectionModalProps) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<ModalCollectionItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Inline new collection creation state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Saving state
  const [isSaving, startTransition] = useTransition();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load collections when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    getUserCollectionsForModalAction(propertyId)
      .then((res) => {
        if (res.success && res.data) {
          setCollections(res.data);
          const initialSelected = new Set(
            res.data.filter((c) => c.hasProperty).map((c) => c.id)
          );
          setSelectedIds(initialSelected);
        } else {
          setErrorMessage(res.error || "Failed to load collections.");
        }
      })
      .catch(() => {
        setErrorMessage("An unexpected error occurred while loading collections.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, propertyId, user]);

  const toggleCollection = (collectionId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  };

  const handleCreateNewCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCollectionName.trim();
    if (!trimmed) return;

    setIsSubmittingNew(true);
    setErrorMessage(null);

    try {
      const res = await createCollectionAction(trimmed);
      if (res.success && res.data) {
        const newCol: ModalCollectionItem = {
          id: res.data.id,
          name: res.data.name,
          hasProperty: true,
        };
        setCollections((prev) => [newCol, ...prev]);
        setSelectedIds((prev) => new Set(prev).add(newCol.id));
        setNewCollectionName("");
        setIsCreatingNew(false);
      } else {
        setErrorMessage(res.error || "Failed to create collection.");
      }
    } catch {
      setErrorMessage("Failed to create collection.");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleSave = () => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const res = await togglePropertyCollectionsAction(
          propertyId,
          Array.from(selectedIds)
        );
        if (res.success) {
          setSuccessMessage("Collection memberships updated.");
          onSuccess?.();
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setErrorMessage(res.error || "Failed to update collections.");
        }
      } catch {
        setErrorMessage("An unexpected error occurred.");
      }
    });
  };

  if (!user && isAuthModalOpen) {
    return (
      <AuthModal
        isOpen={isOpen}
        onClose={onClose}
        title="Sign in to Save to Collections"
        description="Organize luxury architectural residences into personal collections and project boards."
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save to Collection"
      description={`Add "${propertyTitle}" to one or more curated folders.`}
      size="md"
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Collections List */}
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 text-muted">
            <Loader2 className="h-6 w-6 animate-spin text-secondary" />
            <span className="text-xs">Loading collections...</span>
          </div>
        ) : collections.length === 0 && !isCreatingNew ? (
          <div className="rounded-xl border border-divider bg-surface/50 p-6 text-center space-y-3">
            <FolderHeart className="h-8 w-8 text-secondary/60 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-display text-sm font-semibold text-foreground">
                No Collections Yet
              </h4>
              <p className="text-xs text-muted max-w-xs mx-auto">
                Create your first curated portfolio to organize residences for your next acquisition or lifestyle project.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreatingNew(true)}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Collection</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            {collections.map((col) => {
              const isChecked = selectedIds.has(col.id);

              return (
                <label
                  key={col.id}
                  onClick={() => toggleCollection(col.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? "border-secondary/60 bg-secondary/5 text-foreground"
                      : "border-divider bg-surface hover:border-primary/40 text-muted"
                  }`}
                >
                  <span className="font-medium text-xs truncate max-w-[280px]">
                    {col.name}
                  </span>

                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      isChecked
                        ? "border-secondary bg-secondary text-white"
                        : "border-divider bg-background"
                    }`}
                  >
                    {isChecked && <Check className="h-3.5 w-3.5" />}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {/* Inline Create New Collection Form */}
        {isCreatingNew ? (
          <form
            onSubmit={handleCreateNewCollection}
            className="pt-2 border-t border-divider/60 space-y-2"
          >
            <div className="flex gap-2">
              <Input
                placeholder="Collection name (e.g. Coastal Villas)"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                maxLength={60}
                disabled={isSubmittingNew}
                autoFocus
                className="text-xs"
              />
              <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={isSubmittingNew || !newCollectionName.trim()}
                className="gap-1.5 text-xs shrink-0"
              >
                {isSubmittingNew ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FolderPlus className="h-3.5 w-3.5" />
                )}
                <span>Add</span>
              </Button>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(false);
                setNewCollectionName("");
              }}
              className="text-[11px] text-muted hover:text-foreground"
            >
              Cancel
            </button>
          </form>
        ) : (
          collections.length > 0 && (
            <div className="pt-2 border-t border-divider/60">
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create new collection</span>
              </button>
            </div>
          )
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-divider">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
            className="text-xs"
          >
            Close
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSaving || isLoading}
            onClick={handleSave}
            className="gap-2 text-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
