import { supabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
  private bucketName: string;

  constructor(bucketName: string = 'document-images') {
    this.bucketName = bucketName;
  }

  async uploadImage(imageBuffer: Buffer, fileName: string, userId: string): Promise<string> {
    try {
      // Generate unique filename
      const fileExtension = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `${userId}/${uuidv4()}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(uniqueFileName, imageBuffer, {
          contentType: `image/${fileExtension}`,
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(uniqueFileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw new Error(`Storage service error: ${error}`);
    }
  }

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
        console.error('Storage delete error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteImage:', error);
      throw new Error(`Storage service error: ${error}`);
    }
  }

  async getImageBuffer(imageUrl: string): Promise<Buffer> {
    try {
      // For Supabase URLs, we can download directly
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error in getImageBuffer:', error);
      throw new Error(`Failed to get image buffer: ${error}`);
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
