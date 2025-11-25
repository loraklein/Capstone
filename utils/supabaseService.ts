import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Supabase configuration
const SUPABASE_URL = 'https://bhoodtyyzsywvbxoanjg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob29kdHl5enN5d3ZieG9hbmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMTg5MTksImV4cCI6MjA3Mzg5NDkxOX0.OPlD0zT9gadb4kZdnxwjUKVwp453REggwYt-Emk2rzY';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class SupabaseService {
  private bucketName: string;

  constructor(bucketName: string = 'document-images') {
    this.bucketName = bucketName;
  }

  // Upload image to Supabase Storage
  async uploadImage(imageUri: string, fileName: string, userId: string): Promise<string> {
    try {
      // Generate unique file path
      const fileExtension = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `${userId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

      let fileBlob: Blob | File;

      // Handle web platform differently
      if (Platform.OS === 'web') {
        // On web, imageUri is a blob URL or data URL
        if (imageUri.startsWith('blob:') || imageUri.startsWith('data:')) {
          const response = await fetch(imageUri);
          fileBlob = await response.blob();
        } else {
          throw new Error('Invalid image URI for web upload');
        }

        // Upload using Supabase client on web (better compatibility)
        const { data, error } = await supabase.storage
          .from(this.bucketName)
          .upload(uniqueFileName, fileBlob, {
            contentType: `image/${fileExtension}`,
            upsert: false,
          });

        if (error) {
          console.error('Upload error:', error);
          throw new Error(`Supabase Storage upload failed: ${error.message}`);
        }

        // Get public URL
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${this.bucketName}/${uniqueFileName}`;
        return publicUrl;
      } else {
        // React Native mobile upload
        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          type: `image/${fileExtension}`,
          name: uniqueFileName,
        } as any);

        // Upload using REST API with proper headers
        const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${this.bucketName}/${uniqueFileName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload response error:', response.status, errorText);
          throw new Error(`Supabase Storage upload failed: ${response.status} ${errorText}`);
        }

        // Get public URL
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${this.bucketName}/${uniqueFileName}`;
        return publicUrl;
      }
    } catch (error) {
      console.error('Error uploading image to Supabase:', error);
      throw error;
    }
  }

  // Delete image from Supabase Storage
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userId = urlParts[urlParts.length - 2];
      const filePath = `${userId}/${fileName}`;

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Supabase Storage deletion failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting image from Supabase:', error);
      throw error;
    }
  }

  // Get image URL from storage path
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();
