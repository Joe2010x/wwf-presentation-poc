import pptxgen from "pptxgenjs";
import path from "path";
import fs from "fs/promises";
import { addTitleSlide, addContentSlide, addImageSlide, addClosingSlide, } from "./slide-generator.js";
import { createSlidePlan, configToSlidePlanItems, } from "./slide-plan-manager.js";
import { processSlidesWithUnsplash, } from "./unsplash-helper.js";
/**
 * Parse command-line arguments into a PresentationConfig
 */
function parseArguments(args) {
    const argMap = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith("--")) {
            const [key, ...valueParts] = arg.substring(2).split("=");
            const value = valueParts.join("=").replace(/^["']|["']$/g, "");
            argMap[key] = value;
        }
    }
    // Check if we have minimum required arguments
    if (!argMap.title && !argMap.slides) {
        return null;
    }
    // Parse slides array if provided
    let slides = [];
    if (argMap.slides) {
        try {
            slides = JSON.parse(argMap.slides);
        }
        catch (error) {
            console.error("Error parsing slides JSON:", error);
            process.exit(1);
        }
    }
    // If no slides provided but title is given, create a simple title slide
    if (slides.length === 0 && argMap.title) {
        slides.push({
            type: "title",
            data: {
                title: argMap.title,
                subtitle: argMap.subtitle || "",
            },
        });
    }
    return {
        title: argMap.title || "Presentation",
        subtitle: argMap.subtitle,
        slides,
        output: argMap.output || "presentation.pptx",
    };
}
/**
 * Create a presentation from configuration
 */
async function createPresentationFromConfig(config) {
    console.log(`\n🎬 Creating presentation: "${config.title}"...`);
    console.log(`   Subtitle: ${config.subtitle || '(none)'}`);
    console.log(`   Slides: ${config.slides.length}`);
    try {
        // Step 1: Create and save slide plan
        console.log(`\n📋 Step 1/4: Creating slide plan...`);
        const slidePlanItems = configToSlidePlanItems(config);
        const slidePlan = await createSlidePlan(config.title, slidePlanItems, config.subtitle, "WWF Presentation Generator", "World Wildlife Fund");
        console.log(`✅ Slide plan created with ID: ${slidePlan.id}`);
        // Step 2: Process slides with Unsplash (convert to SlideWithImage format)
        console.log(`\n🔍 Step 2/4: Processing slides for Unsplash images...`);
        const slidesWithImage = config.slides.map(slide => ({
            type: slide.type,
            data: slide.data
        }));
        // Process slides to fetch Unsplash images where needed
        const processedSlides = await processSlidesWithUnsplash(slidesWithImage);
        console.log(`✅ Processed ${processedSlides.length} slides`);
        // Convert back to SlideConfig format
        const processedConfigs = processedSlides.map(slide => ({
            type: slide.type,
            data: slide.data
        }));
        // Step 3: Create the presentation
        console.log(`\n📝 Step 3/4: Building presentation slides...`);
        const pptx = new pptxgen();
        // Set presentation properties
        pptx.title = config.title;
        pptx.author = "WWF Presentation Generator";
        pptx.company = "World Wildlife Fund";
        pptx.subject = config.title;
        // Process each slide
        for (let i = 0; i < processedConfigs.length; i++) {
            const slideConfig = processedConfigs[i];
            console.log(`   📝 Adding slide ${i + 1}/${processedConfigs.length}: ${slideConfig.type}`);
            switch (slideConfig.type) {
                case "title":
                    await addTitleSlide(pptx, slideConfig.data);
                    break;
                case "content":
                    await addContentSlide(pptx, slideConfig.data);
                    break;
                case "image":
                    await addImageSlide(pptx, slideConfig.data);
                    break;
                case "closing":
                    await addClosingSlide(pptx, slideConfig.data);
                    break;
                default:
                    console.warn(`   ⚠️ Unknown slide type: ${slideConfig.type}`);
            }
        }
        console.log(`✅ All slides added to presentation`);
        // Ensure output directories exist
        const outputDir = path.resolve(process.cwd(), "output");
        const pptxDir = path.join(outputDir, "pptx");
        await fs.mkdir(pptxDir, { recursive: true });
        // Step 4: Save the presentation
        console.log(`\n💾 Step 4/4: Saving presentation...`);
        const filename = config.output || `presentation-${Date.now()}.pptx`;
        const outputPath = path.join(pptxDir, filename);
        console.log(`   Output path: ${outputPath}`);
        // Generate the PPTX file and save it to the correct location
        console.log(`   Generating PPTX file...`);
        const arrayBuffer = await pptx.write("arraybuffer");
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(outputPath, buffer);
        console.log(`   File size: ${(buffer.length / 1024).toFixed(1)} KB`);
        console.log(`\n✅ Presentation created successfully!`);
        console.log(`📄 File saved as: output/pptx/${filename}`);
        console.log(`📋 Slide plan saved as: output/slide-plans/${slidePlan.id}.json`);
        return { slidePlan, filename };
    }
    catch (error) {
        console.error(`\n❌ Error creating presentation:`, error);
        throw error;
    }
}
/**
 * Main demo presentation (when no arguments provided)
 */
