/**
 * Cloudinary Upload Service
 * Upload images to Cloudinary and return secure URL
 */
import type { CloudinaryUploadResult } from "@/src/types/profile";
import * as FileSystem from "expo-file-system/legacy";

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = "dinner_avatars"; // You need to create this preset in Cloudinary Dashboard

/**
 * Upload image to Cloudinary
 * @param imageUri - Local image URI from ImagePicker
 * @returns Cloudinary upload result with secure_url
 */
export async function uploadToCloudinary(
  imageUri: string
): Promise<CloudinaryUploadResult> {
  try {
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new Error("CLOUDINARY_CLOUD_NAME not configured in .env");
    }

    // Convert image to base64 using legacy API
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Create form data
    const formData = new FormData();

    // Append base64 image to form data
    formData.append("file", `data:image/jpeg;base64,${base64}`);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "dinner/avatars"); // Organize by folder

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to upload image");
    }

    const result: CloudinaryUploadResult = await response.json();

    

    return result;
  } catch (error: any) {
    throw new Error(error.message || "Failed to upload image");
  }
}

/**
 * Delete image from Cloudinary (optional - for cleanup)
 * @param publicId - Cloudinary public_id of the image
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // Note: Deleting requires API key/secret (server-side)
  // For now, we'll skip this and manually clean up via Cloudinary Dashboard
  // Delete is not implemented; clean up via Cloudinary Dashboard if needed
}
