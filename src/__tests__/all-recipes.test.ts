import { AllRecipes } from '../scrapers/all-recipes';
import { ScraperResult } from '../types/recipe';

// Mock fetch for testing
global.fetch = jest.fn();

describe('AllRecipes', () => {
  const testUrl = 'https://www.allrecipes.com/recipe/123456/test-recipe';
  const mockHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Recipe - Allrecipes</title>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": "Delicious Test Recipe",
        "description": "A wonderful test recipe for testing purposes",
        "image": "https://example.com/recipe-image.jpg",
        "author": {
          "@type": "Person",
          "name": "Test Chef"
        },
        "totalTime": "PT45M",
        "prepTime": "PT15M",
        "cookTime": "PT30M",
        "recipeYield": "4 servings",
        "recipeIngredient": [
          "2 cups flour",
          "1 cup sugar",
          "3 eggs",
          "1/2 cup butter"
        ],
        "recipeInstructions": [
          {
            "@type": "HowToStep",
            "text": "Preheat oven to 350°F"
          },
          {
            "@type": "HowToStep", 
            "text": "Mix all ingredients together"
          },
          {
            "@type": "HowToStep",
            "text": "Bake for 30 minutes"
          }
        ],
        "recipeCategory": "Dessert",
        "recipeCuisine": "American"
      }
      </script>
    </head>
    <body>
      <h1>Delicious Test Recipe</h1>
    </body>
    </html>
  `;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for allrecipes.com URLs', () => {
      expect(AllRecipes.canScrape('https://www.allrecipes.com/recipe/123456/test-recipe')).toBe(true);
    });

    it('should return false for non-AllRecipes URLs', () => {
      expect(AllRecipes.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(AllRecipes.host()).toBe('allrecipes.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe', async () => {
      const scraper = new AllRecipes(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Delicious Test Recipe');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(3);
      expect(result.recipe!.totalTime).toBe(45);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.author).toBe('Test Chef');
      expect(result.recipe!.category).toBe('Dessert');
      expect(result.recipe!.cuisine).toBe('American');
      expect(result.recipe!.description).toBe('A wonderful test recipe for testing purposes');
    });

    it('should handle missing recipe data gracefully', async () => {
      const emptyHtml = '<html><body><h1>No Recipe</h1></body></html>';
      const scraper = new AllRecipes(emptyHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(false);
      expect(result.error).toBe('No recipe data found');
    });
  });
});