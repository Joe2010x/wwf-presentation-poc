import dotenv from "dotenv";

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || "http://localhost:3000";
const OPENROUTER_SITE_NAME = process.env.OPENROUTER_SITE_NAME || "WWF Presentation Generator";

if (!OPENROUTER_API_KEY) {
  console.warn("⚠️ OPENROUTER_API_KEY not set in .env file");
}

/**
 * Interface for slide content from LLM
 */
export interface LLMSlideContent {
  type: "title" | "content" | "image" | "closing";
  data: Record<string, any>;
}

/**
 * Interface for presentation structure from LLM
 */
export interface LLMPresentationStructure {
  title: string;
  subtitle?: string;
  slides: LLMSlideContent[];
}

/**
 * System prompt for presentation generation
 */
const SYSTEM_PROMPT = `You are a presentation generator assistant. Your job is to create structured presentation data based on user requests.

You must return a JSON object with the following structure:
{
  "title": "Presentation title",
  "subtitle": "Optional subtitle",
  "slides": [
    {
      "type": "title|content|image|closing",
      "data": {
        // For title slides:
        "title": "Main title",
        "subtitle": "Subtitle text"
        
        // For content slides:
        "headline": "Slide headline",
        "bullets": ["bullet 1", "bullet 2", "bullet 3"]
        
        // For image slides:
        "attribution": "Image credit",
        "caption": "Optional caption",
        "searchQuery": "specific Unsplash search phrase for the image"
        
        // For closing slides:
        "message": "Closing message",
        "subtitle": "Optional subtitle"
      }
    }
  ]
}

Rules:
1. Always include at least 3 slides
2. First slide should be "title" type
3. Last slide should be "closing" type
4. Middle slides should be "content" or "image" type
5. Content slides should have 3-5 bullet points
6. Keep content concise and professional
7. Match the tone and topic requested by the user
8. Image slides must include a short, concrete searchQuery suitable for finding a relevant Unsplash photo

Return ONLY the JSON object, no additional text or explanation.`;

/**
 * Generate presentation structure from natural language prompt
 */
export async function generatePresentationFromPrompt(
  prompt: string,
  temperature: number = 0.9
): Promise<LLMPresentationStructure> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured in .env file");
  }

  const url = "https://openrouter.ai/api/v1/chat/completions";

  const headers = {
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": OPENROUTER_SITE_URL,
    "X-OpenRouter-Title": OPENROUTER_SITE_NAME,
  };

  const body = {
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Create a presentation about: ${prompt}`,
      },
    ],
    temperature,
    max_tokens: 2000,
  };

  try {
    console.log(`🤖 Sending request to OpenRouter API...`);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data: any = await response.json();

    // Extract the content from the response
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from OpenRouter API");
    }

    console.log(`📝 Received response from OpenRouter`);

    // Parse the JSON from the response
    // The LLM might include markdown code blocks, so we need to extract the JSON
    let jsonStr = content.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3);
    }

    jsonStr = jsonStr.trim();

    try {
      const presentation = JSON.parse(jsonStr) as LLMPresentationStructure;

      // Validate the structure
      if (!presentation.title || !presentation.slides || presentation.slides.length === 0) {
        throw new Error("Invalid presentation structure: missing title or slides");
      }

      // Validate each slide
      for (const slide of presentation.slides) {
        if (!slide.type || !slide.data) {
          throw new Error("Invalid slide: missing type or data");
        }
      }

      console.log(`✅ Generated presentation with ${presentation.slides.length} slides`);

      return presentation;
    } catch (parseError) {
      console.error("Failed to parse LLM response:", jsonStr);
      throw new Error(`Failed to parse LLM response as JSON: ${parseError instanceof Error ? parseError.message : parseError}`);
    }
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    throw error;
  }
}

/**
 * Generate a presentation with retry logic
 */
export async function generatePresentationWithRetry(
  prompt: string,
  temperature: number = 0.9,
  maxRetries: number = 2
): Promise<LLMPresentationStructure> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt}...`);
      }

      return await generatePresentationFromPrompt(prompt, temperature);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < maxRetries) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error("Failed to generate presentation after retries");
}
