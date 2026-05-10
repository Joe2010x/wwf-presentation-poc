import { createApi } from 'unsplash-js';
import dotenv from 'dotenv';

dotenv.config();

// Define our own types based on Unsplash API responses
export interface UnsplashUrls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
}

export interface UnsplashLinks {
  self: string;
  html: string;
  download_location?: string;
}

export interface UnsplashUser {
  id: string;
  username: string;
  name: string;
  links: {
    self: string;
    html: string;
    photos: string;
  };
}

export interface UnsplashPhoto {
  id: string;
  slug: string;
  alternative_slugs: Record<string, string>;
  created_at: string;
  updated_at: string;
  promoted_at: string | null;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description: string | null;
  alt_description: string | null;
  breadcrumbs: any[];
  urls: UnsplashUrls;
  links: UnsplashLinks;
  user: UnsplashUser;
  tags: Array<{ title: string; slug: string }>;
  categories: number[];
  views: number;
  downloads: number;
  likes: number;
  liked_by_user: boolean;
  current_user_collections: any[];
  sponsorships: any[];
  topic_submissions: Array<{ title: string; slug: string }>;
  asset_type: string;
}

export interface UnsplashImage {
  id: string;
  unsplashId: string;
  filename: string;
  category: string;
  tags: string[];
  description: string;
  photographer: string;
  photographerUrl: string;
  license: string;
  resolution: string;
  urls: UnsplashUrls;
  links: {
    self: string;
    html: string;
    download: string;
  };
  source: 'unsplash';
}

export interface UnsplashSearchOptions {
  query: string;
  perPage?: number;
  page?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  orderBy?: 'relevant' | 'latest';
}

export interface UnsplashSearchResult {
  results: UnsplashImage[];
  total: number;
  totalPages: number;
}

class UnsplashService {
  private api: ReturnType<typeof createApi> | null = null;
  private accessToken: string = '';
  private appName: string = 'WWF Presentation Generator';

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.accessToken = process.env.UNSPLASH_ACCESS_KEY || '';
    this.appName = process.env.OPENROUTER_SITE_NAME || this.appName;
    
