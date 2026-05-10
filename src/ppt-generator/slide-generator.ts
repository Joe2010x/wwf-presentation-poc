import pptxgen from "pptxgenjs";
import path from "path";
import fs from "fs/promises";
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

function mimeTypeFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

async function imageSourceToData(source: string): Promise<string> {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());
    return `${contentType};base64,${buffer.toString("base64")}`;
  }

  const absolutePath = path.isAbsolute(source) ? source : path.resolve(process.cwd(), source);
  const buffer = await fs.readFile(absolutePath);
  return `${mimeTypeFromPath(absolutePath)};base64,${buffer.toString("base64")}`;
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
  source?: string; // Optional source attribution for article summaries
}

/**
 * Interface for image slide data
 */
export interface ImageSlideData {
  imagePath?: string;
  imageUrl?: string;
  attribution: string;
  caption?: string;
  searchQuery?: string;    // Keyword for Unsplash search (optional)
  useRandomImage?: boolean; // Use random image with optional keywords (optional)
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

  // Add WWF Logo (top-left as per brand guidelines)
  if (brand.logo?.path) {
    try {
      const logoData = await imageSourceToData(brand.logo.mediumPath || brand.logo.smallPath || brand.logo.path);
      slide.addImage({
        data: logoData,
        x: 0.5,
        y: 0.3,
        w: 1.0,
        h: 1.125,
      });
    } catch (error) {
      console.warn('⚠️ Could not load WWF logo, using placeholder');
      // Fallback to placeholder if logo not found
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 0.3,
        w: 1.0,
        h: 1.125,
        fill: { color: brand.colors.primary },
        rectRadius: 0.1,
      });
    }
  } else {
    // Fallback to placeholder if no logo path configured
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5,
      y: 0.3,
      w: 1.0,
      h: 1.125,
      fill: { color: brand.colors.primary },
      rectRadius: 0.1,
    });
  }

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
  const isArticleSummary = slideData.headline?.startsWith("Article Summary:");
  const sourceFromBullet = slideData.bullets.find(bullet => bullet.trim().toLowerCase().startsWith("source:"));
  const sourceText = slideData.source || sourceFromBullet;
  const bullets = isArticleSummary
    ? slideData.bullets.filter(bullet => !bullet.trim().toLowerCase().startsWith("source:"))
    : slideData.bullets;
  const headlineFontSize = isArticleSummary
    ? slideData.headline.length > 120
      ? 12
      : slideData.headline.length > 90
      ? 14
      : slideData.headline.length > 65
      ? 16
      : 20
    : 24;

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
    y: isArticleSummary ? 0.12 : 0.25,
    w: 9,
    h: isArticleSummary ? 0.75 : 0.5,
    fontSize: headlineFontSize,
    fontFace: brand.fonts.heading,
    color: brand.colors.secondary,
    bold: true,
    breakLine: false,
    fit: "shrink",
  });

  // Add bullet points one by one (reduced font size)
  let yPos = isArticleSummary ? 1.35 : 1.5;
  const lineHeight = isArticleSummary ? 0.78 : 0.65;
  
  for (const bullet of bullets) {
    slide.addText(bullet, {
      x: 0.5,
      y: yPos,
      w: 9,
      h: isArticleSummary ? 0.58 : 0.45,
      fontSize: isArticleSummary ? 15 : 16,
      fontFace: brand.fonts.body,
      color: brand.colors.textPrimary,
      bullet: true,
      lineSpacing: 28,
    });
    yPos += lineHeight;
  }

  // Add source attribution in bottom right corner (if provided)
  if (sourceText) {
    slide.addText(sourceText, {
      x: 4.5,
      y: 5.75,
      w: 4.5,
      h: 0.35,
      fontSize: 8,
      fontFace: brand.fonts.caption,
      color: brand.colors.textSecondary,
      align: "right",
      italic: true,
    });
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
    try {
      const imageData = await imageSourceToData(slideData.imagePath || slideData.imageUrl || "");
      slide.addImage({
        data: imageData,
        x: 1,
        y: 0.5,
        w: 8,
        h: 4.5,
      });
    } catch (error) {
      console.warn(`Could not load slide image, using placeholder: ${error instanceof Error ? error.message : error}`);
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

  // Add WWF Logo (top-left as per brand guidelines)
  if (brand.logo?.path) {
    try {
      const logoData = await imageSourceToData(brand.logo.mediumPath || brand.logo.smallPath || brand.logo.path);
      slide.addImage({
        data: logoData,
        x: 0.5,
        y: 0.3,
        w: 1.0,
        h: 1.125,
      });
    } catch (error) {
      console.warn('⚠️ Could not load WWF logo, using placeholder');
      // Fallback to placeholder if logo not found
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 0.3,
        w: 1.0,
        h: 1.125,
        fill: { color: brand.colors.primary },
        rectRadius: 0.1,
      });
    }
  } else {
    // Fallback to placeholder if no logo path configured
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5,
      y: 0.3,
      w: 1.0,
      h: 1.125,
      fill: { color: brand.colors.primary },
      rectRadius: 0.1,
    });
  }

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
