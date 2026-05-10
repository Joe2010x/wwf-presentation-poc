import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import {
  createPresentationFromConfig,
  PresentationConfig,
  SlideConfig,
} from "../ppt-generator/index.js";
import {
  listSlidePlans,
  loadSlidePlan,
  deleteSlidePlan,
  slidePlanToConfig,
  SlidePlan,
} from "../ppt-generator/slide-plan-manager.js";
import {
  generatePresentationWithRetry,
  LLMPresentationStructure,
} from "../llm/openrouter-client.js";
import {
  search_articles,
  summarize_article,
  get_related_articles,
} from "../mcp-server/tools.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from the public directory
const publicPath = path.join(__dirname, "../../public");
app.use(express.static(publicPath));

// Ensure output directories exist
const outputDir = path.join(__dirname, "../../output");
const pptxDir = path.join(outputDir, "pptx");
const slidePlansDir = path.join(outputDir, "slide-plans");
fs.mkdir(pptxDir, { recursive: true }).catch(console.error);
fs.mkdir(slidePlansDir, { recursive: true }).catch(console.error);

type ArticleSummaryForSlides = {
  title: string;
  summary: string;
  source: string;
  author: string;
  keyPoints: string[];
};

function insertArticleSummarySlides(
  slides: SlideConfig[],
  articleSummaries: ArticleSummaryForSlides[]
): SlideConfig[] {
  if (articleSummaries.length === 0) {
    return slides;
  }

  const summarySlides: SlideConfig[] = articleSummaries.slice(0, 2).map(summary => ({
    type: "content",
    data: {
      headline: `Article Summary: ${summary.title}`,
      bullets: summary.keyPoints.slice(0, 4), // Show up to 4 key points
      source: summary.author && summary.source
        ? `Source: ${summary.author}, ${summary.source}`
        : summary.author
        ? `Source: ${summary.author}`
        : summary.source
        ? `Source: ${summary.source}`
        : undefined
    }
  }));

  let closingIndex = -1;
  for (let i = slides.length - 1; i >= 0; i--) {
    if (slides[i].type === "closing") {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex >= 0) {
    return [
      ...slides.slice(0, closingIndex),
      ...summarySlides,
      ...slides.slice(closingIndex)
    ];
  }

  return [...slides, ...summarySlides];
}

/**
 * POST /api/generate
 * Generate a presentation from JSON configuration
 */
app.post("/api/generate", async (req, res) => {
  console.log(`\n📥 POST /api/generate - Request received`);
  console.log(`   Title: ${req.body?.title || '(missing)'}`);
  console.log(`   Slides: ${req.body?.slides?.length || 0}`);

  try {
    const config: PresentationConfig = req.body;

    // Validate required fields
    if (!config.title) {
      console.log(`   ❌ Validation failed: Missing title`);
      return res.status(400).json({ error: "Presentation title is required" });
    }

    if (!config.slides || config.slides.length === 0) {
      console.log(`   ❌ Validation failed: No slides provided`);
      return res.status(400).json({ error: "At least one slide is required" });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `presentation-${timestamp}.pptx`;

    // Create a modified config with the unique filename
    const modifiedConfig: PresentationConfig = {
      ...config,
      output: filename,
    };

    // Generate the presentation
    console.log(`   🚀 Starting presentation generation...`);
    const result = await createPresentationFromConfig(modifiedConfig);
    console.log(`   ✅ Generation complete`);

    // Return success response
    res.json({
      success: true,
      filename: filename,
      downloadUrl: `/api/download/${filename}`,
      slidePlanId: result.slidePlan.id,
      message: "Presentation generated successfully!",
    });
    console.log(`   📤 Response sent to client`);
  } catch (error) {
    console.error(`   ❌ Error generating presentation:`, error);
    res.status(500).json({
      error: "Failed to generate presentation",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/generate-from-prompt
 * Generate a presentation by first asking the LLM for slide structure
 * Automatically includes relevant article summaries when available
 */
app.post("/api/generate-from-prompt", async (req, res) => {
  console.log(`\n📥 POST /api/generate-from-prompt - Request received`);
  console.log(`   Prompt: ${req.body?.prompt?.substring(0, 100) || '(missing)'}...`);
  console.log(`   Temperature: ${req.body?.temperature || 0.9}`);
  console.log(`   Include Articles: ${req.body?.includeArticles !== false}`);

  try {
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
    const includeArticles = req.body?.includeArticles === true; // Default to false

    if (!prompt) {
      console.log(`   ❌ Validation failed: Missing prompt`);
      return res.status(400).json({ error: "Prompt is required" });
    }

    const rawTemperature = Number(req.body?.temperature);
    const temperature = Number.isFinite(rawTemperature)
      ? Math.min(Math.max(rawTemperature, 0), 2)
      : 0.9;

    // Step 1: Search for relevant articles if requested
    let articleSummaries: ArticleSummaryForSlides[] = [];
    
    if (includeArticles) {
      try {
        console.log(`   📚 Searching for relevant articles...`);
        const relevantArticles = await search_articles(prompt, 3);
        
        if (relevantArticles.length > 0) {
          console.log(`   📚 Found ${relevantArticles.length} relevant articles`);
          
          for (const article of relevantArticles) {
            try {
              const summary = await summarize_article(article.id, { 
                style: 'bullet', 
                maxLength: 100 
              });
              articleSummaries.push({
                title: summary.title,
                summary: summary.keyPoints.join('\n'),
                source: summary.sourceUrl,
                author: summary.author,
                keyPoints: summary.keyPoints
              });
              console.log(`   ✅ Summarized: ${article.title}`);
            } catch (err) {
              console.warn(`   ⚠️ Could not summarize article ${article.id}: ${err instanceof Error ? err.message : err}`);
            }
          }
        } else {
          console.log(`   📚 No relevant articles found for this topic`);
        }
      } catch (err) {
        console.warn(`   ⚠️ Article search failed: ${err instanceof Error ? err.message : err}`);
      }
    }

    // Step 2: Generate presentation structure from LLM (with article context if available)
    let llmPrompt = prompt;
    if (articleSummaries.length > 0) {
      const articleContext = articleSummaries
        .map((s, i) => `Article ${i + 1}: ${s.title}\nKey points: ${s.keyPoints.join('; ')}`)
        .join('\n\n');
      
      llmPrompt = `${prompt}\n\nRelevant Articles for Reference:\n${articleContext}\n\nPlease incorporate key information from these articles into the presentation slides where relevant, include article summary content, and include proper attribution.`;
      console.log(`   📊 Enhanced prompt with ${articleSummaries.length} article summaries`);
    }

    console.log(`   🤖 Sending request to OpenRouter API...`);
    const llmPresentation: LLMPresentationStructure =
      await generatePresentationWithRetry(llmPrompt, temperature);
    console.log(`   ✅ Received LLM response: ${llmPresentation.title}`);
    console.log(`   📊 Generated ${llmPresentation.slides.length} slides from prompt`);

    const timestamp = Date.now();
    const filename = `presentation-${timestamp}.pptx`;

    const config: PresentationConfig = {
      title: llmPresentation.title,
      subtitle: llmPresentation.subtitle,
      slides: insertArticleSummarySlides(llmPresentation.slides as SlideConfig[], articleSummaries),
      output: filename,
    };

    // Generate the presentation
    console.log(`   🚀 Starting presentation generation...`);
    const result = await createPresentationFromConfig(config);
    console.log(`   ✅ Generation complete`);

    res.json({
      success: true,
      filename,
      downloadUrl: `/api/download/${filename}`,
      slidePlanId: result.slidePlan.id,
      presentation: {
        ...llmPresentation,
        slides: config.slides,
      },
      articlesIncluded: articleSummaries.length,
      articles: articleSummaries,
      message: `Presentation generated from prompt${articleSummaries.length > 0 ? ` with ${articleSummaries.length} article summaries` : '!'}`,
    });
    console.log(`   📤 Response sent to client`);
  } catch (error) {
    console.error(`   ❌ Error generating presentation from prompt:`, error);
    res.status(500).json({
      error: "Failed to generate presentation from prompt",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/download/:filename
 * Download a generated presentation
 */
app.get("/api/download/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(pptxDir, filename);

    // Check if file exists
    await fs.access(filePath);

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");

    // Stream the file
    const fileStream = await fs.open(filePath, "r");
    const stat = await fileStream.stat();
    
    res.setHeader("Content-Length", stat.size);
    
    const readStream = fileStream.createReadStream();
    readStream.pipe(res);
    
    readStream.on("end", () => {
      fileStream.close();
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(404).json({ error: "File not found" });
  }
});

/**
 * GET /api/slide-plans
 * List all saved slide plans
 */
app.get("/api/slide-plans", async (req, res) => {
  try {
    const slidePlans = await listSlidePlans();
    res.json(slidePlans);
  } catch (error) {
    console.error("Error listing slide plans:", error);
    res.status(500).json({ error: "Failed to list slide plans" });
  }
});

/**
 * GET /api/slide-plans/:id
 * Get a specific slide plan
 */
app.get("/api/slide-plans/:id", async (req, res) => {
  try {
    const slidePlan = await loadSlidePlan(req.params.id);
    if (slidePlan) {
      res.json(slidePlan);
    } else {
      res.status(404).json({ error: "Slide plan not found" });
    }
  } catch (error) {
    console.error("Error loading slide plan:", error);
    res.status(500).json({ error: "Failed to load slide plan" });
  }
});

/**
 * POST /api/slide-plans/:id/generate
 * Generate a presentation from an existing slide plan
 */
app.post("/api/slide-plans/:id/generate", async (req, res) => {
  try {
    const slidePlan = await loadSlidePlan(req.params.id);
    if (!slidePlan) {
      return res.status(404).json({ error: "Slide plan not found" });
    }

    const config = slidePlanToConfig(slidePlan);
    const result = await createPresentationFromConfig(config);

    res.json({
      success: true,
      filename: result.filename,
      downloadUrl: `/api/download/${result.filename}`,
      slidePlanId: result.slidePlan.id,
      message: "Presentation generated from slide plan!",
    });
  } catch (error) {
    console.error("Error generating from slide plan:", error);
    res.status(500).json({
      error: "Failed to generate presentation from slide plan",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * DELETE /api/slide-plans/:id
 * Delete a slide plan
 */
app.delete("/api/slide-plans/:id", async (req, res) => {
  try {
    const deleted = await deleteSlidePlan(req.params.id);
    if (deleted) {
      res.json({ success: true, message: "Slide plan deleted" });
    } else {
      res.status(404).json({ error: "Slide plan not found" });
    }
  } catch (error) {
    console.error("Error deleting slide plan:", error);
    res.status(500).json({ error: "Failed to delete slide plan" });
  }
});

/**
 * GET /api/templates
 * Get available presentation templates
 */
app.get("/api/templates", (req, res) => {
  const templates = [
    {
      id: "ocean-pollution",
      name: "Ocean Pollution Crisis",
      description: "A presentation about ocean pollution and conservation",
      config: {
        title: "Ocean Pollution Crisis",
        subtitle: "Protecting Our Seas for Future Generations",
        slides: [
          {
            type: "title" as const,
            data: {
              title: "Ocean Pollution Crisis",
              subtitle: "Protecting Our Seas for Future Generations",
            },
          },
          {
            type: "content" as const,
            data: {
              headline: "The Scale of the Problem",
              bullets: [
                "8 million tons of plastic enter oceans annually",
                "Over 700 marine species are affected",
                "By 2050, there could be more plastic than fish",
                "Ocean acidification threatens ecosystems",
                "Microplastics found in 90% of seabirds",
              ],
            },
          },
          {
            type: "image" as const,
            data: {
              attribution: "Will be auto-filled from Unsplash",
              caption: "Marine life affected by pollution",
              searchQuery: "ocean pollution marine life plastic",
            },
          },
          {
            type: "closing" as const,
            data: {
              message: "Act Now for Our Oceans",
              subtitle: "Every Action Counts",
            },
          },
        ],
      },
    },
    {
      id: "climate-change",
      name: "Climate Change Action",
      description: "A presentation about climate change and solutions",
      config: {
        title: "Climate Change Action",
        subtitle: "Building a Sustainable Future",
        slides: [
          {
            type: "title" as const,
            data: {
              title: "Climate Change Action",
              subtitle: "Building a Sustainable Future",
            },
          },
          {
            type: "content" as const,
            data: {
              headline: "The Climate Crisis",
              bullets: [
                "Global temperatures rising at unprecedented rates",
                "Extreme weather events becoming more frequent",
                "Sea levels rising threatening coastal communities",
                "Biodiversity loss accelerating worldwide",
                "Urgent action needed to limit warming to 1.5°C",
              ],
            },
          },
          {
            type: "content" as const,
            data: {
              headline: "Solutions We Can Implement",
              bullets: [
                "Transition to renewable energy sources",
                "Improve energy efficiency in buildings",
                "Protect and restore forests",
                "Adopt sustainable transportation",
                "Support climate-friendly policies",
              ],
            },
          },
          {
            type: "closing" as const,
            data: {
              message: "Together for Climate Action",
              subtitle: "The Time to Act is Now",
            },
          },
        ],
      },
    },
    {
      id: "wildlife-conservation",
      name: "Wildlife Conservation",
      description: "A presentation about protecting endangered species",
      config: {
        title: "Wildlife Conservation",
        subtitle: "Protecting Endangered Species",
        slides: [
          {
            type: "title" as const,
            data: {
              title: "Wildlife Conservation",
              subtitle: "Protecting Endangered Species",
            },
          },
          {
            type: "content" as const,
            data: {
              headline: "Species at Risk",
              bullets: [
                "Over 41,000 species threatened with extinction",
                "Wildlife populations declined 69% since 1970",
                "Habitat loss is the primary threat",
                "Climate change exacerbating the crisis",
                "Poaching and illegal trade continue",
              ],
            },
          },
          {
            type: "image" as const,
            data: {
              attribution: "Will be auto-filled from Unsplash",
              caption: "Endangered species need our protection",
              searchQuery: "endangered species wildlife conservation",
            },
          },
          {
            type: "closing" as const,
            data: {
              message: "Save Wildlife, Save Our Planet",
              subtitle: "Every Species Matters",
            },
          },
        ],
      },
    },
  ];

  res.json(templates);
});

/**
 * GET /
 * Serve the main HTML page
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 WWF Presentation Generator Web Server`);
  console.log(`📡 Server running at: http://localhost:${PORT}`);
  console.log(`📝 API endpoint: http://localhost:${PORT}/api/generate`);
  console.log(`🎨 Web interface: http://localhost:${PORT}`);
  console.log(`📂 Output directory: ${outputDir}`);
});

export default app;
