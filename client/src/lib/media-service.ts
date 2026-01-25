/**
 * Media Service
 * Handles file uploads to Supabase Storage
 */

import { supabase } from './supabase';

export interface UploadResult {
  path: string;
  publicUrl: string;
  error?: string;
}

export interface MediaAsset {
  id: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  file_size: number;
  labels: string[];
  description?: string;
}

const BUCKET_NAME = 'field-to-invoice-media';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'video/mp4',
  'video/quicktime',
  'application/pdf',
];

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  siteId: string,
  options?: {
    labels?: string[];
    description?: string;
  }
): Promise<UploadResult> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        path: '',
        publicUrl: '',
        error: `Bestand is te groot. Maximum is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        path: '',
        publicUrl: '',
        error: 'Bestandstype niet toegestaan',
      };
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        path: '',
        publicUrl: '',
        error: 'Niet ingelogd',
      };
    }

    // Generate file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${user.id}/${siteId}/${fileName}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return {
        path: '',
        publicUrl: '',
        error: uploadError.message,
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    // Save to media_assets table
    const { error: dbError } = await supabase
      .from('media_assets')
      .insert({
        user_id: user.id,
        tenant_id: user.id, // Using user_id as tenant_id for now
        site_id: siteId,
        storage_path: filePath,
        public_url: publicUrl,
        mime_type: file.type,
        file_size: file.size,
        labels: options?.labels || [],
        description: options?.description,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // File uploaded but DB insert failed - should we delete the file?
      // For now, we'll just return the URL
    }

    return {
      path: filePath,
      publicUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      path: '',
      publicUrl: '',
      error: error instanceof Error ? error.message : 'Upload mislukt',
    };
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  siteId: string,
  options?: {
    labels?: string[];
    description?: string;
    onProgress?: (progress: number) => void;
  }
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(files[i], siteId, options);
    results.push(result);
    
    if (options?.onProgress) {
      options.onProgress(((i + 1) / files.length) * 100);
    }
  }
  
  return results;
}

/**
 * Get media assets for a site
 */
export async function getMediaAssets(siteId: string): Promise<MediaAsset[]> {
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching media:', error);
    return [];
  }

  return data || [];
}

/**
 * Delete a media asset
 */
export async function deleteMediaAsset(id: string, storagePath: string): Promise<boolean> {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Database delete error:', dbError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * Get signed URL for private file
 */
export async function getSignedUrl(path: string, expiresIn: number = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Signed URL error:', error);
    return null;
  }

  return data.signedUrl;
}
