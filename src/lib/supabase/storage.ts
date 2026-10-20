import { createClient } from "./client";
import { compressImage } from "@/lib/images/compressImage";

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = createClient();
  // Automatically compress and resize avatar to lightweight modern WebP (max 512x512)
  const fileToUpload = await compressImage(file, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.85,
    mimeType: "image/webp",
  });

  const fileExt = fileToUpload.name.split(".").pop() || "webp";
  const sanitizedName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${userId}/${Date.now()}-${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, fileToUpload, {
      cacheControl: "3600",
      contentType: fileToUpload.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Avatar upload failed: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Update profile avatar_url
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", userId);

  if (updateError) {
    throw new Error(`Profile avatar update failed: ${updateError.message}`);
  }

  return publicUrl;
}
