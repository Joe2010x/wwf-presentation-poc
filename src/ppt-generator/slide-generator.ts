import pptxgen from "pptxgenjs";
import { loadBrandGuidelines, BrandGuidelines } from "./brand-loader.js";

// Type alias for pptxgenjs presentation instance
type PptxPresentation = any;
type PptxSlide = any;

// Cache for brand guidelines to avoid repeated file reads
let cachedBrandGuidelines: BrandGuidelines | null = null;

/**
 * Get brand guidelines, loading from file if not cached
 */
async function getBrandGuidelines(): Promise<BrandGuidelines> {
  if (!cachedBrandGuidelines) {
    cachedBrandGuidelines = await loadBrandGuidelines();
  }
  return cachedBrandGuidelines;
}

/**
 * Interface for title slide data
 */
export interface TitleSlideData {
  title: string;
  subtitle: string;
}

/**
 * Interface for content slide data
 */
export interface ContentSlideData {
  headline: string;
  bullets: string[];
}

/**
 * Interface for image slide data
 */
export interface ImageSlideData {
  imagePath?: string;
  imageUrl?: string;
  attribution: string;
  caption?: string;
}

/**
 * Interface for closing slide data
 */
export interface ClosingSlideData {
  message: string;
  subtitle?: string;
}

/**
 * Add a title slide with title and subtitle
 */
export async function addTitleSlide(
  pptx: PptxPresentation,
  slideData: TitleSlideData
): Promise<PptxSlide> {
  const brand = await getBrandGuidelines();
  const slide = pptx.addSlide();

  // Set background color
  slide.background = { color: brand.slideTemplates.titleSlide.background };

  // Add logo placeholder (top-left as per brand guidelines)
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 0.5,
    w: 1.5,
    h: 0.75,
    fill: { color: brand.colors.primary },
    rectRadius: 0.1,
  });

  // Add title text
  slide.addText(slideData.title, {
    x: 1,
    y: 2.5,
    w: 8,
    h: 1.5,
    fontSize: 44,
    fontFace: brand.fonts.heading,
    color: brand.colors.primary,
    bold: true,
    align: "center",
  });

  // Add subtitle text
  slide.addText(slideData.subtitle, {
    x: 1,
    y: 4.2,
    w: 8,
    h: 0.8,
    fontSize: 24,
    fontFace: brand.fonts.subheading,
    color: brand.colors.textSecondary,
    align: "center",
  });

  // Add accent line at bottom
  slide.addShape(pptx.ShapeType.rect, {
    x: 1,
    y: 6.5,
    w: 8,
    h: 0.2,
    fill: { color: brand.colors.accent },
  });

  return slide;
}

/**
 * Add a content slide with headline and bullet points
 */
export async function addContentSlide(
  pptx: PptxPresentation,
  slideData: ContentSlideData
): Promise<PptxSlide> {
  const brand = await getBrandGuidelines();
  const slide = pptx.addSlide();

  // Set background color
  slide.background = { color: brand.slideTemplates.contentSlide.background };

  // Add header bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 10,
    h: 1,
    fill: { color: brand.colors.primary },
  });

  // Add headline in header
  slide.addText(slideData.headline, {
    x: 0.5,
    y: 0.25,
    w: 9,
    h: 0.5,
    fontSize: 28,
    fontFace: brand.fonts.heading,
    color: brand.colors.secondary,
    bold: true,
  });

  // Add bullet points one by one
  let yPos = 1.5;
  const lineHeight = 0.7;
  
  for (const bullet of slideData.bullets) {
    slide.addText(bullet, {
      x: 0.5,
      y: yPos,
      w: 9,
      h: 0.5,
      fontSize: 18,
      fontFace: brand.fonts.body,
      color: brand.colors.textPrimary,
      bullet: true,
      lineSpacing: 30,
    });
    yPos += lineHeight;
  }

  // Add footer with accent color
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 6.8,
    w: 10,
    h: 0.2,
    fill: { color: brand.colors.accent },
  });

  return slide;
}

/**
 * Add an image slide with image and attribution
 */
export async function addImageSlide(
  pptx: PptxPresentation,
  slideData: ImageSlideData
): Promise<PptxSlide> {
  const brand = await getBrandGuidelines();
  const slide = pptx.addSlide();

  // Set background color (black for image slides per brand guidelines)
  slide.background = { color: brand.slideTemplates.imageSlide.background };

  // Add image (use placeholder if no image provided)
  if (slideData.imagePath || slideData.imageUrl) {
    slide.addImage({
      path: slideData.imagePath || slideData.imageUrl,
      x: 1,
      y: 0.5,
      w: 8,
      h: 4.5,
    });
  } else {
    // Add placeholder rectangle for image
    slide.addShape(pptx.ShapeType.rect, {
      x: 1,
      y: 0.5,
      w: 8,
      h: 4.5,
      fill: { color: "#333333" },
      line: { color: brand.colors.accent, width: 2 },
    });

    slide.addText("[Image Placeholder]", {
      x: 1,
      y: 2.5,
      w: 8,
      h: 0.5,
      fontSize: 20,
      fontFace: brand.fonts.body,
      color: "#999999",
      align: "center",
    });
  }

  // Add caption if provided
  if (slideData.caption) {
    slide.addText(slideData.caption, {
      x: 1,
      y: 5.2,
      w: 8,
      h: 0.4,
      fontSize: 14,
      fontFace: brand.fonts.caption,
      color: "#CCCCCC",
      align: "center",
    });
  }

  // Add attribution
  slide.addText(slideData.attribution, {
    x: 1,
    y: 5.8,
    w: 8,
    h: 0.3,
    fontSize: 12,
    fontFace: brand.fonts.caption,
    color: "#888888",
    align: "center",
    italic: true,
  });

  // Add accent line
  slide.addShape(pptx.ShapeType.rect, {
    x: 1,
    y: 6.3,
    w: 8,
    h: 0.15,
    fill: { color: brand.colors.accent },
  });

  return slide;
}

/**
 * Add a closing slide with thank you message
 */
export async function addClosingSlide(
  pptx: PptxPresentation,
  slideData: ClosingSlideData
): Promise<PptxSlide> {
  const brand = await getBrandGuidelines();
  const slide = pptx.addSlide();

  // Set background color
  slide.background = { color: brand.slideTemplates.titleSlide.background };

  // Add logo placeholder (top-left as per brand guidelines)
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5,
    y: 0.5,
    w: 1.5,
    h: 0.75,
    fill: { color: brand.colors.primary },
    rectRadius: 0.1,
  });

  // Add main message
  slide.addText(slideData.message, {
    x: 1,
    y: 2.5,
    w: 8,
    h: 1.5,
    fontSize: 44,
    fontFace: brand.fonts.heading,
    color: brand.colors.primary,
    bold: true,
    align: "center",
  });

  // Add subtitle if provided
  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 1,
      y: 4.2,
      w: 8,
      h: 0.8,
      fontSize: 24,
      fontFace: brand.fonts.subheading,
      color: brand.colors.textSecondary,
      align: "center",
    });
  }

  // Add accent line at bottom
  slide.addShape(pptx.ShapeType.rect, {
    x: 1,
    y: 6.5,
    w: 8,
    h: 0.2,
    fill: { color: brand.colors.accent },
  });

  return slide;
}