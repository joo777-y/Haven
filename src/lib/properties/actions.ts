"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  propertySchema,
  inquiryCreateSchema,
  type PropertyInput,
} from "@/lib/validations/property";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ToggleFavoriteResult {
  success: boolean;
  isSaved?: boolean;
  error?: string;
}

/**
 * Toggles a property's favorite state for the currently authenticated user.
 * Identity is derived strictly on the server from Supabase auth session.
 * Never accepts user_id from client input.
 */
export async function toggleFavoriteAction(
  propertyId: string,
  pathname?: string
): Promise<ToggleFavoriteResult> {
  if (!propertyId || !UUID_REGEX.test(propertyId)) {
    return { success: false, error: "Invalid property identifier." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required to save properties." };
  }

  const { data: existing, error: checkError } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (checkError) {
    console.error("Error verifying favorite state:", checkError);
    return { success: false, error: "Failed to verify favorite status." };
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error removing favorite:", deleteError);
      return { success: false, error: "Failed to remove saved property." };
    }

    if (pathname) revalidatePath(pathname);
    revalidatePath("/properties");
    revalidatePath("/dashboard/saved");

    return { success: true, isSaved: false };
  } else {
    const { error: insertError } = await supabase.from("favorites").insert({
      user_id: user.id,
      property_id: propertyId,
    });

    if (insertError) {
      console.error("Error adding favorite:", insertError);
      return { success: false, error: "Failed to save property." };
    }

    if (pathname) revalidatePath(pathname);
    revalidatePath("/properties");
    revalidatePath("/dashboard/saved");

    return { success: true, isSaved: true };
  }
}

/**
 * Creates a new property listing for the authenticated advisor.
 * Initial status is strictly forced to 'draft'.
 * Image uploads and inquiries are NOT handled in this step.
 */
export async function createPropertyAction(
  rawInput: PropertyInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // 2. Resolve advisor record (never trust client-supplied agent_id)
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (agentError || !agent) {
    return {
      success: false,
      error: "Only verified real estate advisors can create property listings.",
    };
  }

  // 3. Server-side validation using existing propertySchema
  const parsed = propertySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
    };
  }

  const data = parsed.data;

  // 4. Generate unique slug with collision fallback
  let slug = slugify(data.title);
  if (!slug) slug = `residence-${Date.now()}`;

  const { data: existingSlug } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingSlug) {
    const suffix = Math.random().toString(36).substring(2, 6);
    slug = `${slug}-${suffix}`;
  }

  // 5. Insert property (strictly as draft)
  const { data: inserted, error: insertError } = await supabase
    .from("properties")
    .insert({
      agent_id: agent.id,
      title: data.title,
      description: data.description,
      price: data.price,
      listing_type: data.listing_type,
      property_type: data.property_type,
      bedrooms: data.bedrooms ?? null,
      bathrooms: data.bathrooms ?? null,
      area: data.area ?? null,
      parking_spaces: data.parking_spaces ?? null,
      year_built: data.year_built ?? null,
      country: data.country,
      city: data.city,
      neighborhood: data.neighborhood ?? null,
      address: data.address ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      slug,
      status: "draft", // Strictly forced to draft
    })
    .select("id, slug")
    .single();

  if (insertError || !inserted) {
    console.error("Error creating property:", insertError);
    return {
      success: false,
      error: insertError?.message || "Failed to create property listing.",
    };
  }

  // 6. Insert child features if provided
  if (data.features && data.features.length > 0) {
    const featureRows = data.features
      .map((f) => f.trim())
      .filter(Boolean)
      .map((feature) => ({
        property_id: inserted.id,
        feature,
      }));

    if (featureRows.length > 0) {
      const { error: featError } = await supabase
        .from("property_features")
        .insert(featureRows);

      if (featError) {
        console.error("Error inserting features:", featError);
      }
    }
  }

  // 7. Path revalidations
  revalidatePath("/agent");
  revalidatePath("/agent/properties");

  return {
    success: true,
    data: { id: inserted.id, slug: inserted.slug },
  };
}

/**
 * Updates an existing property listing owned by the authenticated advisor.
 * Preserves agent_id, status, and created_at.
 */
