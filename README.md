# WWF Presentation Generator

A Model Context Protocol (MCP) based tool for generating WWF-style presentations from topic prompts.

## Goal

Generate a WWF-style presentation from a topic prompt.

## MVP (Minimum Viable Product)

- Use mock brand guidelines
- Use mock image repository
- Use mock partner logo repository
- Generate 5-slide PowerPoint
- Add photo credits
- Run compliance validation

## Out of Scope

- Real WWF internal systems
- Real authentication
- Full brand guideline coverage

## Project Structure

```
wwf-presentation-poc/
├── assets/
│   ├── images/          # Mock image repository
│   ├── logos/           # Partner logo repository
│   └── symbols/         # WWF symbols and icons
├── data/
│   ├── brand-guidelines.json    # Mock brand guidelines
│   ├── image-repository.json    # Mock image metadata
│   ├── partner-logos.json       # Partner logo metadata
│   └── policy-guidelines.md     # Content and compliance policies
├── docs/
│   └── mcp-tools-design.md      # MCP tools API documentation
├── mock-responses/               # Mock API response examples
│   ├── search_images_response.json
│   ├── get_image_metadata_response.json
│   ├── search_symbols_response.json
│   ├── get_partner_logo_response.json
│   ├── generate_presentation_response.json
│   ├── validate_presentation_response.json
│   └── validate_presentation_failure_response.json
├── src/
│   ├── mcp-server/
│   │   ├── types.ts              # Shared TypeScript interfaces
│   │   └── tools.ts              # MCP tool implementations
│   ├── ppt-generator/
│   │   └── brand-loader.ts       # Brand guidelines loader
│   └── validator/                # Compliance validation (placeholder)
├── output/                       # Generated presentations
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd wwf-presentation-poc
npm install
npm run build
```

### Usage

1. Place images in `assets/images/`
2. Place partner logos in `assets/logos/`
3. Update data files in `data/` as needed
4. Import and use the MCP tools from `src/mcp-server/tools.ts`
5. Generated presentations will be saved to `output/`

## MCP Tools

The project provides 7 MCP tools for presentation generation:

| Tool | Description |
|------|-------------|
| `get_brand_guidelines()` | Load WWF brand guidelines (colors, fonts, templates) |
| `search_images(query)` | Search image repository by tags, category, or description |
| `get_image_metadata(image_id)` | Get detailed metadata for a specific image |
| `search_symbols(keyword)` | Search WWF symbols/icons by keyword |
| `get_partner_logo(partner_name)` | Get partner logo information by organization name |
| `generate_presentation(slide_plan)` | Generate a 5-slide presentation |
| `validate_presentation(slide_plan)` | Validate presentation against brand guidelines |

### Example Usage

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
console.log(`Image: ${image.title} by ${image.photographer}`);

// Search symbols
const symbols = await search_symbols('panda');
console.log(`Found ${symbols.length} symbols`);

// Get partner logo
const partner = await get_partner_logo('Global Conservation Fund');
console.log(`Partner: ${partner.name} (${partner.partnershipLevel})`);

// Validate and generate presentation
const slidePlan = {
  title: 'Ocean Conservation',
  slides: [
    { slideNumber: 1, slideType: 'title', title: 'Ocean Conservation' },
    { slideNumber: 2, slideType: 'content', title: 'The Problem', content: '...' },
    { slideNumber: 3, slideType: 'image', title: 'Impact', imageId: 'img_001' },
    { slideNumber: 4, slideType: 'content', title: 'Solution', content: '...' },
    { slideNumber: 5, slideType: 'partners', title: 'Partners', partnerLogos: ['Partner Name'] }
  ]
};

const validation = await validate_presentation(slidePlan);
if (validation.isValid) {
  const result = await generate_presentation(slidePlan);
  console.log(result.message);
} else {
  console.error('Validation failed:', validation.issues);
}
```

## Data Files

- **brand-guidelines.json**: Defines colors, fonts, logo usage rules, and slide templates
- **image-repository.json**: Catalog of available images with metadata (id, tags, photographer, license)
- **partner-logos.json**: Partner organization information and logo paths
- **policy-guidelines.md**: Content standards and compliance requirements

## Documentation

- **[MCP Tools Design](docs/mcp-tools-design.md)**: Complete API documentation with input/output specifications and examples

## Mock Responses

The `mock-responses/` directory contains example JSON responses for each MCP tool, useful for testing and understanding the expected output format.

## Development

```bash
# Build TypeScript
npm run build

# Watch mode
npm run build -- --watch
```

## License

MIT