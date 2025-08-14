import { ChefSavvy } from '../scrapers/chef-savvy';
import { ScraperResult } from '../types/recipe';

describe('ChefSavvy', () => {
  const testUrl = 'https://chefsavvy.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for chefsavvy.com URLs', () => {
      expect(ChefSavvy.canScrape('https://chefsavvy.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Chef Savvy URLs', () => {
      expect(ChefSavvy.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(ChefSavvy.host()).toBe('chefsavvy.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Garlic Butter Shrimp - Chef Savvy</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Garlic Butter Shrimp",
              "description": "Quick and easy garlic butter shrimp recipe",
              "image": "https://chefsavvy.com/garlic-shrimp.jpg",
              "author": {
                "@type": "Person",
                "name": "Chef Savvy"
              },
              "totalTime": "PT18M",
              "recipeYield": "4 servings",
              "recipeIngredient": [
                "1 lb large shrimp, peeled",
                "4 tbsp butter",
                "4 cloves garlic, minced",
                "2 tbsp lemon juice"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Season shrimp with salt and pepper"
                },
                {
                  "@type": "HowToStep",
                  "text": "Heat butter in large skillet over medium-high heat"
                }
              ]
            }
            </script>
          </head>
          <body>
            <h1>Garlic Butter Shrimp</h1>
          </body>
        </html>
      `;

      const scraper = new ChefSavvy(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Garlic Butter Shrimp');
      expect(result.recipe!.description).toBe('Quick and easy garlic butter shrimp recipe');
      expect(result.recipe!.author).toBe('Chef Savvy');
      expect(result.recipe!.totalTime).toBe(18);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });
  });
});