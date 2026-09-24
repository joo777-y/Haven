"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  collectionCreateSchema,
  collectionRenameSchema,
  collectionPropertySchema,
  togglePropertyCollectionsSchema,
} from "@/lib/validations/collection";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Creates a new personal collection for the authenticated user.
 */
export async function createCollectionAction(
  name: string
): Promise<ActionResult<{ id: string; name: string }>> {
  const parsed = collectionCreateSchema.safeParse({ name });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid collection name.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required to create a collection." };
  }

  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
    })
    .select("id, name")
    .single();

  if (error || !data) {
    console.error("Error creating collection:", error);
    return {
      success: false,
      error: error?.message || "Failed to create collection. Please try again.",
    };
  }

  revalidatePath("/dashboard/collections");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: {
      id: data.id,
      name: data.name,
    },
  };
}

/**
 * Renames an existing personal collection.
 * Enforces ownership check against the authenticated user.
 */
export async function renameCollectionAction(
  collectionId: string,
  name: string
): Promise<ActionResult<{ id: string; name: string }>> {
  const parsed = collectionRenameSchema.safeParse({ id: collectionId, name });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // Verify ownership
  const { data: existing, error: existError } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existError || !existing) {
    return {
      success: false,
      error: "Collection not found or permission denied.",
    };
  }

  const { data, error } = await supabase
    .from("collections")
    .update({
      name: parsed.data.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .select("id, name")
    .single();

  if (error || !data) {
    console.error("Error renaming collection:", error);
    return {
      success: false,
      error: error?.message || "Failed to rename collection.",
    };
  }

  revalidatePath("/dashboard/collections");
  revalidatePath(`/dashboard/collections/${collectionId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    data: {
      id: data.id,
      name: data.name,
    },
  };
}

/**
 * Deletes a collection belonging to the authenticated user.
 * Database foreign keys (ON DELETE CASCADE) automatically purge membership records.
 */
export async function deleteCollectionAction(
  collectionId: string
): Promise<ActionResult> {
  if (!collectionId || !UUID_REGEX.test(collectionId)) {
    return { success: false, error: "Invalid collection identifier." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting collection:", error);
    return {
      success: false,
      error: error.message || "Failed to delete collection.",
    };
  }

  revalidatePath("/dashboard/collections");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Adds a published property to a user's collection.
 */
export async function addPropertyToCollectionAction(
  collectionId: string,
  propertyId: string
): Promise<ActionResult> {
  const parsed = collectionPropertySchema.safeParse({
    collection_id: collectionId,
    property_id: propertyId,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid collection or property identifier." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // Verify collection ownership
  const { data: collection, error: colError } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (colError || !collection) {
    return { success: false, error: "Collection not found or permission denied." };
  }

  // Verify property is published
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("status", "published")
    .maybeSingle();

  if (propError || !property) {
    return { success: false, error: "Only published properties can be added to collections." };
  }

  // Insert membership (composite primary key ignores duplicate)
  const { error: insertError } = await supabase
    .from("collection_properties")
    .upsert(
      {
        collection_id: collectionId,
        property_id: propertyId,
      },
      { onConflict: "collection_id,property_id", ignoreDuplicates: true }
    );

  if (insertError) {
    console.error("Error adding property to collection:", insertError);
    return { success: false, error: "Failed to add property to collection." };
  }

  // Touch updated_at timestamp on the collection
  await supabase
    .from("collections")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", collectionId);

  revalidatePath("/dashboard/collections");
  revalidatePath(`/dashboard/collections/${collectionId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Removes a property from a user's collection.
 */
export async function removePropertyFromCollectionAction(
  collectionId: string,
  propertyId: string
): Promise<ActionResult> {
  const parsed = collectionPropertySchema.safeParse({
    collection_id: collectionId,
    property_id: propertyId,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid collection or property identifier." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // Verify collection ownership
  const { data: collection, error: colError } = await supabase
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (colError || !collection) {
    return { success: false, error: "Collection not found or permission denied." };
  }

  const { error: deleteError } = await supabase
    .from("collection_properties")
    .delete()
    .eq("collection_id", collectionId)
    .eq("property_id", propertyId);

  if (deleteError) {
    console.error("Error removing property from collection:", deleteError);
    return { success: false, error: "Failed to remove property from collection." };
  }

  // Touch updated_at timestamp on the collection
  await supabase
    .from("collections")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", collectionId);

  revalidatePath("/dashboard/collections");
  revalidatePath(`/dashboard/collections/${collectionId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Synchronizes a property's membership across multiple collections.
 * Ideal for multi-checkbox modal dialogs.
 */
export async function togglePropertyCollectionsAction(
  propertyId: string,
  targetCollectionIds: string[]
): Promise<ActionResult> {
  const parsed = togglePropertyCollectionsSchema.safeParse({
    property_id: propertyId,
    collection_ids: targetCollectionIds,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid input parameters." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // Verify property is published
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("status", "published")
    .maybeSingle();

  if (propError || !property) {
    return { success: false, error: "Property not available." };
  }

  // Fetch all user collections to prevent setting collections belonging to other users
  const { data: userCollections, error: colError } = await supabase
    .from("collections")
    .select("id")
    .eq("user_id", user.id);

  if (colError || !userCollections) {
    return { success: false, error: "Failed to verify user collections." };
  }

  const userCollectionIdSet = new Set(userCollections.map((c) => c.id));
  const validTargetIds = targetCollectionIds.filter((id) =>
    userCollectionIdSet.has(id)
  );

  // Fetch current memberships for this property among user's collections
  const { data: currentMemberships, error: memberError } = await supabase
    .from("collection_properties")
    .select("collection_id")
    .eq("property_id", propertyId)
    .in("collection_id", Array.from(userCollectionIdSet));

  if (memberError) {
    return { success: false, error: "Failed to read current collection memberships." };
  }

  const currentCollectionIds = new Set(
    (currentMemberships || []).map((m) => m.collection_id)
  );

  // Determine collections to add and collections to remove
  const toAdd = validTargetIds.filter((id) => !currentCollectionIds.has(id));
  const toRemove = Array.from(currentCollectionIds).filter(
    (id) => !validTargetIds.includes(id)
  );

  // Execute inserts
  if (toAdd.length > 0) {
    const insertRows = toAdd.map((cId) => ({
      collection_id: cId,
      property_id: propertyId,
    }));
    await supabase.from("collection_properties").insert(insertRows);
  }

  // Execute deletes
  if (toRemove.length > 0) {
    await supabase
      .from("collection_properties")
      .delete()
      .eq("property_id", propertyId)
      .in("collection_id", toRemove);
  }

  // Touch affected collections
  const affectedIds = [...toAdd, ...toRemove];
  if (affectedIds.length > 0) {
    await supabase
      .from("collections")
      .update({ updated_at: new Date().toISOString() })
      .in("id", affectedIds);
  }

  revalidatePath("/dashboard/collections");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Fetches user collections and checks whether each collection contains the specified property.
 * Ideal for populating the SaveToCollectionModal.
 */
export async function getUserCollectionsForModalAction(
  propertyId: string
): Promise<
  ActionResult<Array<{ id: string; name: string; hasProperty: boolean }>>
> {
  if (!propertyId || !UUID_REGEX.test(propertyId)) {
    return { success: false, error: "Invalid property identifier." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  const { data: collections, error } = await supabase
    .from("collections")
    .select(`
      id,
      name,
      updated_at,
      collection_properties (
        property_id
      )
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error || !collections) {
    return { success: false, error: "Failed to load collections." };
  }

  const result = collections.map((col) => ({
    id: col.id,
    name: col.name,
    hasProperty: (col.collection_properties || []).some(
      (cp) => cp.property_id === propertyId
    ),
  }));

  return { success: true, data: result };
}
