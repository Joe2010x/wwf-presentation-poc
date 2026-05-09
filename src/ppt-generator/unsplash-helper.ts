import { unsplashService } from '../services/unsplash.service.js';

/**
 * Interface for image search results used in presentations
 */
export interface PresentationImage {
  id: string;
  url?: string;
  path?: string;
  photographer: string;
  attribution: string;
  description?: string;
  width: number;
  height: number;
}

const LOCAL_FALLBACK_IMAGE_PATH = 'assets/fallback-images/conservation-fallback.png';
const MAX_SEARCH_ATTEMPTS = 3;
const FALLBACK_SEARCH_QUERIES = [
  'nature conservation',
  'wildlife conservation',
  'ocean conservation',
  'forest conservation',
  'environmental protection'
];

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createLocalFallbackImage(reason: string): PresentationImage {
  return {
    id: 'local_conservation_fallback',
    path: LOCAL_FALLBACK_IMAGE_PATH,
    photographer: 'WWF Presentation Generator',
    attribution: `Local fallback image (${reason})`,
    description: 'Conservation-themed local fallback image',
    width: 1600,
    height: 900
  };
}

function buildSearchQueries(keywords: string): string[] {
  const queries = [keywords, ...FALLBACK_SEARCH_QUERIES]
    .map(query => query.trim())
    .filter(Boolean);

  return Array.from(new Set(queries));
}

async function searchUnsplashWithRetry(
  query: string,
  orientation: 'landscape' | 'portrait' | 'squarish'
): Promise<PresentationImage | null> {
  for (let attempt = 1; attempt <= MAX_SEARCH_ATTEMPTS; attempt++) {
    try {
      const searchResults = await unsplashService.searchImages({
        query,
        perPage: 1,
        orientation
      });

      if (searchResults.results.length === 0) {
        console.warn(`No Unsplash images found for "${query}"`);
        return null;
      }

      const photo = searchResults.results[0];
      await unsplashService.trackDownload(photo.links.download);
      const resolution = photo.resolution.split('x');

      return {
        id: photo.unsplashId,
        url: photo.urls.regular,
        photographer: photo.photographer,
        attribution: `Photo by ${photo.photographer} on Unsplash`,
        description: photo.description || photo.tags?.[0] || '',
        width: parseInt(resolution[0]) || 1920,
        height: parseInt(resolution[1]) || 1080
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Unsplash search failed for "${query}" (attempt ${attempt}/${MAX_SEARCH_ATTEMPTS}): ${message}`);

      if (attempt < MAX_SEARCH_ATTEMPTS) {
        await delay(500 * attempt);
      }
    }
  }

  return null;
}

/**
 * Search for an image on Unsplash based on keywords.
 * Falls back to broader queries and then a local image, so image slides do not
 * end up with an empty placeholder when Unsplash is unavailable.
 */
export async function searchPresentationImage(
  keywords: string,
  orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
): Promise<PresentationImage> {
  if (!unsplashService.isConfigured()) {
    console.warn('Unsplash not configured. Using local fallback image.');
    return createLocalFallbackImage('Unsplash not configured');
  }

  for (const query of buildSearchQueries(keywords)) {
    const image = await searchUnsplashWithRetry(query, orientation);

    if (image) {
      if (query !== keywords) {
        console.log(`Using fallback Unsplash query "${query}" for original query "${keywords}"`);
      }

      return image;
    }
  }

  console.warn(`All Unsplash searches failed for "${keywords}". Using local fallback image.`);
  return createLocalFallbackImage('Unsplash search failed');
}

/**
 * Get a random image from Unsplash for presentations
 */
export async function getRandomPresentationImage(
  keywords?: string
): Promise<PresentationImage> {
  if (!unsplashService.isConfigured()) {
    console.warn('Unsplash not configured. Using local fallback image.');
    return createLocalFallbackImage('Unsplash not configured');
  }

  try {
    const photo = await unsplashService.getRandomPhoto(false, keywords);
    await unsplashService.trackDownload(photo.links.download);
    const resolution = photo.resolution.split('x');

    return {
      id: photo.unsplashId,
      url: photo.urls.regular,
      photographer: photo.photographer,
      attribution: `Photo by ${photo.photographer} on Unsplash`,
      description: photo.description || '',
      width: parseInt(resolution[0]) || 1920,
      height: parseInt(resolution[1]) || 1080
    };
  } catch (error) {
    console.error('Error getting random Unsplash image:', error instanceof Error ? error.message : error);
    return searchPresentationImage(keywords || 'nature conservation');
  }
}

/**
 * Extract keywords from slide content for image search
 */
export function extractKeywordsFromContent(
  title?: string,
  content?: string,
  caption?: string
): string {
  const parts: string[] = [];

  if (title) {
    parts.push(title);
  }

  if (content) {
    parts.push(content.substring(0, 50));
  }

  if (caption) {
    parts.push(caption);
  }

  return parts.join(' ').trim();
}

/**
 * Interface for slide data with image support
 */
export interface SlideWithImage {
  type: 'title' | 'content' | 'image' | 'closing';
  data: {
    title?: string;
    subtitle?: string;
    headline?: string;
    bullets?: string[];
    caption?: string;
    message?: string;
    imagePath?: string;
    imageUrl?: string;
    attribution?: string;
    searchQuery?: string;
    useRandomImage?: boolean;
  };
}

/**
 * Process slides and add Unsplash or local fallback images where needed
 */
export async function processSlidesWithUnsplash(
  slides: SlideWithImage[]
): Promise<SlideWithImage[]> {
  const processedSlides: SlideWithImage[] = [];

  for (const slide of slides) {
    const processedSlide = { ...slide, data: { ...slide.data } };

    if (processedSlide.data.imagePath || processedSlide.data.imageUrl) {
      processedSlides.push(processedSlide);
      continue;
    }

    if (processedSlide.type === 'image' && !processedSlide.data.searchQuery) {
      processedSlide.data.searchQuery = extractKeywordsFromContent(
        processedSlide.data.title,
        processedSlide.data.headline,
        processedSlide.data.caption
      );
    }

    if (processedSlide.data.searchQuery || processedSlide.data.useRandomImage) {
      const keywords = processedSlide.data.searchQuery ||
        extractKeywordsFromContent(
          processedSlide.data.title,
          processedSlide.data.headline,
          processedSlide.data.caption
        );

      const image = processedSlide.data.useRandomImage
        ? await getRandomPresentationImage(keywords)
        : await searchPresentationImage(keywords);

      if (image.url) {
        processedSlide.data.imageUrl = image.url;
      } else if (image.path) {
        processedSlide.data.imagePath = image.path;
      }

      processedSlide.data.attribution = image.attribution;
      console.log(`Image selected for "${keywords}": ${image.id}`);
    }

    processedSlides.push(processedSlide);
  }

  return processedSlides;
}
