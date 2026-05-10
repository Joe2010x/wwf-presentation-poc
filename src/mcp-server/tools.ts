import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  BrandGuidelines,
  Image,
  ImageRepository,
  Partner,
  PartnerLogos,
  Symbol,
  SlidePlan,
  ValidationResult,
  PresentationResult,
  Article,
  ArticleContent,
  ArticleRepository,
  ArticleSearchOptions,
} from './types.js';
import { unsplashService, UnsplashImage, UnsplashSearchResult } from '../services/unsplash.service.js';
import { articleSummarizer, ArticleSummaryResult, SummarizationOptions } from '../services/article-summarizer.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock symbols data (since assets/symbols is empty)
const mockSymbols: Symbol[] = [
  {
    id: 'sym_001',
    name: 'WWF Panda',
    filename: 'panda_symbol.svg',
    path: 'assets/symbols/panda_symbol.svg',
    tags: ['panda', 'logo', 'wwf', 'icon'],
    description: 'The iconic WWF panda logo symbol',
  },
  {
    id: 'sym_002',
    name: 'Tiger Stripe',
    filename: 'tiger_stripe.svg',
    path: 'assets/symbols/tiger_stripe.svg',
    tags: ['tiger', 'pattern', 'wildlife', 'icon'],
    description: 'Tiger stripe pattern symbol',
  },
  {
    id: 'sym_003',
    name: 'Ocean Wave',
    filename: 'ocean_wave.svg',
    path: 'assets/symbols/ocean_wave.svg',
    tags: ['ocean', 'wave', 'water', 'conservation', 'icon'],
    description: 'Ocean wave conservation symbol',
  },
  {
    id: 'sym_004',
    name: 'Leaf',
    filename: 'leaf.svg',
    path: 'assets/symbols/leaf.svg',
    tags: ['leaf', 'nature', 'forest', 'environment', 'icon'],
    description: 'Leaf symbol for environmental conservation',
  },
  {
    id: 'sym_005',
    name: 'Globe',
    filename: 'globe.svg',
    path: 'assets/symbols/globe.svg',
    tags: ['globe', 'earth', 'planet', 'climate', 'icon'],
    description: 'Globe symbol for global conservation',
  },
];

/**
 * MCP Tool: get_brand_guidelines
 * Loads and returns the WWF brand guidelines.
 * @returns BrandGuidelines object
 */
