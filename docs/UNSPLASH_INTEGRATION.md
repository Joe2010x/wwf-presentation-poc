# Unsplash Integration Guide

This document explains how to use the Unsplash API integration in the WWF Presentation POC project.

## Overview

The project now includes full integration with the Unsplash API, allowing you to search, retrieve, and use high-quality stock photos in your presentations. The integration is built as a service layer with MCP tools that can be easily accessed throughout the application.

## Setup

### 1. Get Your Unsplash API Credentials

You already have an Unsplash application registered:
- Application URL: https://unsplash.com/oauth/applications/945743
- Application ID: 945743

To get your API keys:

1. Log in to your Unsplash account at https://unsplash.com
2. Go to your applications: https://unsplash.com/oauth/applications
3. Find your application (ID: 945743)
4. Click on the application to view details
5. Copy the **Access Key**
6. Copy the **Secret Key** only if you plan to add OAuth/user-authorized Unsplash actions later

### 2. Configure Environment Variables

Update your `.env` file with the Access Key:

```bash
# In your .env file
UNSPLASH_ACCESS_KEY=your_actual_access_key_here
UNSPLASH_SECRET_KEY=your_actual_secret_key_here
UNSPLASH_APPLICATION_ID=945743
```

For this presentation generator, `UNSPLASH_ACCESS_KEY` is the key used for public photo search and random photos. `UNSPLASH_SECRET_KEY` is optional and should stay unused unless the app later implements OAuth/user-authorized actions.

**Important:** Never commit your actual Access Key or Secret Key to version control. The `.env` file is already in `.gitignore`, and these keys must remain server-side.

### 3. Install Dependencies

The required packages are already installed:
- `unsplash-js`: Official Unsplash JavaScript SDK
- `@types/unsplash-js`: TypeScript type definitions

If you need to reinstall:
```bash
npm install unsplash-js @types/unsplash-js
```

## Available MCP Tools

The following MCP tools are available for working with Unsplash:

### 1. `is_unsplash_configured()`
Check if the Unsplash API is properly configured.

```typescript
const isConfigured = await is_unsplash_configured();
// Returns: boolean
```

### 2. `search_unsplash_images(query, per_page, page, orientation)`
Search for images on Unsplash by keyword.

**Parameters:**
- `query` (string): Search term to find relevant images
- `per_page` (number, optional): Number of results per page (default: 10, max: 30)
- `page` (number, optional): Page number for pagination (default: 1)
- `orientation` ('landscape' | 'portrait' | 'squarish', optional): Image orientation

**Returns:** `UnsplashSearchResult` with matching images and pagination info

**Example:**
```typescript
const results = await search_unsplash_images('wildlife', 10, 1, 'landscape');
console.log(`Found ${results.total} images`);
results.results.forEach(image => {
  console.log(`${image.photographer}: ${image.description}`);
});
```

### 3. `get_unsplash_photo(unsplash_id)`
Retrieve a specific photo from Unsplash by ID.

**Parameters:**
- `unsplash_id` (string): The Unsplash photo ID (e.g., "abc123")

**Returns:** `UnsplashImage` object with full metadata

**Example:**
```typescript
const photo = await get_unsplash_photo('abc123def456');
console.log(`Photo by ${photo.photographer}`);
console.log(`Download URL: ${photo.urls.full}`);
```

### 4. `get_unsplash_random_photo(query, featured)`
Get a random photo from Unsplash, optionally filtered by search criteria.

**Parameters:**
- `query` (string, optional): Search term to filter random selection
- `featured` (boolean, optional): Whether to only return featured photos (default: false)

**Returns:** `UnsplashImage` object with random photo metadata

**Example:**
```typescript
const randomPhoto = await get_unsplash_random_photo('nature', true);
console.log(`Random featured nature photo: ${randomPhoto.urls.regular}`);
```

### 5. `get_unsplash_download_url(unsplash_id)`
Get the download URL for a specific Unsplash photo.

**Parameters:**
- `unsplash_id` (string): The Unsplash photo ID

**Returns:** Download URL string

