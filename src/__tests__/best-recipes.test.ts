import { BestRecipes } from '../scrapers/best-recipes';
import { ScraperResult } from '../types/recipe';

describe('BestRecipes', () => {
  const testUrl = 'https://bestrecipes.com.au/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for bestrecipes.com.au URLs', () => {
      expect(BestRecipes.canScrape('https://bestrecipes.com.au/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Best Recipes URLs', () => {
      expect(BestRecipes.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(BestRecipes.host()).toBe('bestrecipes.com.au');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Pavlova Recipe - Best Recipes</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Pavlova Recipe",
              "description": "Classic Australian pavlova with fresh berries",
              "image": "https://bestrecipes.com.au/pavlova.jpg",
              "author": {
                "@type": "Person",
                "name": "Best Recipes Team"
              },
              "totalTime": "PT120M",
              "recipeYield": "8 servings",
              "recipeIngredient": [
                "6 egg whites",
                "1½ cups caster sugar",
                "1 tsp vanilla extract",
                "300ml thickened cream"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Preheat oven to 150°C and line baking tray"
                },
                {
                  "@type": "HowToStep",
                  "text": "Whisk egg whites until soft peaks form"
                }
              ]
            }
            </script>
          </head>
          <body>
            <h1>Pavlova Recipe</h1>
          </body>
        </html>
      `;

      const scraper = new BestRecipes(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Pavlova Recipe');
      expect(result.recipe!.description).toBe('Classic Australian pavlova with fresh berries');
      expect(result.recipe!.author).toBe('Best Recipes Team');
      expect(result.recipe!.totalTime).toBe(120);
      expect(result.recipe!.yields).toBe('8 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });
  });
});