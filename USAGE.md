# WWF Presentation Generator - Usage Guide

## Overview

This TypeScript-based presentation generator creates WWF-style PowerPoint presentations (PPTX files) using the `pptxgenjs` library. The system includes four slide types with brand-compliant styling.

## Generated Presentation Structure

The demo presentation (`output/demo.pptx`) includes:

1. **Title Slide** - Main title and subtitle with WWF branding
2. **Content Slide** - Headline with bullet points
3. **Image Slide** - Image placeholder with attribution
4. **Closing Slide** - Thank you message

## Slide Functions

### 1. `addTitleSlide(pptx, slideData)`

Creates a title slide with title and subtitle.

**Parameters:**
- `pptx`: Presentation instance
- `slideData`: 
  - `title` (string): Main title text
  - `subtitle` (string): Subtitle text

**Example:**
```typescript
await addTitleSlide(pptx, {
  title: "WWF Presentation POC",
  subtitle: "Automated Presentation Generation System"
});
```

### 2. `addContentSlide(pptx, slideData)`

Creates a content slide with headline and bullet points.

**Parameters:**
- `pptx`: Presentation instance
- `slideData`:
  - `headline` (string): Slide headline
  - `bullets` (string[]): Array of bullet point texts

**Example:**
```typescript
await addContentSlide(pptx, {
  headline: "Project Overview",
  bullets: [
    "First bullet point",
    "Second bullet point",
    "Third bullet point"
  ]
});
```

### 3. `addImageSlide(pptx, slideData)`

Creates an image slide with image and attribution.

**Parameters:**
- `pptx`: Presentation instance
- `slideData`:
  - `imagePath` (optional string): Local file path to image
  - `imageUrl` (optional string): URL to image
  - `attribution` (string): Image credit/attribution text
  - `caption` (optional string): Image caption

**Example:**
```typescript
await addImageSlide(pptx, {
  imagePath: "./assets/photo.jpg",
  attribution: "Photo by WWF / John Smith",
  caption: "Wildlife conservation project"
});
```

### 4. `addClosingSlide(pptx, slideData)`

Creates a closing slide with thank you message.

**Parameters:**
- `pptx`: Presentation instance
- `slideData`:
  - `message` (string): Main closing message
  - `subtitle` (optional string): Additional text

**Example:**
```typescript
await addClosingSlide(pptx, {
  message: "Thank You",
  subtitle: "Together we can make a difference"
});
```

## Brand Guidelines

The presentation uses WWF brand guidelines from `data/brand-guidelines.json`:

**Colors:**
- Primary: #000000 (Black)
- Secondary: #FFFFFF (White)
- Accent: #FFD700 (Gold)
- Text Primary: #1A1A1A (Dark Gray)
- Text Secondary: #666666 (Medium Gray)

**Fonts:**
- Headings: Arial Black
- Subheadings: Arial Bold
- Body: Arial
- Captions: Arial Narrow

## Building and Running

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation
```bash
npm install
```

### Build TypeScript
```bash
npm run build
```

### Generate Demo Presentation
```bash
npm start
```

The presentation will be saved to `output/demo.pptx`.

## Customization

### Modifying Brand Guidelines

Edit `data/brand-guidelines.json` to customize:
- Colors (use 6-digit hex codes like #RRGGBB)
- Fonts
- Logo placement
- Slide template settings

### Creating Custom Presentations

Import the slide functions in your own TypeScript file:

```typescript
import pptxgen from "pptxgenjs";
import {
  addTitleSlide,
  addContentSlide,
  addImageSlide,
  addClosingSlide
} from "./slide-generator.js";

async function createCustomPresentation() {
  const pptx = new pptxgen();
  
  // Add your slides
  await addTitleSlide(pptx, {
    title: "Your Title",
    subtitle: "Your Subtitle"
  });
  
  // ... add more slides as needed
  
  // Save the presentation
  await pptx.writeFile({ fileName: "custom.pptx" });
}

createCustomPresentation();
```

## File Structure

```
wwf-presentation-poc/
├── src/
│   ├── ppt-generator/
│   │   ├── index.ts                    # Main entry point
│   │   ├── slide-generator.ts          # Slide creation functions
│   │   ├── slide-plan-manager.ts       # Slide plan management
│   │   └── brand-loader.ts             # Brand guidelines loader
│   ├── web-server/
│   │   └── server.ts                   # Express.js web server
│   └── mcp-server/                     # MCP server implementation
├── public/
│   └── index.html                      # Web interface
├── data/
│   └── brand-guidelines.json           # Brand configuration
├── output/
│   ├── pptx/                           # Generated PPTX files
│   └── slide-plans/                    # Saved slide plans (JSON)
├── dist/                               # Compiled JavaScript
└── package.json
```

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Run `npm run build` to compile TypeScript
   - Ensure you're using `.js` extensions in imports

2. **Color warnings**
   - Use 6-digit hex codes (#RRGGBB) in brand guidelines
   - Avoid color names like "white" or "black"

3. **Image loading errors**
   - Verify image paths are correct
   - Ensure images exist at specified locations

## Slide Plans

Every presentation generated automatically creates a **slide plan** - a JSON file that captures the complete structure of your presentation. Slide plans are saved in `output/slide-plans/` and can be used to:

- **Regenerate presentations** - Create new PPTX files from the same structure
- **Version control** - Track presentation evolution over time
- **Templates** - Reuse successful presentation formats
- **API access** - Load and modify plans programmatically

### Slide Plan API Endpoints

- `GET /api/slide-plans` - List all saved slide plans
- `GET /api/slide-plans/:id` - Get a specific slide plan
- `POST /api/slide-plans/:id/generate` - Generate PPTX from a slide plan
- `DELETE /api/slide-plans/:id` - Delete a slide plan

### Example: Using Slide Plans

```bash
# List all slide plans
curl http://localhost:3000/api/slide-plans

# Get a specific slide plan
curl http://localhost:3000/api/slide-plans/plan-1234567890-abc123

# Generate presentation from slide plan
curl -X POST http://localhost:3000/api/slide-plans/plan-1234567890-abc123/generate
```

## Next Steps

- Integrate with WWF's MCP server for automated content generation
- Add more slide templates (charts, tables, etc.)
- Implement image fetching from WWF's image repository
- Add validation for brand compliance
