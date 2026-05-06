import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// TypeScript interfaces matching brand-guidelines.json structure
export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
}

export interface Fonts {
  heading: string;
  subheading: string;
  body: string;
  caption: string;
}

export interface LogoUsage {
  minClearSpace: string;
  minWidth: string;
  placement: string[];
}

export interface SlideTemplate {
  background: string;
  [key: string]: string | string[];
}

export interface SlideTemplates {
  titleSlide: SlideTemplate;
  contentSlide: SlideTemplate;
  imageSlide: SlideTemplate;
}

export interface BrandGuidelines {
  version: string;
  lastUpdated: string;
  colors: BrandColors;
  fonts: Fonts;
  logoUsage: LogoUsage;
  slideTemplates: SlideTemplates;
}

/**
 * Loads brand guidelines from the JSON configuration file.
 * @returns A Promise that resolves to the BrandGuidelines object.
 * @throws Error if the file cannot be read or parsed.
 */
export async function loadBrandGuidelines(): Promise<BrandGuidelines> {
  try {
    // Resolve the path to the brand-guidelines.json file
    const filePath = path.resolve(__dirname, '../../data/brand-guidelines.json');
    
    // Read the file contents
    const fileContents = await fs.readFile(filePath, 'utf-8');
    
    // Parse the JSON content
    const brandGuidelines: BrandGuidelines = JSON.parse(fileContents);
    
    return brandGuidelines;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse brand-guidelines.json: ${error.message}`);
    }
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Brand guidelines file not found. Please ensure the file exists at the expected path.`);
    }
    throw new Error(`Failed to load brand guidelines: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}