# WWF Presentation Generator

A TypeScript proof of concept for generating WWF-style PowerPoint presentations from topic prompts. It includes a web UI, mock MCP-style tools, mock brand data, and OpenRouter-backed prompt generation.

## What It Does

- Generates WWF-style presentation slide plans and PPTX files
- Uses mock brand guidelines, image metadata, partner logos, and policy guidance
- Saves generated files locally under `output/`
- Provides a web server for creating, listing, downloading, regenerating, and deleting slide plans
- Includes MCP-style tool functions for brand lookup, image lookup, partner lookup, validation, and presentation generation

## Repository Notes

This repo intentionally does not track local/generated files:

- `node_modules/` is ignored. Run `npm install` after cloning.
- `.env` is ignored. Copy `.env.example` to `.env` and add your own OpenRouter API key.
- `output/` is ignored and created automatically when presentations are generated.
- Generated `presentation-*.pptx` files are ignored.
- `dist/` is ignored in `.gitignore`, but the current repo may include built files already. Source files live under `src/`.

## Prerequisites

- Node.js 18+
- npm
- An OpenRouter API key if you want AI-generated presentation content

## Setup

```bash
git clone https://github.com/Joe2010x/wwf-presentation-poc.git
cd wwf-presentation-poc
npm install
copy .env.example .env
npm run build
```

On macOS/Linux, use:

```bash
cp .env.example .env
```

Then edit `.env` and set:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## Run The Web App

```bash
npm run dev
```

This builds the TypeScript project and starts the web server. By default, the app runs at:

```text
http://localhost:3000
```

Generated files are written to:

```text
output/pptx/
output/slide-plans/
```

These folders are created automatically if they do not exist.

## CLI Usage

Build first:

```bash
npm run build
```

Then generate a presentation from command-line arguments:

```bash
npm start -- --title="Ocean Pollution Crisis" --subtitle="Protecting Our Seas" --slides='[{"type":"title","data":{"title":"Ocean Pollution Crisis","subtitle":"Protecting Our Seas"}}]' --output="ocean-pollution.pptx"
```

The generated PPTX will be saved under `output/pptx/`.

## Scripts

| Command | Description |
| --- | --- |
| `npm install` | Install local dependencies into ignored `node_modules/` |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Run the CLI presentation generator from `dist/` |
| `npm run server` | Start the compiled web server |
| `npm run dev` | Build, then start the web server |

## Project Structure

```text
wwf-presentation-poc/
|-- assets/
|   |-- images/
|   |-- logos/
|   `-- symbols/
|-- data/
|   |-- brand-guidelines.json
|   |-- image-repository.json
|   |-- partner-logos.json
|   `-- policy-guidelines.md
|-- docs/
|   `-- mcp-tools-design.md
|-- mock-responses/
|-- public/
|-- src/
|   |-- llm/
|   |-- mcp-server/
|   |-- ppt-generator/
|   |-- validator/
|   `-- web-server/
|-- .env.example
|-- .gitignore
|-- package.json
|-- package-lock.json
|-- tsconfig.json
`-- README.md
```

## MCP-Style Tools

The project includes tool functions in `src/mcp-server/tools.ts`:

| Tool | Description |
| --- | --- |
| `get_brand_guidelines()` | Load mock WWF brand guidelines |
| `search_images(query)` | Search image metadata by tag, category, or description |
| `get_image_metadata(image_id)` | Get metadata for a specific image |
| `search_symbols(keyword)` | Search mock WWF symbols/icons |
| `get_partner_logo(partner_name)` | Get partner logo metadata |
| `generate_presentation(slide_plan)` | Generate a mock 5-slide presentation JSON |
| `validate_presentation(slide_plan)` | Validate a slide plan against guidelines |

## Development Hygiene

Before committing, check what Git will include:

```bash
git status --short --ignored
git ls-files node_modules
```

`git ls-files node_modules` should print nothing. If it prints files, remove them from tracking with:

```bash
git rm --cached -r node_modules
```

Do not commit `.env` or generated output files. Use `.env.example` for shared configuration placeholders.

## License

MIT
