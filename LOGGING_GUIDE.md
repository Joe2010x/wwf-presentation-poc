# Detailed Logging System Guide

## Overview

The WWF Presentation Generator now includes comprehensive logging throughout the entire generation process. This makes it easy to track what's happening at each step and diagnose any issues.

## Where Logs Appear

All logs are written to the **server console/terminal** where you run `npm run dev`. You'll see detailed step-by-step progress as presentations are generated.

## Logging Flow

### 1. API Request Received
When a generation request comes in, you'll see:
```
📥 POST /api/generate - Request received
   Title: [presentation title]
   Slides: [number of slides]
```

Or for AI-generated presentations:
```
📥 POST /api/generate-from-prompt - Request received
   Prompt: [first 100 chars of prompt]...
   Temperature: [value]
```

### 2. LLM Processing (if using AI generation)
```
   🤖 Sending request to OpenRouter API...
🤖 Sending request to OpenRouter API...
📝 Received response from OpenRouter
✅ Generated presentation with [X] slides
   ✅ Received LLM response: [title]
   📊 Generated [X] slides from prompt
```

If there are retries:
```
🔄 Retry attempt [X]...
```

### 3. Presentation Generation
```
   🚀 Starting presentation generation...
🎬 Creating presentation: "[title]"...
📋 Creating slide plan...
✅ Slide plan created with ID: [id]
🔍 Processing slides for Unsplash images...
```

### 4. Unsplash Image Processing
For each image slide:
```
🔍 Searching Unsplash for: "[query]" (orientation: landscape)
📤 Sending search request to Unsplash API: "[query]" (page=1, perPage=1)
📥 Received 1 images from Unsplash (total: [total])
🖼️ Found image: "[description]" by [photographer]
📤 Tracking Unsplash download...
✅ Download tracked successfully
✅ Image selected: [id] (1920x1080)
Image selected for "[keywords]": [id]
```

If Unsplash is not configured or fails:
```
Unsplash not configured. Using local fallback image.
```

Or with retries:
```
🔄 Retry attempt 2/3 for query: "[query]"
❌ Unsplash search failed for "[query]" (attempt 1/3): [error]
```

### 5. Slide Building
```
📝 Adding slide 1: title
📝 Adding slide 2: content
📝 Adding slide 3: image
📝 Adding slide 4: closing
✅ All slides added to presentation
```

### 6. File Saving
```
💾 Saving presentation to: [path]
   Generating PPTX file...
   File size: [size] KB
✅ Presentation created successfully!
📄 File saved as: output/pptx/[filename]
📋 Slide plan saved as: output/slide-plans/[id].json
   ✅ Generation complete
   📤 Response sent to client
```

### 7. Error Handling
If something fails, you'll see:
```
   ❌ Validation failed: [reason]
```
or
```
   ❌ Error generating presentation: [error details]
```

## Understanding the Icons

- 📥 - Request received
- 🚀 - Starting a process
- 🤖 - LLM/AI operation
- 📤 - Sending data/request
- 📥 - Received data/response
- ✅ - Success
- ❌ - Error/failure
- ⚠️ - Warning
- 🔄 - Retry attempt
- 📋 - Slide plan operations
- 🔍 - Searching/processing
- 🖼️ - Image found
- 💾 - Saving file
- 📄 - File operations
- 📊 - Statistics/info

## Example Complete Log

Here's what a successful generation might look like:

```
🚀 WWF Presentation Generator Web Server
📡 Server running at: http://localhost:3000

📥 POST /api/generate - Request received
   Title: Ocean Conservation
   Slides: 4
   🚀 Starting presentation generation...

🎬 Creating presentation: "Ocean Conservation"...
📋 Creating slide plan...
✅ Slide plan created with ID: plan_123

🔍 Processing slides for Unsplash images...
🔍 Searching Unsplash for: "ocean pollution" (orientation: landscape)
📤 Sending search request to Unsplash API: "ocean pollution" (page=1, perPage=1)
📥 Received 1 images from Unsplash (total: 15420)
🖼️ Found image: "Plastic pollution in ocean" by John Photographer
📤 Tracking Unsplash download...
✅ Download tracked successfully
✅ Image selected: abc123 (1920x1080)
Image selected for "ocean pollution": abc123
✅ Processed 4 slides

📝 Adding slide 1: title
📝 Adding slide 2: content
📝 Adding slide 3: image
📝 Adding slide 4: closing
✅ All slides added to presentation

💾 Saving presentation to: C:\...\output/pptx/presentation-1234567890.pptx
   Generating PPTX file...
   File size: 245.3 KB
✅ Presentation created successfully!
📄 File saved as: output/pptx/presentation-1234567890.pptx
📋 Slide plan saved as: output/slide-plans/plan_123.json
   ✅ Generation complete
   📤 Response sent to client
```

## Troubleshooting with Logs

### Issue: "Generating" but no results
**Check the logs for:**
1. Is the request being received? Look for `📥 POST /api/generate`
2. Is it passing validation? Look for `❌ Validation failed`
3. Is Unsplash hanging? Look for `🔍 Searching Unsplash` without completion
4. Is there an error? Look for `❌ Error`

### Issue: Unsplash images not loading
**Check for:**
- `Unsplash not configured` → You need to set `UNSPLASH_ACCESS_KEY` in `.env`
- `❌ Unsplash search failed` → API error or network issue
- `🔄 Retry attempt` → Multiple failures before fallback

### Issue: LLM not responding
**Check for:**
- `⚠️ OPENROUTER_API_KEY not set` → Need to configure OpenRouter
- `❌ OpenRouter API error` → API key issue or rate limit
- `🔄 Retry attempt` → Transient API issues

## Configuration Requirements

For full functionality, ensure your `.env` file contains:

```env
# Required for AI generation
OPENROUTER_API_KEY=your_key_here

# Required for Unsplash images (optional, has fallback)
UNSPLASH_ACCESS_KEY=your_key_here
```

## Next Steps

With this logging system, you can now:
1. See exactly what's happening during generation
2. Identify where processes might be hanging
3. Understand API interactions
4. Debug issues more effectively

If you encounter any issues, share the console logs and we can pinpoint the exact problem!