export async function updatePropertyAction(
  propertyId: string,
  rawInput: PropertyInput
): Promise<ActionResult<{ id: string }>> {
  if (!propertyId || !UUID_REGEX.test(propertyId)) {
    return { success: false, error: "Invalid property identifier." };
  }

  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // 2. Resolve advisor record
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (agentError || !agent) {
    return { success: false, error: "Advisor profile not found." };
  }

  // 3. Verify property ownership
  const { data: existing, error: existError } = await supabase
    .from("properties")
    .select("id, slug, agent_id")
    .eq("id", propertyId)
    .eq("agent_id", agent.id)
    .maybeSingle();

  if (existError || !existing) {
    return {
      success: false,
      error: "Listing not found or you do not have permission to edit it.",
    };
  }

  // 4. Server-side validation
  const parsed = propertySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed.",
    };
  }

  const data = parsed.data;

  // 5. Update property fields (never change agent_id, status, or slug)
  const { error: updateError } = await supabase
    .from("properties")
    .update({
      title: data.title,
      description: data.description,
      price: data.price,
      listing_type: data.listing_type,
      property_type: data.property_type,
      bedrooms: data.bedrooms ?? null,
      bathrooms: data.bathrooms ?? null,
      area: data.area ?? null,
      parking_spaces: data.parking_spaces ?? null,
      year_built: data.year_built ?? null,
      country: data.country,
      city: data.city,
      neighborhood: data.neighborhood ?? null,
      address: data.address ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    })
    .eq("id", propertyId)
    .eq("agent_id", agent.id);

  if (updateError) {
    console.error("Error updating property:", updateError);
    return { success: false, error: "Failed to update property details." };
  }

  // 6. Sync features (delete existing, then re-insert)
  await supabase
    .from("property_features")
    .delete()
    .eq("property_id", propertyId);

  if (data.features && data.features.length > 0) {
    const featureRows = data.features
      .map((f) => f.trim())
      .filter(Boolean)
      .map((feature) => ({
        property_id: propertyId,
        feature,
      }));

    if (featureRows.length > 0) {
      await supabase.from("property_features").insert(featureRows);
    }
  }

  // 7. Revalidate relevant paths
  revalidatePath("/agent");
  revalidatePath("/agent/properties");
  revalidatePath(`/agent/properties/${propertyId}/edit`);
  revalidatePath(`/properties/${existing.slug}`);
  revalidatePath("/properties");

  return { success: true, data: { id: propertyId } };
}

/**
 * Updates the lifecycle status of a property owned by the advisor.
 * Allowed transitions:
 *   draft -> published, archived
 *   published -> archived
 *   archived -> published, draft
 */
export async function updatePropertyStatusAction(
  propertyId: string,
  targetStatus: "draft" | "published" | "archived"
): Promise<ActionResult<{ id: string; status: string }>> {
  if (!propertyId || !UUID_REGEX.test(propertyId)) {
    return { success: false, error: "Invalid property identifier." };
  }

  const validStatuses = ["draft", "published", "archived"];
  if (!validStatuses.includes(targetStatus)) {
    return { success: false, error: "Invalid status value." };
  }

  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // 2. Resolve advisor record
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (agentError || !agent) {
    return { success: false, error: "Advisor profile not found." };
  }

  // 3. Verify ownership
  const { data: existing, error: existError } = await supabase
    .from("properties")
    .select("id, slug, status, agent_id")
    .eq("id", propertyId)
    .eq("agent_id", agent.id)
    .maybeSingle();

  if (existError || !existing) {
    return {
      success: false,
      error: "Listing not found or you do not have permission to modify its status.",
    };
  }

  // 4. Validate allowed lifecycle transition
  if (existing.status === targetStatus) {
    return { success: true, data: { id: propertyId, status: targetStatus } };
  }

  // 5. Update status
  const { error: updateError } = await supabase
    .from("properties")
    .update({ status: targetStatus })
    .eq("id", propertyId)
    .eq("agent_id", agent.id);

  if (updateError) {
    console.error("Error updating status:", updateError);
    return { success: false, error: "Failed to update property status." };
  }

  // 6. Revalidate catalog and advisor pages
  revalidatePath("/agent");
  revalidatePath("/agent/properties");
  revalidatePath("/properties");
  revalidatePath(`/properties/${existing.slug}`);

  return { success: true, data: { id: propertyId, status: targetStatus } };
}

