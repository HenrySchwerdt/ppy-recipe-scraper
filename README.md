# Recipe Scrapers TypeScript

A TypeScript library for extracting recipes from URLs, compatible with React Native. This is a TypeScript port inspired by the Python [recipe-scrapers](https://github.com/hhursev/recipe-scrapers) library.

## Features

- 🔍 Extract structured recipe data from websites
- 📱 React Native compatible
- 🎯 TypeScript with full type definitions
- 🧪 Comprehensive test coverage
- 🔧 Extensible scraper architecture
- 📊 JSON-LD and HTML fallback parsing

## Installation

```bash
npm install recipe-scrapers-ts
```

For React Native projects, you may need to install additional polyfills:

```bash
npm install react-native-url-polyfill
```

## Quick Start

```typescript
import { scrapeRecipe } from 'recipe-scrapers-ts';

// Simple usage
const result = await scrapeRecipe('https://www.aldi-sued.de/de/r.croque-monsieur-mit-champignons-und-spinat.Article_RZ49604560000000.html');

if (result.success) {
  console.log('Recipe:', result.recipe);
  console.log('Title:', result.recipe.title);
  console.log('Ingredients:', result.recipe.ingredients);
  console.log('Instructions:', result.recipe.instructions);
} else {
  console.error('Error:', result.error);
}
```

## Advanced Usage

```typescript
import { RecipeScraper, createScraperFromUrl } from 'recipe-scrapers-ts';

const scraper = new RecipeScraper({
  timeout: 15000,
  userAgent: 'MyApp/1.0'
});

// Check if URL is supported
if (scraper.canScrape(url)) {
  const result = await scraper.scrape(url);
  // Handle result...
}

// Get supported domains
const domains = scraper.getSupportedDomains();
console.log('Supported domains:', domains);

// Create scraper directly from URL
const directScraper = await createScraperFromUrl(url);
if (directScraper) {
  const result = await directScraper.scrape();
  // Handle result...
}

// Use specific scraper directly
import { AllRecipes } from 'recipe-scrapers-ts';
const html = await fetch(url).then(r => r.text());
const specificScraper = new AllRecipes(html, url);
const result = await specificScraper.scrape();
```

## React Native Setup

For React Native projects, add URL polyfill to your app entry point:

```typescript
// App.tsx or index.js
import 'react-native-url-polyfill/auto';
import { scrapeRecipe } from 'recipe-scrapers-ts';

// Now you can use the library
```

## Supported Sites

Currently supported:
- ✅ ALDI Australia (aldi.com.au)
- ✅ ALDI Süd (aldi-sued.de)
- ✅ ALDI Nord (aldi-nord.de)
- ✅ ALDI Suisse (aldi-suisse.ch)
- ✅ REWE (rewe.de)
- ✅ Rezeptwelt (rezeptwelt.de)
- ✅ Allrecipes (allrecipes.com)
- ✅ A Beautiful Mess (abeautifulmess.com)
- ✅ Aberle Home (aberlehome.com)
- ✅ Amazing Oriental (amazingoriental.com)
- ✅ Afghan Kitchen Recipes (afghankitchenrecipes.com)
- ✅ Archana's Kitchen (archanaskitchen.com)
- ✅ Argiro (argiro.gr)
- ✅ BBC Good Food (bbcgoodfood.com)
- ✅ Bon Appétit (bonappetit.com)
- ✅ Budget Bytes (budgetbytes.com)
- ✅ Betty Crocker (bettycrocker.com)
- ✅ Best Recipes (bestrecipes.com.au)

More scrapers being added regularly! The library now supports **18+ recipe websites** with more being added continuously.

## Recipe Data Structure

```typescript
interface Recipe {
  title: string;
  totalTime?: number; // in minutes
  yields?: string;
  ingredients: string[];
  instructions: string[];
  image?: string;
  author?: string;
  description?: string;
  category?: string;
  cuisine?: string;
  keywords?: string[];
  nutritionInfo?: NutritionInfo;
  url?: string;
}
```

## Creating Custom Scrapers

Extend the `AbstractScraper` class to add support for new websites:

```typescript
import { AbstractScraper } from 'recipe-scrapers-ts';

export class MyCustomScraper extends AbstractScraper {
  static host(): string {
    return 'mysite.com';
  }

  static canScrape(url: string): boolean {
    return url.includes('mysite.com');
  }

  author(): string | undefined {
    return this.schema.author();
  }

  siteName(): string {
    return 'My Site';
  }

  title(): string {
    return this.schema.title() || '';
  }

  ingredients(): string[] {
    return this.schema.ingredients();
  }

  instructions(): string {
    return this.schema.instructions();
  }

  // Implement other required methods...
  category(): string | undefined { return this.schema.category(); }
  yields(): string | undefined { return this.schema.yields(); }
  description(): string | undefined { return this.schema.description(); }
  totalTime(): number | undefined { return this.schema.totalTime(); }
  cookTime(): number | undefined { return this.schema.cookTime(); }
  prepTime(): number | undefined { return this.schema.prepTime(); }
  cuisine(): string | undefined { return this.schema.cuisine(); }
  image(): string | undefined { return this.schema.image(); }
}
```

## Architecture

The library follows a modular architecture inspired by the Python recipe-scrapers:

- **AbstractScraper**: Base class that all scrapers extend
- **Schema.org Support**: Automatic parsing of JSON-LD structured data
- **HTML Fallback**: Custom parsing when structured data isn't available
- **Static Value Exceptions**: Handle sites with static return values
- **Equipment & Nutrition**: Support for additional recipe metadata
- **Ingredient Grouping**: Parse grouped ingredients with purposes
- **React Native Compatible**: Works in React Native environments

### Key Components

- `AbstractScraper`: Base scraper class with common functionality
- `SchemaOrg`: JSON-LD structured data parser
- `OpenGraph`: Open Graph metadata parser
- `Utils`: Helper functions for time parsing, text normalization, etc.
- `Exceptions`: Custom exception types for error handling

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Development mode (watch for changes)
npm run dev

# Run examples
npx ts-node examples/basic-usage.ts
```

## Testing

The library includes comprehensive tests for all scrapers. Run tests with:

```bash
npm test
```

Example test for ALDI URLs:
- ✅ Croque Monsieur recipe extraction
- ✅ JSON-LD parsing
- ✅ HTML fallback parsing
- ✅ Error handling
- ✅ Time format parsing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for your changes
4. Ensure all tests pass
5. Submit a pull request

When adding new scrapers:
1. Create a new scraper class extending `BaseScraper`
2. Add it to the `SCRAPERS` array in `src/scrapers/index.ts`
3. Write comprehensive tests
4. Update the README with supported sites

## License

MIT License - see LICENSE file for details.

## Acknowledgments

Inspired by the excellent Python [recipe-scrapers](https://github.com/hhursev/recipe-scrapers) library by Hristiyan Hursev.