import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary using URL format
// CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
cloudinary.config(process.env.CLOUDINARY_URL || {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
}

export class CloudinaryService {
  async uploadImage(
    imageData: string, 
    folder: string = 'menu-images',
    transformation?: Record<string, unknown>
  ): Promise<UploadResult> {
    try {
      const result = await cloudinary.uploader.upload(imageData, {
        folder,
        resource_type: 'image',
        transformation: transformation || [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ],
        // Generate multiple sizes for responsive images
        eager: [
          { width: 300, height: 300, crop: 'fill', quality: 'auto' },
          { width: 600, height: 400, crop: 'fill', quality: 'auto' },
          { width: 1200, height: 800, crop: 'fill', quality: 'auto' }
        ]
      })

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw new Error('Failed to upload image to Cloudinary')
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId)
    } catch (error) {
      console.error('Cloudinary delete error:', error)
      throw new Error('Failed to delete image from Cloudinary')
    }
  }

  getOptimizedUrl(
    publicId: string, 
    width?: number, 
    height?: number, 
    quality: string = 'auto'
  ): string {
    if (!publicId) return ''
    
    let transformation = `q_${quality},f_auto`
    
    if (width && height) {
      transformation += `,w_${width},h_${height},c_fill`
    } else if (width) {
      transformation += `,w_${width}`
    }

    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/${publicId}`
  }

  getThumbnailUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, 300, 300)
  }

  getMediumUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, 600, 400)
  }

  getLargeUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, 1200, 800)
  }
}

export const cloudinaryService = new CloudinaryService()