    if (this.accessToken) {
      this.api = createApi({
        accessKey: this.accessToken,
      });
    } else {
      console.warn('Unsplash API not configured: UNSPLASH_ACCESS_KEY not found in environment variables');
    }
  }

  public isConfigured(): boolean {
    return !!this.api && !!this.accessToken;
  }

  /**
   * Search for images on Unsplash
   */
  public async searchImages(options: UnsplashSearchOptions): Promise<UnsplashSearchResult> {
    if (!this.api) {
      throw new Error('Unsplash API is not configured. Please set UNSPLASH_ACCESS_KEY environment variable.');
    }

    const {
      query,
      perPage = 10,
      page = 1,
      orientation,
      orderBy = 'relevant'
    } = options;

    try {
      console.log(`📤 Sending search request to Unsplash API: "${query}" (page=${page}, perPage=${perPage})`);

      const response = await this.api.search.getPhotos({
        query,
        perPage: Math.min(perPage, 30), // Unsplash max is 30 per page
        page,
        orientation,
        orderBy
      });

      if (response.type === 'error') {
        console.error(`❌ Unsplash API error: ${response.errors[0] || 'Unknown error'}`);
        throw new Error(`Unsplash API Error: ${response.errors[0] || 'Unknown error'}`);
      }

      const results = response.response.results.map((photo: any) => this.mapPhotoToUnsplashImage(photo));

      console.log(`📥 Received ${results.length} images from Unsplash (total: ${response.response.total})`);

      return {
        results,
        total: response.response.total,
        totalPages: response.response.total_pages
      };
    } catch (error) {
      console.error(`❌ Failed to search Unsplash: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`Failed to search Unsplash images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific photo by Unsplash ID
   */
  public async getPhoto(unsplashId: string): Promise<UnsplashImage> {
    if (!this.api) {
      throw new Error('Unsplash API is not configured.');
    }

    try {
      console.log(`📤 Fetching photo from Unsplash: ${unsplashId}`);

      const response = await this.api.photos.get({
        photoId: unsplashId
      });

      if (response.type === 'error') {
        console.error(`❌ Unsplash API error: ${response.errors[0] || 'Unknown error'}`);
        throw new Error(`Unsplash API Error: ${response.errors[0] || 'Unknown error'}`);
      }

      console.log(`📥 Received photo: ${response.response.description || unsplashId}`);
      return this.mapPhotoToUnsplashImage(response.response);
    } catch (error) {
      console.error(`❌ Failed to get Unsplash photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`Failed to get Unsplash photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a random photo based on search criteria
   */
  public async getRandomPhoto(featured?: boolean, query?: string): Promise<UnsplashImage> {
    if (!this.api) {
      throw new Error('Unsplash API is not configured.');
    }

    try {
      console.log(`📤 Fetching random photo from Unsplash${query ? ` with query: "${query}"` : ''}`);

      const response = await this.api.photos.getRandom({
        featured,
        query,
        orientation: 'landscape' // Default to landscape for presentations
      });

      if (response.type === 'error') {
        console.error(`❌ Unsplash API error: ${response.errors[0] || 'Unknown error'}`);
        throw new Error(`Unsplash API Error: ${response.errors[0] || 'Unknown error'}`);
      }

      console.log(`📥 Received random photo: ${Array.isArray(response.response) ? response.response[0]?.description : response.response.description || response.response.id}`);
      return this.mapPhotoToUnsplashImage(response.response);
    } catch (error) {
      console.error(`❌ Failed to get random Unsplash photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`Failed to get random Unsplash photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get download URL for a photo
   */
  public async getDownloadUrl(unsplashId: string): Promise<string> {
    if (!this.api) {
      throw new Error('Unsplash API is not configured.');
    }

    try {
      // First get the photo to find the download location
      const photoResponse = await this.api.photos.get({ photoId: unsplashId });
      
      if (photoResponse.type === 'error') {
        throw new Error(`Unsplash API Error: ${photoResponse.errors[0] || 'Unknown error'}`);
      }

      const downloadLocation = photoResponse.response.links.download_location;
      if (!downloadLocation) {
        throw new Error('No download location available for this photo');
      }

      await this.trackDownload(downloadLocation);

      return photoResponse.response.urls.full;
    } catch (error) {
      throw new Error(`Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user's liked photos (public endpoint)
   */
  public async getLikedPhotos(username: string, perPage = 10, page = 1): Promise<UnsplashImage[]> {
    if (!this.api) {
      throw new Error('Unsplash API is not configured.');
    }

    try {
      const response = await this.api.users.getLikes({
        username,
        perPage,
        page
      });

      if (response.type === 'error') {
        throw new Error(`Unsplash API Error: ${response.errors[0] || 'Unknown error'}`);
      }

      return response.response.results.map((photo: any) => this.mapPhotoToUnsplashImage(photo));
    } catch (error) {
      throw new Error(`Failed to get liked photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Notify Unsplash when a photo is used in a presentation.
   */
  public async trackDownload(downloadLocation: string): Promise<void> {
    if (!this.api) {
      throw new Error('Unsplash API is not configured.');
    }

    try {
      console.log(`📤 Tracking Unsplash download...`);

      const response = await this.api.photos.trackDownload({ downloadLocation });

      if (response.type === 'error') {
        console.warn(`⚠️ Failed to track download: ${response.errors[0] || 'Unknown error'}`);
        // Don't throw - tracking is not critical
        return;
      }

      console.log(`✅ Download tracked successfully`);
    } catch (error) {
      console.warn(`⚠️ Failed to track Unsplash download: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Don't throw - tracking is not critical
    }
  }

  /**
   * Map Unsplash Photo object to our UnsplashImage interface
   */
  private mapPhotoToUnsplashImage(photo: any): UnsplashImage {
    const utmSource = encodeURIComponent(this.appName);
    const appendReferral = (url: string) => {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}utm_source=${utmSource}&utm_medium=referral`;
    };

    return {
      id: `unsplash_${photo.id}`,
      unsplashId: photo.id,
      filename: `${photo.id}.jpg`,
      category: photo.topic_submissions?.[0]?.title || 'general',
      tags: photo.tags?.map((tag: any) => tag.title).slice(0, 10) || [],
      description: photo.description || photo.alt_description || '',
      photographer: photo.user.name,
      photographerUrl: appendReferral(photo.user.links.html),
      license: 'Unsplash License',
      resolution: `${photo.width}x${photo.height}`,
      urls: {
        raw: photo.urls.raw,
        full: photo.urls.full,
        regular: photo.urls.regular,
        small: photo.urls.small,
        thumb: photo.urls.thumb
      },
      links: {
        self: photo.links.self,
        html: appendReferral(photo.links.html),
        download: photo.links.download_location || photo.urls.full
      },
      source: 'unsplash'
    };
  }
}

// Export singleton instance
export const unsplashService = new UnsplashService();
