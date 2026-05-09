# WWF Presentation Generator - Wildlife in Sweden
# This script generates a 10-slide presentation about Swedish wildlife using Unsplash images

Write-Host "🎬 Creating Wildlife in Sweden presentation with Unsplash images..." -ForegroundColor Green

# Define the slides JSON with searchQuery for automatic Unsplash image fetching
$slidesJson = @'
[
  {
    "type": "title",
    "data": {
      "title": "Wildlife in Sweden",
      "subtitle": "Exploring the Rich Biodiversity of Scandinavia"
    }
  },
  {
    "type": "image",
    "data": {
      "caption": "Swedish Wilderness",
      "searchQuery": "Swedish wilderness forest landscape",
      "attribution": "Will be auto-filled"
    }
  },
  {
    "type": "content",
    "data": {
      "headline": "Sweden's Natural Heritage",
      "bullets": [
        "Over 50% of Sweden is covered by forests",
        "Home to iconic species like moose, reindeer, and brown bears",
        "Extensive coastline and thousands of lakes",
        "Strong conservation traditions and national parks",
        "Unique Arctic ecosystems in the north"
      ]
    }
  },
  {
    "type": "image",
    "data": {
      "caption": "Moose - Sweden's National Animal",
      "searchQuery": "moose Sweden elk forest",
      "attribution": "Will be auto-filled"
    }
  },
  {
    "type": "content",
    "data": {
      "headline": "Iconic Swedish Wildlife Species",
      "bullets": [
        "Moose (Älg) - The king of Swedish forests",
        "Reindeer - Herded by Sami people in the north",
        "Brown Bear - Scandinavia's largest predator",
        "Lynx - Elusive forest cat",
        "Wolverine - Powerful mountain dweller",
        "White-tailed Eagle - Majestic coastal bird"
      ]
    }
  },
  {
    "type": "image",
    "data": {
      "caption": "Reindeer in Swedish Lapland",
      "searchQuery": "reindeer Sami Lapland Sweden",
      "attribution": "Will be auto-filled"
    }
  },
  {
    "type": "content",
    "data": {
      "headline": "Conservation Success Stories",
      "bullets": [
        "Brown bear population recovered from 200 to 3,000+",
        "Eagle populations rebounded after DDT ban",
        "Over 30 national parks protect diverse habitats",
        "Sustainable forestry practices widely adopted",
        "Sami traditional knowledge guides conservation"
      ]
    }
  },
  {
    "type": "image",
    "data": {
      "caption": "Brown Bear in Swedish Forest",
      "searchQuery": "brown bear Sweden forest wildlife",
      "attribution": "Will be auto-filled"
    }
  },
  {
    "type": "content",
    "data": {
      "headline": "Challenges and Future",
      "bullets": [
        "Climate change affecting Arctic ecosystems",
        "Habitat fragmentation from infrastructure",
        "Human-wildlife conflicts in rural areas",
        "Need for wildlife corridors between protected areas",
        "Balancing forestry with biodiversity conservation"
      ]
    }
  },
  {
    "type": "image",
    "data": {
      "caption": "Swedish Nature Conservation",
      "searchQuery": "Sweden nature conservation forest protection",
      "attribution": "Will be auto-filled"
    }
  },
  {
    "type": "closing",
    "data": {
      "message": "Thank You",
      "subtitle": "Together we protect Sweden's natural heritage"
    }
  }
]
'@

# Generate the presentation
npm start -- --title="Wildlife in Sweden" --subtitle="Exploring the Rich Biodiversity of Scandinavia" --slides="$slidesJson" --output="wildlife-sweden.pptx"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Presentation generated successfully!" -ForegroundColor Green
    Write-Host "📄 File saved as: output/wildlife-sweden.pptx" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to generate presentation" -ForegroundColor Red
    exit 1
}