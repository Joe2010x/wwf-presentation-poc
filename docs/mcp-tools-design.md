m install pptxg# MCP Tools Design Document

## Overview

This document describes the Model Context Protocol (MCP) tools for the WWF Presentation Generator. These tools provide access to brand guidelines, image repositories, partner logos, and presentation generation capabilities.

## Tools

### 1. get_brand_guidelines()

Loads and returns the WWF brand guidelines including colors, fonts, logo usage rules, and slide templates.

**Input:** None

**Output:** `BrandGuidelines` object

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-05-05",
  "colors": {
    "primary": "#000000",
    "secondary": "#FFFFFF",
    "accent": "#FFD700",
    "textPrimary": "#1A1A1A",
    "textSecondary": "#666666"
  },
  "fonts": {
    "heading": "Arial Black",
    "subheading": "Arial Bold",
    "body": "Arial",
    "caption": "Arial Narrow"
  },
  "logoUsage": {
    "minClearSpace": "20px",
    "minWidth": "100px",
    "placement": ["top-left", "bottom-right"]
  },
  "slideTemplates": {
    "titleSlide": {
      "background": "white",
      "logoPosition": "top-left",
      "titlePosition": "center"
    },
    "contentSlide": {
      "background": "white",
      "headerHeight": "60px",
      "footerHeight": "40px"
    },
    "imageSlide": {
      "background": "black",
      "imageOverlay": "rgba(0,0,0,0.3)"
    }
  }
}
```

---

### 2. search_images(query: string)

Searches the image repository by tags, category, or description.

**Input:**
- `query`: Search term (e.g., "plastic pollution", "tiger", "ocean")

**Output:** Array of `Image` objects

**Example:** `search_images("plastic pollution")`

```json
[
  {
    "id": "img_ocean_001",
    "title": "Plastic pollution near coastline",
    "path": "assets/images/ocean-plastic.jpg",
    "photographer": "David Chen",
    "copyright": "© WWF / David Chen",
    "approved": true,
    "tags": ["ocean", "plastic", "pollution", "conservation"]
  }
]
```

**Example:** `search_images("tiger")`

```json
[
  {
    "id": "img_002",
    "title": "Bengal tiger in tropical forest",
    "path": "assets/images/tiger_forest.jpg",
    "photographer": "Maria Garcia",
    "copyright": "© WWF / Maria Garcia",
    "approved": true,
    "tags": ["tiger", "forest", "endangered", "asia"]
  }
]
```

---

### 3. get_image_metadata(image_id: string)

Retrieves detailed metadata for a specific image by ID.

**Input:**
- `image_id`: Unique identifier (e.g., "img_001", "img_ocean_001")

**Output:** `Image` object with full metadata

**Example:** `get_image_metadata("img_001")`

```json
{
  "id": "img_001",
  "title": "Giant panda eating bamboo in natural habitat",
  "path": "assets/images/panda_bamboo.jpg",
  "photographer": "John Smith",
  "copyright": "© WWF / John Smith",
  "approved": true,
  "license": "WWF Internal Use",
  "resolution": "1920x1080",
  "category": "wildlife",
  "tags": ["panda", "bamboo", "endangered", "china"],
  "description": "Giant panda eating bamboo in natural habitat"
}
```

---

### 4. search_symbols(keyword: string)

Searches for WWF symbols/icons by keyword.

**Input:**
- `keyword`: Search term (e.g., "panda", "ocean", "conservation")

**Output:** Array of `Symbol` objects

**Example:** `search_symbols("panda")`

```json
[
  {
    "id": "sym_001",
    "name": "WWF Panda",
    "title": "The iconic WWF panda logo symbol",
    "path": "assets/symbols/panda_symbol.svg",
    "tags": ["panda", "logo", "wwf", "icon"],
    "description": "The iconic WWF panda logo symbol"
  }
]
```

**Example:** `search_symbols("conservation")`

```json
[
  {
    "id": "sym_003",
    "name": "Ocean Wave",
    "title": "Ocean wave conservation symbol",
    "path": "assets/symbols/ocean_wave.svg",
    "tags": ["ocean", "wave", "water", "conservation", "icon"],
    "description": "Ocean wave conservation symbol"
  },
  {
    "id": "sym_004",
    "name": "Leaf",
    "title": "Leaf symbol for environmental conservation",
    "path": "assets/symbols/leaf.svg",
    "tags": ["leaf", "nature", "forest", "environment", "icon"],
    "description": "Leaf symbol for environmental conservation"
  }
]
```

---

### 5. get_partner_logo(partner_name: string)

Retrieves partner logo information by partner organization name.

**Input:**
- `partner_name`: Name of the partner organization (e.g., "Global Conservation Fund")

**Output:** `Partner` object

**Example:** `get_partner_logo("Global Conservation Fund")`

```json
{
  "id": "partner_001",
  "name": "Global Conservation Fund",
  "logoPath": "assets/logos/gcf_logo.png",
  "partnershipLevel": "platinum",
  "website": "https://www.gcf-example.org",
  "active": true
}
```

---

### 6. generate_presentation(slide_plan: SlidePlan)

Generates a 5-slide PowerPoint presentation based on a slide plan.

**Input:** `SlidePlan` object

```json
{
  "title": "Ocean Conservation Initiative",
  "subtitle": "Protecting Our Oceans for Future Generations",
  "presenter": "Jane Doe",
  "date": "2026-05-05",
  "slides": [
    {
      "slideNumber": 1,
      "slideType": "title",
      "title": "Ocean Conservation Initiative"
    },
    {
      "slideNumber": 2,
      "slideType": "content",
      "title": "The Problem",
      "content": "Plastic pollution is devastating marine ecosystems."
    },
    {
      "slideNumber": 3,
      "slideType": "image",
      "title": "Impact on Marine Life",
      "imageId": "img_ocean_001",
      "photoCredits": ["© WWF / David Chen"]
    },
    {
      "slideNumber": 4,
      "slideType": "content",
      "title": "Our Solution",
      "content": "WWF's ocean conservation programs."
    },
    {
      "slideNumber": 5,
      "slideType": "partners",
      "title": "Our Partners",
      "partnerLogos": ["Global Conservation Fund", "Ocean Conservancy International"]
    }
  ]
}
```

**Output:** `PresentationResult` object

```json
{
  "success": true,
  "outputPath": "output/presentation_2026-05-05T14-30-00.json",
  "message": "Presentation \"Ocean Conservation Initiative\" generated successfully with 5 slides.",
  "slideCount": 5
}
```

---

### 7. validate_presentation(slide_plan: SlidePlan)

Validates a presentation against brand guidelines and policies.

**Input:** `SlidePlan` object

**Output:** `ValidationResult` object

**Example Success Response:**

```json
{
  "isValid": true,
  "issues": [],
  "warnings": [
    "Presentation should include a title slide."
  ]
}
```

**Example Failure Response:**

```json
{
  "isValid": false,
  "issues": [
    "Expected 5 slides, but found 3.",
    "Presentation title is required."
  ],
  "warnings": [
    "Slide 2: Photo credits should be included when using images."
  ]
}
```

---

## Error Handling

All tools follow a consistent error handling pattern:

### File Not Found Error
```json
{
  "error": "Brand guidelines file not found. Please ensure the file exists at the expected path."
}
```

### Parse Error
```json
{
  "error": "Failed to parse brand-guidelines.json: Unexpected token in JSON at position 42"
}
```

### Not Found Error
```json
{
  "error": "Image with ID \"img_999\" not found in repository."
}
```

### Validation Error
```json
{
  "error": "Expected 5 slides, but received 3. The MVP requires exactly 5 slides."
}
```

## Usage Examples

### TypeScript

```typescript
import {
  get_brand_guidelines,
  search_images,
  get_image_metadata,
  search_symbols,
  get_partner_logo,
  generate_presentation,
  validate_presentation
} from './mcp-server/tools';

