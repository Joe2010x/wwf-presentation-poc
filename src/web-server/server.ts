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

/**
 * POST /api/generate
 * Generate a presentation from JSON configuration
 */
app.post("/api/generate", async (req, res) => {
  try {
    const config: PresentationConfig = req.body;

    // Validate required fields
    if (!config.title) {
      return res.status(400).json({ error: "Presentation title is required" });
    }

    if (!config.slides || config.slides.length === 0) {
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
    const result = await createPresentationFromConfig(modifiedConfig);

    // Return success response
    res.json({
      success: true,
      filename: filename,
      downloadUrl: `/api/download/${filename}`,
      slidePlanId: result.slidePlan.id,
      message: "Presentation generated successfully!",
    });
  } catch (error) {
    console.error("Error generating presentation:", error);
    res.status(500).json({
      error: "Failed to generate presentation",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/generate-from-prompt
 * Generate a presentation by first asking the LLM for slide structure
 */
app.post("/api/generate-from-prompt", async (req, res) => {
  try {
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const llmPresentation: LLMPresentationStructure =
      await generatePresentationWithRetry(prompt);

    const timestamp = Date.now();
    const filename = `presentation-${timestamp}.pptx`;

    const config: PresentationConfig = {
      title: llmPresentation.title,
      subtitle: llmPresentation.subtitle,
      slides: llmPresentation.slides as SlideConfig[],
      output: filename,
    };

    const result = await createPresentationFromConfig(config);

    res.json({
      success: true,
      filename,
      downloadUrl: `/api/download/${filename}`,
      slidePlanId: result.slidePlan.id,
      presentation: llmPresentation,
      message: "Presentation generated from prompt!",
    });
  } catch (error) {
    console.error("Error generating presentation from prompt:", error);
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
              attribution: "Photo: WWF / Ocean Conservation",
              caption: "Marine life affected by pollution",
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
              attribution: "Photo: WWF Conservation",
              caption: "Endangered species need our protection",
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
