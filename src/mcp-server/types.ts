// Shared TypeScript interfaces for MCP tools

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

export interface Image {
  id: string;
  filename: string;
  category: string;
  tags: string[];
  description: string;
  photographer: string;
  license: string;
  resolution: string;
  path: string;
}

export interface ImageRepository {
  version: string;
  lastUpdated: string;
  images: Image[];
  categories: string[];
  totalImages: number;
}

export interface Partner {
  id: string;
  name: string;
  logoFile: string;
  path: string;
  partnershipLevel: string;
  website: string;
  active: boolean;
}

export interface PartnerLogos {
  version: string;
  lastUpdated: string;
  partners: Partner[];
  partnershipLevels: string[];
  totalPartners: number;
  activePartners: number;
}

export interface Symbol {
  id: string;
  name: string;
  filename: string;
  path: string;
  tags: string[];
  description: string;
}

export interface SlideContent {
  slideNumber: number;
  slideType: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  imageId?: string;
  partnerLogos?: string[];
  photoCredits?: string[];
}

export interface SlidePlan {
  title: string;
  subtitle?: string;
  presenter?: string;
  date?: string;
  slides: SlideContent[];
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

export interface PresentationResult {
  success: boolean;
  outputPath: string;
  message: string;
  slideCount: number;
}