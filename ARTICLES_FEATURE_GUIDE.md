# Article Content Analysis Feature Guide

## Overview

The WWF Presentation Generator now includes a comprehensive article content analysis system that allows you to:

1. Store and manage conservation articles in a local repository
2. Search articles by keywords, tags, or categories
3. Use LLM to summarize articles and extract key points
4. Find related articles using AI analysis
5. Create presentation slides directly from article summaries

## Repository Structure

```
data/Articles/
├── articles-repository.json    # Main index with article metadata
├── articles/
│   ├── art_001_ocean-plastic.md
│   ├── art_002_tiger-conservation.md
│   ├── art_003_arctic-ice.md
│   ├── art_004_amazon-rainforest.md
│   ├── art_005_coral-reefs.md
│   └── art_006_panda-conservation.md
```

## MCP Tools

### Article Search & Retrieval

#### `search_articles(query, limit?)`
Search articles by title, tags, category, or author.

```typescript
// Example: Search for ocean-related articles
const articles = await search_articles("ocean", 5);
```

#### `get_article_metadata(article_id)`
Get metadata for a specific article.

```typescript
const article = await get_article_metadata("art_001");
// Returns: { id, title, author, publishedDate, source, sourceUrl, category, tags, ... }
```

#### `get_article_content(article_id)`
Get full article content from markdown file.

```typescript
const { article, content } = await get_article_content("art_001");
// Returns article metadata + full markdown content
```

#### `list_articles_by_category(category)`
List all articles in a specific category.

```typescript
const oceanArticles = await list_articles_by_category("ocean-conservation");
```

#### `get_article_categories()`
Get all available article categories.

```typescript
const categories = await get_article_categories();
// Returns: ["ocean-conservation", "wildlife-protection", "climate-change", "forest-conservation"]
```

### LLM-Powered Features

#### `summarize_article(article_id, options?)`
Use LLM to summarize an article and extract key points.

```typescript
const summary = await summarize_article("art_001", {
  style: 'bullet',    // 'bullet', 'paragraph', or 'executive'
  maxLength: 150      // Maximum words in summary
});

// Returns:
// {
//   articleId: "art_001",
//   title: "Ocean Plastic Crisis Worsens...",
//   summary: "Full summary text...",
//   keyPoints: ["Point 1", "Point 2", "Point 3"],
//   sourceUrl: "...",
//   author: "Dr. Jane Smith",
//   publishedDate: "2026-05-01"
// }
```

#### `get_related_articles(article_id, count?)`
Find articles related to a given article using LLM analysis or tag matching.

```typescript
const related = await get_related_articles("art_001", 3);
// Returns array of related Article objects
```

#### `create_article_presentation(article_ids, title)`
Create a complete presentation slide plan from selected articles.

```typescript
const slidePlan = await create_article_presentation(
  ["art_001", "art_005"],
  "Ocean Conservation Updates"
);
// Returns a SlidePlan ready for presentation generation
```

## Usage Examples

### Example 1: Search and Summarize Articles

```typescript
import { search_articles, summarize_article } from './src/mcp-server/tools.js';

// Search for climate-related articles
const climateArticles = await search_articles("climate", 3);

// Summarize the first article
for (const article of climateArticles) {
  const summary = await summarize_article(article.id, { 
    style: 'bullet',
    maxLength: 100 
  });
  
  console.log(`Summary for: ${summary.title}`);
  console.log(`Key points: ${summary.keyPoints.join('\n')}`);
  console.log(`Source: ${summary.sourceUrl}`);
}
```

### Example 2: Find Related Articles

```typescript
import { get_related_articles } from './src/mcp-server/tools.js';

// Find articles related to ocean plastic
const related = await get_related_articles("art_001", 3);

console.log("Related articles:");
related.forEach(article => {
  console.log(`- ${article.title} (${article.category})`);
});
```

### Example 3: Create Article-Based Presentation

```typescript
import { 
  search_articles, 
  create_article_presentation,
  generate_presentation 
} from './src/mcp-server/tools.js';

// Find ocean conservation articles
const oceanArticles = await search_articles("ocean", 3);
const articleIds = oceanArticles.map(a => a.id);

// Create presentation from these articles
const slidePlan = await create_article_presentation(
  articleIds,
  "Ocean Conservation: Latest Research"
);

// Generate the presentation
const result = await generate_presentation(slidePlan);
console.log(`Presentation created: ${result.outputPath}`);
```

## Configuration

### Required Environment Variables

For full LLM functionality, add to your `.env` file:

```env
# OpenRouter API for LLM summarization
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

### Fallback Behavior

If `OPENROUTER_API_KEY` is not configured:
- `summarize_article()` returns a basic summary (first paragraph)
- `get_related_articles()` uses tag-based matching instead of LLM analysis

## Article Categories

The repository includes articles in these categories:

| Category | Description | Count |
|----------|-------------|-------|
| ocean-conservation | Ocean and marine life conservation | 2 |
| wildlife-protection | Endangered species protection | 2 |
| climate-change | Climate science and impacts | 1 |
| forest-conservation | Forest and rainforest protection | 1 |

## Adding New Articles

To add new articles to the repository:

1. Create a new markdown file in `data/Articles/articles/`:
   ```markdown
   # Article Title
   
   **By Author Name**
   **Published: YYYY-MM-DD**
   **Source: Publication Name**
   
   Article content here...
   ```

2. Add metadata to `data/Articles/articles-repository.json`:
   ```json
   {
     "id": "art_007",
     "filename": "art_007_your-article.md",
     "title": "Your Article Title",
     "author": "Author Name",
     "publishedDate": "2026-05-10",
     "source": "Publication Name",
     "sourceUrl": "https://...",
     "category": "your-category",
     "tags": ["tag1", "tag2"],
     "readingTime": 5,
     "wordCount": 1000
   }
   ```

3. Update the `totalArticles` count in the repository file.

## API Endpoints (Planned)

The following API endpoints will be added to the web server:

- `GET /api/articles` - List all articles
- `GET /api/articles/:id` - Get article details
- `GET /api/articles/:id/summary` - Get LLM summary
- `GET /api/articles/:id/related` - Get related articles
- `POST /api/articles/presentations` - Create presentation from articles

## Troubleshooting

### "OpenRouter API key not configured"
Add `OPENROUTER_API_KEY` to your `.env` file.

### "Article not found"
Ensure the article ID exists in `articles-repository.json` and the markdown file exists.

### "Failed to parse articles-repository.json"
Check that the JSON file is valid and properly formatted.

## Integration with Existing Features

The article system integrates with:
- **MCP Tools**: All article functions are available as MCP tools
- **PPT Generator**: Article summaries can be converted to presentation slides
- **Web Server**: API endpoints (coming soon) will provide web access
- **Logging System**: All operations are logged with detailed progress messages

## Best Practices

1. **Keep articles focused**: Each article should cover a specific topic
2. **Use descriptive tags**: Tags improve search and related article matching
3. **Include source URLs**: Always provide attribution and source links
4. **Write for presentations**: Articles with clear structure work best for summaries