async function createDemoPresentation() {
    console.log("🎬 Creating WWF-style presentation demo...");
    try {
        const pptx = new pptxgen();
        // Set presentation properties
        pptx.title = "WWF Presentation POC";
        pptx.author = "WWF Demo Generator";
        pptx.company = "World Wildlife Fund";
        pptx.subject = "Presentation Generator Proof of Concept";
        // Slide 1: Title Slide
        console.log("📝 Adding title slide...");
        await addTitleSlide(pptx, {
            title: "WWF Presentation POC",
            subtitle: "Automated Presentation Generation System",
        });
        // Slide 2: Content Slide with bullets
        console.log("📝 Adding content slide...");
        await addContentSlide(pptx, {
            headline: "Project Overview",
            bullets: [
                "Automated PowerPoint generation using TypeScript",
                "Brand-compliant slide templates",
                "Integration with WWF design guidelines",
                "Support for multiple slide types",
                "Extensible architecture for future enhancements",
            ],
        });
        // Slide 3: Image Slide
        console.log("📝 Adding image slide...");
        await addImageSlide(pptx, {
            // No image path provided, will show placeholder
            attribution: "Image courtesy of WWF / Demo Purpose Only",
            caption: "WWF Conservation Project Example",
        });
        // Slide 4: Closing Slide
        console.log("📝 Adding closing slide...");
        await addClosingSlide(pptx, {
            message: "Thank You",
            subtitle: "Together we can make a difference",
        });
        // Ensure output directory exists
        const outputDir = path.resolve(process.cwd(), "output");
        await fs.mkdir(outputDir, { recursive: true });
        console.log(`💾 Saving presentation to: ${outputDir}`);
        // Use the library's writeFile method
        await pptx.writeFile({ fileName: path.join(outputDir, "demo.pptx") });
        console.log("✅ Presentation created successfully!");
        console.log(`📄 File saved as: output/demo.pptx`);
    }
    catch (error) {
        console.error("❌ Error creating presentation:", error);
        throw error;
    }
}
/**
 * Display usage help
 */
function showHelp() {
    console.log(`
WWF Presentation Generator - Command Line Usage

Usage:
  npm start -- [options]

Options:
  --title="Presentation Title"     Title of the presentation
  --subtitle="Subtitle text"       Subtitle (optional)
  --slides='[...]'                 JSON array of slide configurations
  --output="filename.pptx"         Output filename (default: presentation.pptx)
  --help                           Show this help message

Slide Types:
  1. Title Slide:
     {"type":"title","data":{"title":"Main Title","subtitle":"Subtitle"}}

  2. Content Slide:
     {"type":"content","data":{"headline":"Headline","bullets":["Point 1","Point 2"]}}

  3. Image Slide:
     {"type":"image","data":{"attribution":"Credit","caption":"Caption","imagePath":"path/to/image.jpg"}}

  4. Closing Slide:
     {"type":"closing","data":{"message":"Thank You","subtitle":"Optional subtitle"}}

Examples:

  1. Simple title slide:
     npm start -- --title="My Presentation"

  2. Ocean pollution presentation:
     npm start -- --title="Ocean Pollution Crisis" --subtitle="Protecting Our Seas" --slides='[
       {"type":"title","data":{"title":"Ocean Pollution Crisis","subtitle":"Protecting Our Seas"}},
       {"type":"content","data":{"headline":"The Scale of the Problem","bullets":["8 million tons of plastic enter oceans annually","Over 700 marine species are affected","By 2050, there could be more plastic than fish"]}},
       {"type":"image","data":{"attribution":"Photo: WWF / Ocean Conservation","caption":"Marine life affected by pollution"}},
       {"type":"closing","data":{"message":"Act Now for Our Oceans","subtitle":"Every Action Counts"}}
     ]' --output="ocean-pollution.pptx"

  3. Run demo (no arguments):
     npm start
`);
}
// Main execution
const args = process.argv.slice(2);
// Check for help flag
if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(0);
}
// Check if we have arguments for custom presentation
const hasCustomArgs = args.some((arg) => arg.startsWith("--title=") ||
    arg.startsWith("--slides=") ||
    arg.startsWith("--output="));
if (hasCustomArgs) {
    // Parse and create custom presentation
    const config = parseArguments(args);
    if (config) {
        createPresentationFromConfig(config)
            .then(() => {
            console.log("Presentation generation completed!");
            process.exit(0);
        })
            .catch((error) => {
            console.error("Failed to generate presentation:", error);
            process.exit(1);
        });
    }
    else {
        console.error("Invalid arguments. Use --help for usage information.");
        process.exit(1);
    }
}
else if (args.includes("--demo")) {
    // Run demo presentation only when explicitly requested
    createDemoPresentation()
        .then(() => {
        console.log("Demo completed successfully!");
        process.exit(0);
    })
        .catch((error) => {
        console.error("Demo failed:", error);
        process.exit(1);
    });
}
// If no arguments, do nothing (server will handle it)
export { createDemoPresentation, createPresentationFromConfig };
//# sourceMappingURL=index.js.map