export async function get_brand_guidelines(): Promise<BrandGuidelines> {
  try {
    const filePath = path.resolve(__dirname, '../../data/brand-guidelines.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const brandGuidelines: BrandGuidelines = JSON.parse(fileContents);
    return brandGuidelines;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse brand-guidelines.json: ${error.message}`);
    }
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error('Brand guidelines file not found. Please ensure the file exists at the expected path.');
    }
    throw new Error(`Failed to load brand guidelines: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: search_images
 * Searches the image repository by tags, category, or description.
 * @param query - Search term to match against tags, category, or description
 * @returns Array of matching Image objects
 */
export async function search_images(query: string): Promise<Image[]> {
  try {
    const filePath = path.resolve(__dirname, '../../data/image-repository.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const repository: ImageRepository = JSON.parse(fileContents);
    
    const searchLower = query.toLowerCase();
    const matchingImages = repository.images.filter((image) => {
      const tagsMatch = image.tags.some((tag) => tag.toLowerCase().includes(searchLower));
      const categoryMatch = image.category.toLowerCase().includes(searchLower);
      const descriptionMatch = image.description.toLowerCase().includes(searchLower);
      return tagsMatch || categoryMatch || descriptionMatch;
    });
    
    return matchingImages;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse image-repository.json: ${error.message}`);
    }
    throw new Error(`Failed to search images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: get_image_metadata
 * Retrieves detailed metadata for a specific image by ID.
 * @param image_id - The unique identifier of the image (e.g., "img_001")
 * @returns Image object with full metadata
 */
export async function get_image_metadata(image_id: string): Promise<Image> {
  try {
    const filePath = path.resolve(__dirname, '../../data/image-repository.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const repository: ImageRepository = JSON.parse(fileContents);
    
    const image = repository.images.find((img) => img.id === image_id);
    
    if (!image) {
      throw new Error(`Image with ID "${image_id}" not found in repository.`);
    }
    
    return image;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse image-repository.json: ${error.message}`);
    }
    throw new Error(`Failed to get image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: search_symbols
 * Searches for WWF symbols/icons by keyword.
 * @param keyword - Search term to match against symbol names, tags, or descriptions
 * @returns Array of matching Symbol objects
 */
export function search_symbols(keyword: string): Symbol[] {
  const searchLower = keyword.toLowerCase();
  const matchingSymbols = mockSymbols.filter((symbol) => {
    const nameMatch = symbol.name.toLowerCase().includes(searchLower);
    const tagsMatch = symbol.tags.some((tag) => tag.toLowerCase().includes(searchLower));
    const descriptionMatch = symbol.description.toLowerCase().includes(searchLower);
    return nameMatch || tagsMatch || descriptionMatch;
  });
  
  return matchingSymbols;
}

/**
 * MCP Tool: get_partner_logo
 * Retrieves partner logo information by partner name.
 * @param partner_name - The name of the partner organization
 * @returns Partner object with logo path and details
 */
export async function get_partner_logo(partner_name: string): Promise<Partner> {
  try {
    const filePath = path.resolve(__dirname, '../../data/partner-logos.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const partnerData: PartnerLogos = JSON.parse(fileContents);
    
    const partner = partnerData.partners.find(
      (p) => p.name.toLowerCase() === partner_name.toLowerCase()
    );
    
    if (!partner) {
      throw new Error(`Partner "${partner_name}" not found in partner logos repository.`);
    }
    
    if (!partner.active) {
      throw new Error(`Partner "${partner_name}" is no longer active.`);
    }
    
    return partner;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse partner-logos.json: ${error.message}`);
    }
    throw new Error(`Failed to get partner logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: generate_presentation
 * Generates a 5-slide PowerPoint presentation based on a slide plan.
 * @param slide_plan - Object containing presentation structure and content
 * @returns PresentationResult with output path and status
 */
export async function generate_presentation(slide_plan: SlidePlan): Promise<PresentationResult> {
  try {
    // Validate slide count (should be 5 for MVP)
    if (slide_plan.slides.length !== 5) {
      throw new Error(`Expected 5 slides, but received ${slide_plan.slides.length}. The MVP requires exactly 5 slides.`);
    }
    
    // Generate a unique filename for the presentation
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `presentation_${timestamp}.pptx`;
    const outputDir = path.resolve(__dirname, '../../output');
    await fs.mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, filename);
    
    // Mock presentation generation (in a real implementation, this would create an actual PPTX file)
    // For now, we'll create a JSON representation of the presentation
    const presentationData = {
      title: slide_plan.title,
      subtitle: slide_plan.subtitle,
      presenter: slide_plan.presenter,
      date: slide_plan.date || new Date().toISOString().split('T')[0],
      slides: slide_plan.slides,
      generatedAt: new Date().toISOString(),
    };
    
    const presentationJson = JSON.stringify(presentationData, null, 2);
    await fs.writeFile(outputPath.replace('.pptx', '.json'), presentationJson, 'utf-8');
    
    return {
      success: true,
      outputPath: outputPath.replace('.pptx', '.json'),
      message: `Presentation "${slide_plan.title}" generated successfully with ${slide_plan.slides.length} slides.`,
      slideCount: slide_plan.slides.length,
    };
  } catch (error) {
    throw new Error(`Failed to generate presentation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: validate_presentation
 * Validates a presentation against brand guidelines and policies.
 * @param slide_plan - The presentation plan to validate
 * @returns ValidationResult with pass/fail status and any issues found
 */
export async function validate_presentation(slide_plan: SlidePlan): Promise<ValidationResult> {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Load brand guidelines for validation
    const brandGuidelines = await get_brand_guidelines();
    
    // Check 1: Validate slide count (should be 5 for MVP)
    if (slide_plan.slides.length !== 5) {
      issues.push(`Expected 5 slides, but found ${slide_plan.slides.length}.`);
    }
    
    // Check 2: Validate required fields
    if (!slide_plan.title || slide_plan.title.trim() === '') {
      issues.push('Presentation title is required.');
    }
    
    // Check 3: Validate each slide
    slide_plan.slides.forEach((slide, index) => {
      if (!slide.slideType || slide.slideType.trim() === '') {
        issues.push(`Slide ${index + 1}: Slide type is required.`);
      }
      
      // Check if imageId references a valid image
      if (slide.imageId) {
        const imageIdPattern = /^img_\d{3}$/;
        if (!imageIdPattern.test(slide.imageId)) {
          warnings.push(`Slide ${index + 1}: Image ID "${slide.imageId}" may not be valid.`);
        }
      }
      
      // Check if partner logos are specified
      if (slide.partnerLogos && slide.partnerLogos.length > 0) {
        // Partner logos should only appear on the final slide (slide 5)
        if (slide.slideNumber !== 5) {
          warnings.push(`Slide ${index + 1}: Partner logos should typically appear on the final slide.`);
        }
      }
      
      // Check for photo credits when images are used
      if (slide.imageId && (!slide.photoCredits || slide.photoCredits.length === 0)) {
        warnings.push(`Slide ${index + 1}: Photo credits should be included when using images.`);
      }
    });
    
    // Check 4: Validate required slide types
    const slideTypes = slide_plan.slides.map((s) => s.slideType.toLowerCase());
    if (!slideTypes.includes('title') && !slideTypes.includes('title slide')) {
      warnings.push('Presentation should include a title slide.');
    }
    
    const isValid = issues.length === 0;
    
    return {
      isValid,
      issues,
      warnings,
    };
  } catch (error) {
    return {
      isValid: false,
      issues: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
    };
  }
}

/**
 * MCP Tool: search_unsplash_images
 * Searches for images on Unsplash by keyword.
 * @param query - Search term to find relevant images
 * @param per_page - Number of results per page (default: 10, max: 30)
 * @param page - Page number for pagination (default: 1)
 * @param orientation - Image orientation: 'landscape', 'portrait', or 'squarish' (optional)
 * @returns UnsplashSearchResult with matching images and pagination info
 */
export async function search_unsplash_images(
  query: string,
  per_page: number = 10,
  page: number = 1,
  orientation?: 'landscape' | 'portrait' | 'squarish'
): Promise<UnsplashSearchResult> {
  if (!unsplashService.isConfigured()) {
    throw new Error('Unsplash API is not configured. Please set UNSPLASH_ACCESS_KEY environment variable.');
  }

  try {
    const result = await unsplashService.searchImages({
      query,
      perPage: Math.min(per_page, 30),
      page,
      orientation
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to search Unsplash images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: get_unsplash_photo
 * Retrieves a specific photo from Unsplash by ID.
 * @param unsplash_id - The Unsplash photo ID (e.g., "abc123")
 * @returns UnsplashImage object with full metadata
 */
export async function get_unsplash_photo(unsplash_id: string): Promise<UnsplashImage> {
  if (!unsplashService.isConfigured()) {
    throw new Error('Unsplash API is not configured. Please set UNSPLASH_ACCESS_KEY environment variable.');
  }

  try {
    const photo = await unsplashService.getPhoto(unsplash_id);
    return photo;
  } catch (error) {
    throw new Error(`Failed to get Unsplash photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: get_unsplash_random_photo
 * Gets a random photo from Unsplash, optionally filtered by search criteria.
 * @param query - Optional search term to filter random selection
 * @param featured - Whether to only return featured photos (default: false)
 * @returns UnsplashImage object with random photo metadata
 */
export async function get_unsplash_random_photo(
  query?: string,
  featured: boolean = false
): Promise<UnsplashImage> {
  if (!unsplashService.isConfigured()) {
    throw new Error('Unsplash API is not configured. Please set UNSPLASH_ACCESS_KEY environment variable.');
  }

  try {
    const photo = await unsplashService.getRandomPhoto(featured, query);
    return photo;
  } catch (error) {
    throw new Error(`Failed to get random Unsplash photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: get_unsplash_download_url
 * Gets the download URL for a specific Unsplash photo.
 * @param unsplash_id - The Unsplash photo ID
 * @returns Download URL string
 */
export async function get_unsplash_download_url(unsplash_id: string): Promise<string> {
  if (!unsplashService.isConfigured()) {
    throw new Error('Unsplash API is not configured. Please set UNSPLASH_ACCESS_KEY environment variable.');
  }

  try {
    const downloadUrl = await unsplashService.getDownloadUrl(unsplash_id);
    return downloadUrl;
  } catch (error) {
    throw new Error(`Failed to get Unsplash download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: get_unsplash_liked_photos
 * Gets photos liked by a specific Unsplash user.
 * @param username - Unsplash username
 * @param per_page - Number of results per page (default: 10)
 * @param page - Page number (default: 1)
 * @returns Array of UnsplashImage objects
 */
export async function get_unsplash_liked_photos(
  username: string,
  per_page: number = 10,
  page: number = 1
): Promise<UnsplashImage[]> {
  if (!unsplashService.isConfigured()) {
    throw new Error('Unsplash API is not configured. Please set UNSPLASH_ACCESS_KEY environment variable.');
  }

  try {
    const photos = await unsplashService.getLikedPhotos(username, per_page, page);
    return photos;
  } catch (error) {
    throw new Error(`Failed to get liked photos: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: is_unsplash_configured
 * Checks if the Unsplash API is properly configured.
 * @returns Boolean indicating if Unsplash service is available
 */
export async function is_unsplash_configured(): Promise<boolean> {
  return unsplashService.isConfigured();
}

// ==========================================
// Article Repository MCP Tools
// ==========================================

/**
 * MCP Tool: search_articles
 * Searches the article repository by title, tags, or category.
 * @param query - Search term to match against title, tags, or category
 * @param limit - Maximum number of results to return (default: 10)
 * @returns Array of matching Article objects
 */
export async function search_articles(query: string, limit: number = 10): Promise<Article[]> {
  try {
    const filePath = path.resolve(__dirname, '../../data/Articles/articles-repository.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const repository: ArticleRepository = JSON.parse(fileContents);

    const stopWords = new Set([
      'about', 'article', 'articles', 'and', 'animal', 'animals',
      'create', 'deck', 'for', 'from', 'include', 'make', 'of', 'page',
      'pages', 'picture', 'pictures', 'possible', 'presentation', 'slide',
      'slides', 'summaries', 'summary', 'the', 'when', 'with'
    ]);

    const terms = query
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s-]+/)
      .map(term => term.trim())
      .filter(term => term.length >= 3 && !stopWords.has(term));

    const uniqueTerms = Array.from(new Set(terms));
    const queryLower = query.toLowerCase();

    const scoredArticles = repository.articles
      .map(article => {
        const searchable = [
          article.title,
          article.category,
          article.author,
          article.source,
          ...article.tags
        ].join(' ').toLowerCase().replace(/-/g, ' ');

        let score = 0;

        if (searchable.includes(queryLower)) {
          score += 20;
        }

        for (const term of uniqueTerms) {
          if (article.tags.some(tag => tag.toLowerCase().replace(/-/g, ' ').includes(term))) {
            score += 6;
          }
          if (article.title.toLowerCase().includes(term)) {
            score += 5;
          }
          if (article.category.toLowerCase().replace(/-/g, ' ').includes(term)) {
            score += 4;
          }
          if (article.author.toLowerCase().includes(term) || article.source.toLowerCase().includes(term)) {
            score += 1;
          }
        }

        return { article, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scoredArticles.slice(0, limit).map(item => item.article);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse articles-repository.json: ${error.message}`);
    }
    throw new Error(`Failed to search articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: get_article_metadata
 * Retrieves metadata for a specific article by ID.
 * @param article_id - The unique identifier of the article (e.g., "art_001")
 * @returns Article object with full metadata
 */
export async function get_article_metadata(article_id: string): Promise<Article> {
  try {
    const filePath = path.resolve(__dirname, '../../data/Articles/articles-repository.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const repository: ArticleRepository = JSON.parse(fileContents);
    
    const article = repository.articles.find((art) => art.id === article_id);
    
    if (!article) {
      throw new Error(`Article with ID "${article_id}" not found in repository.`);
    }
    
    return article;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse articles-repository.json: ${error.message}`);
    }
    throw new Error(`Failed to get article metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: get_article_content
 * Retrieves the full content of an article from its markdown file.
 * @param article_id - The unique identifier of the article
 * @returns ArticleContent object with article metadata and full text
 */
export async function get_article_content(article_id: string): Promise<ArticleContent> {
  try {
    // First get the article metadata
    const article = await get_article_metadata(article_id);
    
    // Then read the markdown file
    const filePath = path.resolve(__dirname, `../../data/Articles/articles/${article.filename}`);
    const content = await fs.readFile(filePath, 'utf-8');
    
    return {
      article,
      content
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw error;
    }
    throw new Error(`Failed to get article content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: list_articles_by_category
 * Lists all articles in a specific category.
 * @param category - The category to filter by
 * @returns Array of Article objects in the specified category
 */
export async function list_articles_by_category(category: string): Promise<Article[]> {
  try {
    const filePath = path.resolve(__dirname, '../../data/Articles/articles-repository.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const repository: ArticleRepository = JSON.parse(fileContents);
    
    const matchingArticles = repository.articles.filter(
      (article) => article.category.toLowerCase() === category.toLowerCase()
    );
    
    if (matchingArticles.length === 0) {
      throw new Error(`No articles found in category "${category}".`);
    }
    
    return matchingArticles;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse articles-repository.json: ${error.message}`);
    }
    throw new Error(`Failed to list articles by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: get_article_categories
 * Returns all available article categories.
 * @returns Array of category strings
 */
export async function get_article_categories(): Promise<string[]> {
  try {
    const filePath = path.resolve(__dirname, '../../data/Articles/articles-repository.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const repository: ArticleRepository = JSON.parse(fileContents);
    
    return repository.categories;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse articles-repository.json: ${error.message}`);
    }
    throw new Error(`Failed to get article categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: summarize_article
 * Uses LLM to summarize an article and extract key points.
 * @param article_id - The unique identifier of the article
 * @param options - Summarization options (style, maxLength, etc.)
 * @returns ArticleSummaryResult with summary and key points
 */
export async function summarize_article(
  article_id: string,
  options: SummarizationOptions = {}
): Promise<ArticleSummaryResult> {
  try {
    console.log(`📝 MCP: Summarizing article ${article_id}...`);
    
    // Get the article content
    const articleContent = await get_article_content(article_id);
    
    // Check if summarizer is configured
    if (!articleSummarizer.isConfigured()) {
      console.warn('⚠️ OpenRouter API not configured. Providing basic summary.');
      // Return a basic summary using the first paragraph
      const firstParagraph = articleContent.content.split('\n\n')[0] || '';
      return {
        articleId: article_id,
        title: articleContent.article.title,
        summary: firstParagraph.substring(0, 300) + '...',
        keyPoints: [firstParagraph.substring(0, 100)],
        sourceUrl: articleContent.article.sourceUrl,
        author: articleContent.article.author,
        publishedDate: articleContent.article.publishedDate
      };
    }
    
    // Use LLM to summarize
    const result = await articleSummarizer.summarizeArticle(
      article_id,
      articleContent.content,
      articleContent.article.title,
      options
    );
    
    // Add metadata from the article
    result.sourceUrl = articleContent.article.sourceUrl;
    result.author = articleContent.article.author;
    result.publishedDate = articleContent.article.publishedDate;
    
    return result;
  } catch (error) {
    throw new Error(`Failed to summarize article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: get_related_articles
 * Finds articles related to a given article using LLM analysis or tag matching.
 * @param article_id - The source article ID
 * @param count - Number of related articles to return (default: 3)
 * @returns Array of related Article objects
 */
export async function get_related_articles(
  article_id: string,
  count: number = 3
): Promise<Article[]> {
  try {
    console.log(`🔍 MCP: Finding related articles for ${article_id}...`);
    
    // Get the source article content
    const sourceContent = await get_article_content(article_id);
    
    // Get all other articles as candidates
    const filePath = path.resolve(__dirname, '../../data/Articles/articles-repository.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const repository: ArticleRepository = JSON.parse(fileContents);
    
    const candidateArticles = repository.articles
      .filter(art => art.id !== article_id)
      .map(art => ({
        id: art.id,
        title: art.title,
        content: '', // We'll load content if needed
        tags: art.tags
      }));
    
    // Use LLM to find related articles if configured, otherwise use tag matching
    let relatedIds: string[];
    
    if (articleSummarizer.isConfigured()) {
      // Load content for candidates (just first 200 chars for analysis)
      for (const candidate of candidateArticles) {
        try {
          const content = await fs.readFile(
            path.resolve(__dirname, `../../data/Articles/articles/${candidate.id}.md`),
            'utf-8'
          );
          candidate.content = content.substring(0, 200);
        } catch {
          candidate.content = candidate.title;
        }
      }
      
      relatedIds = await articleSummarizer.findRelatedArticles(
        {
          title: sourceContent.article.title,
          content: sourceContent.content.substring(0, 500),
          tags: sourceContent.article.tags
        },
        candidateArticles as any,
        count
      );
    } else {
      // Fallback to tag-based matching
      relatedIds = candidateArticles
        .map(candidate => {
          const overlap = candidate.tags.filter(tag =>
            sourceContent.article.tags.some(st => st.toLowerCase() === tag.toLowerCase())
          ).length;
          return { id: candidate.id, score: overlap };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, count)
        .map(item => item.id);
    }
    
    // Return the full article objects for the related IDs
    return relatedIds
      .map(id => repository.articles.find(art => art.id === id))
      .filter((art): art is Article => art !== undefined);
  } catch (error) {
    throw new Error(`Failed to find related articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * MCP Tool: create_article_presentation
 * Creates a presentation slide plan from selected articles.
 * @param article_ids - Array of article IDs to include
 * @param presentation_title - Title for the presentation
 * @returns SlidePlan for the article-based presentation
 */
export async function create_article_presentation(
  article_ids: string[],
  presentation_title: string
): Promise<SlidePlan> {
  try {
    console.log(`📊 MCP: Creating presentation from ${article_ids.length} articles...`);
    
    const slides = [];
    
    // Title slide
    slides.push({
      slideNumber: 1,
      slideType: 'title',
      title: presentation_title,
      content: 'Article Summary Presentation'
    });
    
    // Article summary slides
    for (let i = 0; i < Math.min(article_ids.length, 3); i++) {
      const articleId = article_ids[i];
      const summary = await summarize_article(articleId, { style: 'bullet', maxLength: 100 });
      
      // Format source attribution
      const sourceAttribution = summary.author && summary.sourceUrl 
        ? `Source: ${summary.author}, ${summary.sourceUrl}`
        : summary.sourceUrl 
        ? `Source: ${summary.sourceUrl}`
        : summary.author 
        ? `Source: ${summary.author}`
        : undefined;
      
      slides.push({
        slideNumber: i + 2,
        slideType: 'content',
        title: summary.title,
        content: summary.keyPoints.join('\n'),
        source: sourceAttribution,
        photoCredits: sourceAttribution ? [sourceAttribution] : undefined
      });
    }
    
    // Related articles slide
    if (article_ids.length > 0) {
      const relatedArticles = await get_related_articles(article_ids[0], 3);
      const relatedLinks = relatedArticles
        .map(art => `• ${art.title} - ${art.sourceUrl}`)
        .join('\n');
      
      slides.push({
        slideNumber: Math.min(article_ids.length, 3) + 2,
        slideType: 'content',
        title: 'Related Articles',
        content: relatedLinks
      });
    }
    
    // Closing slide
    slides.push({
      slideNumber: 5,
      slideType: 'closing',
      title: 'Thank You',
      content: 'For more information, visit the source articles.'
    });
    
    return {
      title: presentation_title,
      slides: slides.slice(0, 5) // Ensure exactly 5 slides
    };
  } catch (error) {
    throw new Error(`Failed to create article presentation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
