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
} from './types';

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
