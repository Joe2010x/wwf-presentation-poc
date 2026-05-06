import { BrandGuidelines, Image, Partner, Symbol, SlidePlan, ValidationResult, PresentationResult } from './types';
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
//# sourceMappingURL=tools.d.ts.map