**Example:**
```typescript
const downloadUrl = await get_unsplash_download_url('abc123def456');
console.log(`Download from: ${downloadUrl}`);
```

### 6. `get_unsplash_liked_photos(username, per_page, page)`
Get photos liked by a specific Unsplash user.

**Parameters:**
- `username` (string): Unsplash username
- `per_page` (number, optional): Number of results per page (default: 10)
- `page` (number, optional): Page number (default: 1)

**Returns:** Array of `UnsplashImage` objects

**Example:**
```typescript
const likedPhotos = await get_unsplash_liked_photos('someuser', 10, 1);
console.log(`User has liked ${likedPhotos.length} photos`);
```

## Data Structures

### UnsplashImage
```typescript
interface UnsplashImage {
  id: string;                    // Format: "unsplash_{unsplashId}"
  unsplashId: string;            // Original Unsplash ID
  filename: string;              // Generated filename
  category: string;              // Primary category
  tags: string[];                // Array of tags
  description: string;           // Photo description
  photographer: string;          // Photographer name
  photographerUrl: string;       // Link to photographer's profile
  license: string;               // License type ("Unsplash License")
  resolution: string;            // Format: "WIDTHxHEIGHT"
  urls: {
    raw: string;                 // Original image URL
    full: string;                // Full-size image URL
    regular: string;             // Regular size (1080p) URL
    small: string;               // Small size URL
    thumb: string;               // Thumbnail URL
  };
  links: {
    self: string;                // API link to photo
    html: string;                // Web link to photo
    download: string;            // Download link
  };
  source: 'unsplash';            // Source identifier
}
```

### UnsplashSearchResult
```typescript
interface UnsplashSearchResult {
  results: UnsplashImage[];      // Array of matching images
  total: number;                 // Total number of results
  totalPages: number;            // Total number of pages
}
```

## Usage Examples

### Example 1: Search for Wildlife Photos

```typescript
import { search_unsplash_images } from './src/mcp-server/tools';

async function findWildlifePhotos() {
  try {
    const results = await search_unsplash_images('wildlife', 10, 1, 'landscape');
    
    console.log(`Found ${results.total} wildlife photos`);
    
    results.results.forEach((photo, index) => {
      console.log(`\n${index + 1}. ${photo.description || 'No description'}`);
      console.log(`   Photographer: ${photo.photographer}`);
      console.log(`   Tags: ${photo.tags.slice(0, 5).join(', ')}`);
      console.log(`   Resolution: ${photo.resolution}`);
      console.log(`   URL: ${photo.urls.regular}`);
    });
  } catch (error) {
    console.error('Error searching photos:', error.message);
  }
}
```

### Example 2: Get Random Photo for Presentation

```typescript
import { get_unsplash_random_photo } from './src/mcp-server/tools';

async function getRandomPresentationPhoto() {
  try {
    // Get a random featured nature photo for a presentation
    const photo = await get_unsplash_random_photo('nature', true);
    
    console.log('Random photo for presentation:');
    console.log(`Description: ${photo.description}`);
    console.log(`Photographer: ${photo.photographer}`);
    console.log(`Image URL: ${photo.urls.regular}`);
    console.log(`Attribution: Photo by ${photo.photographer} on Unsplash`);
    
    return photo;
  } catch (error) {
    console.error('Error getting random photo:', error.message);
  }
}
```

### Example 3: Search with Pagination

```typescript
import { search_unsplash_images } from './src/mcp-server/tools';

async function searchWithPagination() {
  try {
    let page = 1;
    let allPhotos: UnsplashImage[] = [];
    
    // Get first 3 pages of results
    while (page <= 3) {
      const results = await search_unsplash_images('ocean', 10, page, 'landscape');
      allPhotos = [...allPhotos, ...results.results];
      console.log(`Page ${page}: Found ${results.results.length} photos`);
      page++;
    }
    
    console.log(`\nTotal photos collected: ${allPhotos.length}`);
    return allPhotos;
  } catch (error) {
    console.error('Error during pagination:', error.message);
  }
}
```