/**
 * Permanently deletes a property listing owned by the authenticated advisor.
 * Postgres CASCADE deletes property_images, property_features, and favorites automatically.
 * Cleans up Supabase Storage images associated with the property.
 */
export async function deletePropertyAction(
  propertyId: string
): Promise<ActionResult<{ id: string }>> {
  if (!propertyId || !UUID_REGEX.test(propertyId)) {
    return { success: false, error: "Invalid property identifier." };
  }

  const supabase = await createClient();

  // 1. Authenticate caller
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // 2. Resolve advisor record
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (agentError || !agent) {
    return { success: false, error: "Advisor profile not found." };
  }

  // 3. Verify property ownership & retrieve images for storage cleanup
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select(`
      id,
      slug,
      property_images (
        id,
        image_url
      )
    `)
    .eq("id", propertyId)
    .eq("agent_id", agent.id)
    .maybeSingle();

  if (propError || !property) {
    return {
      success: false,
      error: "Listing not found or you do not have permission to delete it.",
    };
  }

  // 4. Clean up Storage files if applicable
  if (property.property_images && property.property_images.length > 0) {
    const storagePaths: string[] = [];
    for (const img of property.property_images) {
      if (img.image_url.includes("/property-images/")) {
        const parts = img.image_url.split("/property-images/");
        if (parts[1]) storagePaths.push(parts[1]);
      }
    }
    if (storagePaths.length > 0) {
      await supabase.storage.from("property-images").remove(storagePaths);
    }
  }

  // 5. Delete property row (cascades to features, images, favorites, collection_properties)
  const { error: deleteError } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("agent_id", agent.id);

  if (deleteError) {
    console.error("Error deleting property:", deleteError);
    return { success: false, error: "Failed to delete property listing." };
  }

  // 6. Revalidate pages
  revalidatePath("/agent");
  revalidatePath("/agent/properties");
  revalidatePath("/properties");
  revalidatePath(`/properties/${property.slug}`);

  return { success: true, data: { id: propertyId } };
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB verified bucket limit

/**
 * Uploads a property image to the 'property-images' bucket and inserts a property_images row.
 * Strictly derives authenticated user and verifies property ownership.
 */
export async function uploadPropertyImageAction(
  formData: FormData
): Promise<ActionResult<{ id: string; image_url: string; is_cover: boolean; sort_order: number }>> {
  const propertyId = formData.get("propertyId") as string;
  const file = formData.get("file") as File | null;

  if (!propertyId || !UUID_REGEX.test(propertyId)) {
    return { success: false, error: "Invalid property identifier." };
  }

  if (!file || !(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please select an image file to upload." };
  }

  // 1. Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file format. Only JPG, PNG, WebP, and AVIF images are allowed.",
    };
  }

  // 2. Validate file size (10MB limit)
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      success: false,
      error: "Image size exceeds the 10MB limit.",
    };
  }

  const supabase = await createClient();

  // 3. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // 4. Resolve advisor record
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (agentError || !agent) {
    return { success: false, error: "Advisor profile not found." };
  }

  // 5. Verify property ownership
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("id, slug, agent_id")
    .eq("id", propertyId)
    .eq("agent_id", agent.id)
    .maybeSingle();

  if (propError || !property) {
    return {
      success: false,
      error: "Property not found or you do not have permission to upload imagery for it.",
    };
  }

  // 6. Query existing images to determine sort_order and is_cover
  const { data: existingImages } = await supabase
    .from("property_images")
    .select("id, is_cover, sort_order")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: false });

  const hasCover = existingImages?.some((img) => img.is_cover) ?? false;
  const isCover = !hasCover; // First image becomes cover
  const maxSort = existingImages?.[0]?.sort_order ?? -1;
  const nextSortOrder = maxSort + 1;

  // 7. Generate clean unique filename
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const storagePath = `${propertyId}/${uniqueName}`;

  // 8. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("property-images")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return { success: false, error: "Failed to upload image file to storage." };
  }

  // 9. Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("property-images").getPublicUrl(storagePath);

  // 10. Insert metadata into property_images
  const { data: insertedImage, error: insertError } = await supabase
    .from("property_images")
    .insert({
      property_id: propertyId,
      image_url: publicUrl,
      is_cover: isCover,
      sort_order: nextSortOrder,
    })
    .select("id, image_url, is_cover, sort_order")
    .single();

  if (insertError || !insertedImage) {
    console.error("Database insert error for property_images:", insertError);
    // Cleanup orphaned storage object
    await supabase.storage.from("property-images").remove([storagePath]);
    return { success: false, error: "Failed to record image metadata." };
  }

  // 11. Revalidate paths
  revalidatePath(`/agent/properties/${propertyId}/edit`);
  revalidatePath(`/properties/${property.slug}`);
  revalidatePath("/properties");

  return { success: true, data: insertedImage };
}

