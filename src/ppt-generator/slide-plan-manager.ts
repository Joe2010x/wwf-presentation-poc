import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Slide plan interface for saving presentation structure
 */
export interface SlidePlan {
  id: string;
  title: string;
  subtitle?: string;
  createdAt: string;
  slides: SlidePlanItem[];
  metadata: {
    author: string;
    company: string;
    totalSlides: number;
  };
}

export interface SlidePlanItem {
  type: "title" | "content" | "image" | "closing";
  order: number;
  content: Record<string, any>;
}

/**
 * Directory where slide plans are stored
 */
const SLIDE_PLANS_DIR = path.resolve(__dirname, "../../output/slide-plans");

/**
 * Ensure slide plans directory exists
 */
async function ensureSlidePlansDir(): Promise<void> {
  await fs.mkdir(SLIDE_PLANS_DIR, { recursive: true });
}

/**
 * Generate a unique ID for slide plans
 */
function generateId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Create and save a new slide plan
 */
export async function createSlidePlan(
  title: string,
  slides: SlidePlanItem[],
  subtitle?: string,
  author: string = "WWF Presentation Generator",
  company: string = "World Wildlife Fund"
): Promise<SlidePlan> {
  await ensureSlidePlansDir();

  const slidePlan: SlidePlan = {
    id: generateId(),
    title,
    subtitle,
    createdAt: new Date().toISOString(),
    slides: slides.map((slide, index) => ({
      ...slide,
      order: index + 1,
    })),
    metadata: {
      author,
      company,
      totalSlides: slides.length,
    },
  };

  const filePath = path.join(SLIDE_PLANS_DIR, `${slidePlan.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(slidePlan, null, 2), "utf-8");

  console.log(`📋 Slide plan saved: ${filePath}`);

  return slidePlan;
}

/**
 * Load a slide plan by ID
 */
export async function loadSlidePlan(id: string): Promise<SlidePlan | null> {
  try {
    const filePath = path.join(SLIDE_PLANS_DIR, `${id}.json`);
    const fileContents = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContents) as SlidePlan;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

/**
 * List all slide plans
 */
export async function listSlidePlans(): Promise<SlidePlan[]> {
  try {
    await ensureSlidePlansDir();
    const files = await fs.readdir(SLIDE_PLANS_DIR);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    const slidePlans: SlidePlan[] = [];
    for (const file of jsonFiles) {
      const filePath = path.join(SLIDE_PLANS_DIR, file);
      const fileContents = await fs.readFile(filePath, "utf-8");
      slidePlans.push(JSON.parse(fileContents) as SlidePlan);
    }

    // Sort by creation date (newest first)
    return slidePlans.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Error listing slide plans:", error);
    return [];
  }
}

/**
 * Delete a slide plan by ID
 */
export async function deleteSlidePlan(id: string): Promise<boolean> {
  try {
    const filePath = path.join(SLIDE_PLANS_DIR, `${id}.json`);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

/**
 * Convert presentation config to slide plan items
 */
export function configToSlidePlanItems(config: any): SlidePlanItem[] {
  return config.slides.map((slide: any) => ({
    type: slide.type,
    content: slide.data,
  }));
}

/**
 * Convert slide plan to presentation config
 */
export function slidePlanToConfig(slidePlan: SlidePlan): any {
  return {
    title: slidePlan.title,
    subtitle: slidePlan.subtitle,
    slides: slidePlan.slides.map((slide) => ({
      type: slide.type,
      data: slide.content,
    })),
  };
}