## Attribution Requirements

When using Unsplash photos, you must provide proper attribution:

### Attribution Format
```
Photo by [Photographer Name] on Unsplash
```

### Example in Presentations
Add photo credits to your slide content:

```typescript
const slideContent = {
  slideNumber: 3,
  slideType: 'image',
  title: 'Ocean Conservation',
  imageId: 'unsplash_abc123',
  photoCredits: ['Photo by Jane Doe on Unsplash']
};
```

## API Rate Limits

Unsplash API has rate limits:
- **50 requests per hour** for new applications
- Rate limits reset every hour

Best practices:
1. Cache search results when possible
2. Use pagination instead of multiple searches
3. Implement error handling for rate limit errors
4. Consider upgrading your application for higher limits

## Error Handling

The tools throw errors in these scenarios:

1. **Not Configured**: When `UNSPLASH_ACCESS_KEY` is missing
2. **API Errors**: When Unsplash API returns an error
3. **Network Errors**: When connection fails
4. **Not Found**: When a specific photo doesn't exist

Example error handling:

```typescript
try {
  const photo = await get_unsplash_photo('invalid_id');
} catch (error) {
  if (error.message.includes('not configured')) {
    console.error('Please configure Unsplash API key');
  } else if (error.message.includes('API Error')) {
    console.error('Unsplash API error:', error.message);
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## Integration with Presentation Generator

The Unsplash integration works seamlessly with the presentation generation workflow:

1. **Search for images** using `search_unsplash_images()`
2. **Select appropriate photos** for your slides
3. **Use the hotlinked image URLs** returned by Unsplash in your slide content
4. **Add photo credits** to comply with Unsplash license
5. **Track downloads** when photos are inserted into presentations; the presentation helper does this automatically through `photos.trackDownload()`

### Example Workflow

```typescript
import { 
  search_unsplash_images, 
  generate_presentation 
} from './src/mcp-server/tools';

async function createPresentationWithUnsplash() {
  // 1. Search for relevant images
  const oceanPhotos = await search_unsplash_images('ocean conservation', 5);
  const wildlifePhotos = await search_unsplash_images('wildlife', 5);
  
  // 2. Create slide plan using Unsplash images
  const slidePlan = {
    title: 'Ocean Conservation',
    slides: [
      {
        slideNumber: 1,
        slideType: 'title',
        title: 'Protecting Our Oceans'
      },
      {
        slideNumber: 2,
        slideType: 'content',
        title: 'Marine Life',
        imageId: oceanPhotos.results[0]?.id,
        photoCredits: [`Photo by ${oceanPhotos.results[0]?.photographer} on Unsplash`]
      },
      // ... more slides
    ]
  };
  
  // 3. Generate presentation
  const result = await generate_presentation(slidePlan);
  console.log(result.message);
}
```

## Troubleshooting

### Issue: "Unsplash API is not configured"
**Solution:** Make sure `UNSPLASH_ACCESS_KEY` is set in your `.env` file with a valid Access Key from your Unsplash application.

### Issue: "Rate limit exceeded"
**Solution:** Wait for the rate limit to reset (usually 1 hour) or implement caching to reduce API calls.

### Issue: "Photo not found"
**Solution:** Verify the Unsplash photo ID is correct. IDs are alphanumeric strings found in Unsplash URLs.

### Issue: TypeScript compilation errors
**Solution:** Run `npm run build` to ensure all dependencies are properly installed and types are correct.

## Additional Resources

- [Unsplash API Documentation](https://unsplash.com/documentation)
- [Unsplash JavaScript SDK](https://github.com/unsplash/unsplash-js)
- [Unsplash API Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines)
- [Your Unsplash Application](https://unsplash.com/oauth/applications/945743)

## Support

For issues or questions:
1. Check the Unsplash API documentation
2. Review error messages for specific guidance
3. Verify your API credentials are correct
4. Ensure your application is approved and active

---

**Note:** This integration requires an active internet connection and a valid Unsplash API access key. Make sure to comply with Unsplash's API guidelines and terms of service.