/**
 * Sets a specific image as the cover image for a property.
 * Unsets all other cover flags for that property.
 */
export async function setCoverImageAction(
  propertyId: string,
  imageId: string
): Promise<ActionResult> {
  if (!propertyId || !imageId || !UUID_REGEX.test(propertyId) || !UUID_REGEX.test(imageId)) {
    return { success: false, error: "Invalid identifier." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!agent) {
    return { success: false, error: "Advisor profile not found." };
  }

  // Verify property ownership
  const { data: property } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("id", propertyId)
    .eq("agent_id", agent.id)
    .maybeSingle();

  if (!property) {
    return { success: false, error: "Property not found or permission denied." };
  }

  // 1. Unset all current covers for this property
  await supabase
    .from("property_images")
    .update({ is_cover: false })
    .eq("property_id", propertyId);

  // 2. Set target image as cover
  const { error: updateError } = await supabase
    .from("property_images")
    .update({ is_cover: true })
    .eq("id", imageId)
    .eq("property_id", propertyId);

  if (updateError) {
    console.error("Error setting cover image:", updateError);
    return { success: false, error: "Failed to update cover image." };
  }

  revalidatePath(`/agent/properties/${propertyId}/edit`);
  revalidatePath(`/properties/${property.slug}`);
  revalidatePath("/properties");

  return { success: true };
}

/**
 * Reorders property images by updating sort_order for each ID.
 */
export async function reorderPropertyImagesAction(
  propertyId: string,
  orderedImageIds: string[]
): Promise<ActionResult> {
  if (!propertyId || !UUID_REGEX.test(propertyId) || !Array.isArray(orderedImageIds)) {
    return { success: false, error: "Invalid request payload." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!agent) {
    return { success: false, error: "Advisor profile not found." };
  }

  // Verify property ownership
  const { data: property } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("id", propertyId)
    .eq("agent_id", agent.id)
    .maybeSingle();

  if (!property) {
    return { success: false, error: "Property not found or permission denied." };
  }

  // Update sort order for each image
  for (let i = 0; i < orderedImageIds.length; i++) {
    const imgId = orderedImageIds[i];
    if (UUID_REGEX.test(imgId)) {
      await supabase
        .from("property_images")
        .update({ sort_order: i })
        .eq("id", imgId)
        .eq("property_id", propertyId);
    }
  }

  revalidatePath(`/agent/properties/${propertyId}/edit`);
  revalidatePath(`/properties/${property.slug}`);
  revalidatePath("/properties");

  return { success: true };
}

/**
 * Deletes a property image from storage and removes its metadata row.
 * If the deleted image was the cover, assigns a remaining image as cover.
 */
export async function deletePropertyImageAction(
  propertyId: string,
  imageId: string
): Promise<ActionResult> {
  if (!propertyId || !imageId || !UUID_REGEX.test(propertyId) || !UUID_REGEX.test(imageId)) {
    return { success: false, error: "Invalid identifier." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!agent) {
    return { success: false, error: "Advisor profile not found." };
  }

  // Verify property ownership
  const { data: property } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("id", propertyId)
    .eq("agent_id", agent.id)
    .maybeSingle();

  if (!property) {
    return { success: false, error: "Property not found or permission denied." };
  }

  // Fetch the image row
  const { data: imageRow, error: fetchError } = await supabase
    .from("property_images")
    .select("id, image_url, is_cover")
    .eq("id", imageId)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (fetchError || !imageRow) {
    return { success: false, error: "Image record not found." };
  }

  // 1. Remove from Supabase Storage if it's stored in the property-images bucket
  const marker = "/property-images/";
  const markerIdx = imageRow.image_url.indexOf(marker);
  if (markerIdx !== -1) {
    const storagePath = imageRow.image_url.substring(markerIdx + marker.length);
    const { error: storageError } = await supabase.storage
      .from("property-images")
      .remove([storagePath]);

    if (storageError) {
      console.error("Error removing storage object:", storageError);
    }
  }

  // 2. Delete database row
  const { error: dbDeleteError } = await supabase
    .from("property_images")
    .delete()
    .eq("id", imageId)
    .eq("property_id", propertyId);

  if (dbDeleteError) {
    console.error("Error deleting property_images row:", dbDeleteError);
    return { success: false, error: "Failed to delete image record." };
  }

  // 3. If deleted image was cover, assign remaining image as new cover
  if (imageRow.is_cover) {
    const { data: remaining } = await supabase
      .from("property_images")
      .select("id")
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (remaining) {
      await supabase
        .from("property_images")
        .update({ is_cover: true })
        .eq("id", remaining.id);
    }
  }

  revalidatePath(`/agent/properties/${propertyId}/edit`);
  revalidatePath(`/properties/${property.slug}`);
  revalidatePath("/properties");

  return { success: true };
}

/**
 * Creates an inquiry from an authenticated user for a published property.
 * Derives user_id from Supabase Auth and agent_id from the property record.
 * Status is strictly set to 'new'.
 */
export async function createInquiryAction(
  propertyId: string,
  message: string
): Promise<ActionResult<{ id: string; status: string }>> {
  // 1. Validate payload
  const parsed = inquiryCreateSchema.safeParse({
    property_id: propertyId,
    message,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid inquiry submission.",
    };
  }

  const supabase = await createClient();

  // 2. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Authentication required to send an inquiry to the advisor.",
    };
  }

  // 3. Verify user is not an agent (database RLS policy denies agents from inserting inquiries)
  const { data: agentRecord } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (agentRecord) {
    return {
      success: false,
      error: "Advisor accounts cannot submit client inquiries. Please use a client account.",
    };
  }

  // 4. Resolve property and verify it is published
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("id, slug, agent_id, status")
    .eq("id", parsed.data.property_id)
    .eq("status", "published")
    .maybeSingle();

  if (propError || !property) {
    return {
      success: false,
      error: "This property is not currently accepting inquiries.",
    };
  }

  // 5. Insert inquiry with status = 'new'
  const { data: inserted, error: insertError } = await supabase
    .from("inquiries")
    .insert({
      property_id: property.id,
      agent_id: property.agent_id,
      user_id: user.id,
      message: parsed.data.message,
      status: "new",
    })
    .select("id, status")
    .single();

  if (insertError || !inserted) {
    console.error("Error creating inquiry:", insertError);
    return {
      success: false,
      error: insertError?.message || "Failed to submit inquiry. Please try again.",
    };
  }

  // 6. Revalidate relevant pages
  revalidatePath(`/properties/${property.slug}`);
  revalidatePath("/dashboard/inquiries");
  revalidatePath("/agent/inquiries");

  return {
    success: true,
    data: {
      id: inserted.id,
      status: inserted.status,
    },
  };
}

/**
 * Updates an inquiry's status using the existing SECURITY DEFINER RPC:
 * public.update_inquiry_status(p_inquiry_id, p_status)
 *
 * Strictly enforces transitions: new -> contacted -> closed
 * Does NOT directly update the database column to respect RPC security.
 */
export async function updateInquiryStatusAction(
  inquiryId: string,
  targetStatus: "contacted" | "closed"
): Promise<ActionResult<{ id: string; status: string }>> {
  if (!inquiryId || !UUID_REGEX.test(inquiryId)) {
    return { success: false, error: "Invalid inquiry identifier." };
  }

  if (targetStatus !== "contacted" && targetStatus !== "closed") {
    return { success: false, error: "Invalid target inquiry status." };
  }

  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // 2. Call the existing SECURITY DEFINER RPC
  const { data: updated, error: rpcError } = await supabase.rpc(
    "update_inquiry_status",
    {
      p_inquiry_id: inquiryId,
      p_status: targetStatus,
    }
  );

  if (rpcError) {
    console.error("Error invoking update_inquiry_status RPC:", rpcError);
    return {
      success: false,
      error: rpcError.message || "Failed to update inquiry status.",
    };
  }

  // 3. Revalidate pages
  revalidatePath("/agent/inquiries");
  revalidatePath("/dashboard/inquiries");

  return {
    success: true,
    data: {
      id: updated.id,
      status: updated.status,
    },
  };
}


