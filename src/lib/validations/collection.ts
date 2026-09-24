import { z } from "zod";

/**
 * Validation schema for creating a new user collection.
 */
export const collectionCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Collection title cannot be empty")
    .max(60, "Collection title cannot exceed 60 characters"),
});

export type CollectionCreateInput = z.infer<typeof collectionCreateSchema>;

/**
 * Validation schema for renaming an existing collection.
 */
export const collectionRenameSchema = z.object({
  id: z.string().uuid("Invalid collection identifier"),
  name: z
    .string()
    .trim()
    .min(1, "Collection title cannot be empty")
    .max(60, "Collection title cannot exceed 60 characters"),
});

export type CollectionRenameInput = z.infer<typeof collectionRenameSchema>;

/**
 * Validation schema for adding or removing a property to/from a collection.
 */
export const collectionPropertySchema = z.object({
  collection_id: z.string().uuid("Invalid collection identifier"),
  property_id: z.string().uuid("Invalid property identifier"),
});

export type CollectionPropertyInput = z.infer<typeof collectionPropertySchema>;

/**
 * Validation schema for toggling multi-collection assignment from modal dialogs.
 */
export const togglePropertyCollectionsSchema = z.object({
  property_id: z.string().uuid("Invalid property identifier"),
  collection_ids: z.array(z.string().uuid("Invalid collection identifier")),
});

export type TogglePropertyCollectionsInput = z.infer<
  typeof togglePropertyCollectionsSchema
>;
