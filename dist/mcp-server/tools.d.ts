import { BrandGuidelines, Image, Partner, Symbol, SlidePlan, ValidationResult, PresentationResult, Article, ArticleContent } from './types.js';
import { UnsplashImage, UnsplashSearchResult } from '../services/unsplash.service.js';
import { ArticleSummaryResult, SummarizationOptions } from '../services/article-summarizer.service.js';
/**
 * MCP Tool: get_brand_guidelines
 * Loads and returns the WWF brand guidelines.
 * @returns BrandGuidelines object
 */
export declare function get_brand_guidelines(): Promise<BrandGuidelines>;
/**
 * MCP Tool: search_images
 * Searches the image repository by tags, category, or description.
 * @param query - Search term to match against tags, category, or description
 * @returns Array of matching Image objects
 */
export declare function search_images(query: string): Promise<Image[]>;
/**
 * MCP Tool: get_image_metadata
 * Retrieves detailed metadata for a specific image by ID.
 * @param image_id - The unique identifier of the image (e.g., "img_001")
 * @returns Image object with full metadata
 */
export declare function get_image_metadata(image_id: string): Promise<Image>;
/**
 * MCP Tool: search_symbols
 * Searches for WWF symbols/icons by keyword.
 * @param keyword - Search term to match against symbol names, tags, or descriptions
 * @returns Array of matching Symbol objects
 */
export declare function search_symbols(keyword: string): Symbol[];
/**
 * MCP Tool: get_partner_logo
 * Retrieves partner logo information by partner name.
 * @param partner_name - The name of the partner organization
 * @returns Partner object with logo path and details
 */
export declare function get_partner_logo(partner_name: string): Promise<Partner>;
/**
 * MCP Tool: generate_presentation
 * Generates a 5-slide PowerPoint presentation based on a slide plan.
 * @param slide_plan - Object containing presentation structure and content
 * @returns PresentationResult with output path and status
 */
export declare function generate_presentation(slide_plan: SlidePlan): Promise<PresentationResult>;
/**
 * MCP Tool: validate_presentation
 * Validates a presentation against brand guidelines and policies.
 * @param slide_plan - The presentation plan to validate
 * @returns ValidationResult with pass/fail status and any issues found
 */
export declare function validate_presentation(slide_plan: SlidePlan): Promise<ValidationResult>;
/**
 * MCP Tool: search_unsplash_images
 * Searches for images on Unsplash by keyword.
 * @param query - Search term to find relevant images
 * @param per_page - Number of results per page (default: 10, max: 30)
 * @param page - Page number for pagination (default: 1)
 * @param orientation - Image orientation: 'landscape', 'portrait', or 'squarish' (optional)
 * @returns UnsplashSearchResult with matching images and pagination info
 */
export declare function search_unsplash_images(query: string, per_page?: number, page?: number, orientation?: 'landscape' | 'portrait' | 'squarish'): Promise<UnsplashSearchResult>;
/**
 * MCP Tool: get_unsplash_photo
 * Retrieves a specific photo from Unsplash by ID.
 * @param unsplash_id - The Unsplash photo ID (e.g., "abc123")
 * @returns UnsplashImage object with full metadata
 */
export declare function get_unsplash_photo(unsplash_id: string): Promise<UnsplashImage>;
/**
 * MCP Tool: get_unsplash_random_photo
 * Gets a random photo from Unsplash, optionally filtered by search criteria.
 * @param query - Optional search term to filter random selection
 * @param featured - Whether to only return featured photos (default: false)
 * @returns UnsplashImage object with random photo metadata
 */
export declare function get_unsplash_random_photo(query?: string, featured?: boolean): Promise<UnsplashImage>;
/**
 * MCP Tool: get_unsplash_download_url
 * Gets the download URL for a specific Unsplash photo.
 * @param unsplash_id - The Unsplash photo ID
 * @returns Download URL string
 */
export declare function get_unsplash_download_url(unsplash_id: string): Promise<string>;
/**
 * MCP Tool: get_unsplash_liked_photos
 * Gets photos liked by a specific Unsplash user.
 * @param username - Unsplash username
 * @param per_page - Number of results per page (default: 10)
 * @param page - Page number (default: 1)
 * @returns Array of UnsplashImage objects
 */
export declare function get_unsplash_liked_photos(username: string, per_page?: number, page?: number): Promise<UnsplashImage[]>;
/**
 * MCP Tool: is_unsplash_configured
 * Checks if the Unsplash API is properly configured.
 * @returns Boolean indicating if Unsplash service is available
 */
export declare function is_unsplash_configured(): Promise<boolean>;
/**
 * MCP Tool: search_articles
 * Searches the article repository by title, tags, or category.
 * @param query - Search term to match against title, tags, or category
 * @param limit - Maximum number of results to return (default: 10)
 * @returns Array of matching Article objects
 */
export declare function search_articles(query: string, limit?: number): Promise<Article[]>;
/**
 * MCP Tool: get_article_metadata
 * Retrieves metadata for a specific article by ID.
 * @param article_id - The unique identifier of the article (e.g., "art_001")
 * @returns Article object with full metadata
 */
export declare function get_article_metadata(article_id: string): Promise<Article>;
/**
 * MCP Tool: get_article_content
 * Retrieves the full content of an article from its markdown file.
 * @param article_id - The unique identifier of the article
 * @returns ArticleContent object with article metadata and full text
 */
export declare function get_article_content(article_id: string): Promise<ArticleContent>;
/**
 * MCP Tool: list_articles_by_category
 * Lists all articles in a specific category.
 * @param category - The category to filter by
 * @returns Array of Article objects in the specified category
 */
export declare function list_articles_by_category(category: string): Promise<Article[]>;
/**
 * MCP Tool: get_article_categories
 * Returns all available article categories.
 * @returns Array of category strings
 */
export declare function get_article_categories(): Promise<string[]>;
/**
 * MCP Tool: summarize_article
 * Uses LLM to summarize an article and extract key points.
 * @param article_id - The unique identifier of the article
 * @param options - Summarization options (style, maxLength, etc.)
 * @returns ArticleSummaryResult with summary and key points
 */
export declare function summarize_article(article_id: string, options?: SummarizationOptions): Promise<ArticleSummaryResult>;
/**
 * MCP Tool: get_related_articles
 * Finds articles related to a given article using LLM analysis or tag matching.
 * @param article_id - The source article ID
 * @param count - Number of related articles to return (default: 3)
 * @returns Array of related Article objects
 */
export declare function get_related_articles(article_id: string, count?: number): Promise<Article[]>;
/**
 * MCP Tool: create_article_presentation
 * Creates a presentation slide plan from selected articles.
 * @param article_ids - Array of article IDs to include
 * @param presentation_title - Title for the presentation
 * @returns SlidePlan for the article-based presentation
 */
export declare function create_article_presentation(article_ids: string[], presentation_title: string): Promise<SlidePlan>;
//# sourceMappingURL=tools.d.ts.map