// Get brand guidelines
const guidelines = await get_brand_guidelines();
console.log(`WWF Brand Guidelines v${guidelines.version}`);

// Search for images
const images = await search_images('plastic pollution');
console.log(`Found ${images.length} images`);

// Get image metadata
const image = await get_image_metadata('img_001');
console.log(`Image: ${image.title}`);

// Search symbols
const symbols = await search_symbols('panda');
console.log(`Found ${symbols.length} symbols`);

// Get partner logo
const partner = await get_partner_logo('Global Conservation Fund');
console.log(`Partner: ${partner.name} (${partner.partnershipLevel})`);

// Validate and generate presentation
const slidePlan = { /* ... */ };
const validation = await validate_presentation(slidePlan);
if (validation.isValid) {
  const result = await generate_presentation(slidePlan);
  console.log(result.message);
}
```

### cURL (for MCP server)

```bash
# Get brand guidelines
curl -X POST http://localhost:3000/api/tools/get_brand_guidelines

# Search images
curl -X POST http://localhost:3000/api/tools/search_images \
  -H "Content-Type: application/json" \
  -d '{"query": "plastic pollution"}'

# Get image metadata
curl -X POST http://localhost:3000/api/tools/get_image_metadata \
  -H "Content-Type: application/json" \
  -d '{"image_id": "img_001"}'

# Search symbols
curl -X POST http://localhost:3000/api/tools/search_symbols \
  -H "Content-Type: application/json" \
  -d '{"keyword": "conservation"}'

# Get partner logo
curl -X POST http://localhost:3000/api/tools/get_partner_logo \
  -H "Content-Type: application/json" \
  -d '{"partner_name": "Global Conservation Fund"}'

# Generate presentation
curl -X POST http://localhost:3000/api/tools/generate_presentation \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "slides": [...]}'

# Validate presentation
curl -X POST http://localhost:3000/api/tools/validate_presentation \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "slides": [...]}'