# PowerShell script to generate ocean pollution presentation

$slidesJson = @'
[
  {
    "type": "title",
    "data": {
      "title": "Ocean Pollution Crisis",
      "subtitle": "Protecting Our Seas for Future Generations"
    }
  },
  {
    "type": "content",
    "data": {
      "headline": "The Scale of the Problem",
      "bullets": [
        "8 million tons of plastic enter oceans annually",
        "Over 700 marine species are affected by pollution",
        "By 2050, there could be more plastic than fish by weight",
        "Ocean acidification threatens entire marine ecosystems",
        "Microplastics found in 90% of seabirds and 100% of sea turtles"
      ]
    }
  },
  {
    "type": "image",
    "data": {
      "attribution": "Photo: WWF / Ocean Conservation Project",
      "caption": "Marine life affected by ocean pollution"
    }
  },
  {
    "type": "content",
    "data": {
      "headline": "What We Can Do",
      "bullets": [
        "Reduce single-use plastics in daily life",
        "Support sustainable fishing and aquaculture",
        "Participate in beach and waterway cleanups",
        "Advocate for marine protected areas",
        "Choose reef-safe and ocean-friendly products"
      ]
    }
  },
  {
    "type": "closing",
    "data": {
      "message": "Act Now for Our Oceans",
      "subtitle": "Every Action Counts - Together We Can Make a Difference"
    }
  }
]
'@

# Build the presentation
Write-Host "🌊 Building ocean pollution presentation..." -ForegroundColor Cyan
npm run build

# Generate the presentation
Write-Host "🎬 Generating presentation..." -ForegroundColor Cyan
npm start -- --title="Ocean Pollution Crisis" --subtitle="Protecting Our Seas" --slides="$slidesJson" --output="ocean-pollution.pptx"

Write-Host "✅ Presentation generated successfully!" -ForegroundColor Green
Write-Host "📄 File saved as: output/ocean-pollution.pptx" -ForegroundColor Yellow