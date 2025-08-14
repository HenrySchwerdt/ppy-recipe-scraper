import { CookingLight } from '../scrapers/cooking-light';
import { ScraperResult } from '../types/recipe';

describe('CookingLight', () => {
  const testUrl = 'https://cookinglight.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for cookinglight.com URLs', () => {
      expect(CookingLight.canScrape('https://cookinglight.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Cooking Light URLs', () => {
      expect(CookingLight.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(CookingLight.host()).toBe('cookinglight.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Grilled Salmon with Lemon - Cooking Light</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Grilled Salmon with Lemon",
              "description": "Light and healthy grilled salmon recipe",
              "image": "https://cookinglight.com/grilled-salmon.jpg",
              "author": {
                "@type": "Organization",
                "name": "Cooking Light"
              },
              "totalTime": "PT27M",
              "recipeYield": "4 servings",
              "recipeIngredient": [
                "4 salmon fillets (6 oz each)",
                "2 lemons, sliced",
                "2 tbsp olive oil",
                "Fresh parsley for garnish"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Preheat grill to medium-high heat"
                },
                {
                  "@type": "HowToStep",
                  "text": "Brush salmon with olive oil and season with salt and pepper"
                }
              ]
            }
            </script>
          </head>
          <body>
            <h1>Grilled Salmon with Lemon</h1>
          </body>
        </html>
      `;

      const scraper = new CookingLight(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Grilled Salmon with Lemon');
      expect(result.recipe!.description).toBe('Light and healthy grilled salmon recipe');
      expect(result.recipe!.author).toBe('Cooking Light');
      expect(result.recipe!.totalTime).toBe(27);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });
  });
});