import { BonAppetit } from '../scrapers/bon-appetit';
import { ScraperResult } from '../types/recipe';

describe('BonAppetit', () => {
  const testUrl = 'https://bonappetit.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for bonappetit.com URLs', () => {
      expect(BonAppetit.canScrape('https://bonappetit.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Bon Appétit URLs', () => {
      expect(BonAppetit.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(BonAppetit.host()).toBe('bonappetit.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Perfect Pasta Carbonara - Bon Appétit</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Perfect Pasta Carbonara",
              "description": "Creamy Roman pasta with eggs and pancetta",
              "image": "https://bonappetit.com/carbonara.jpg",
              "author": {
                "@type": "Person",
                "name": "Claire Saffitz"
              },
              "totalTime": "PT25M",
              "recipeYield": "4 servings",
              "recipeIngredient": [
                "1 lb spaghetti",
                "6 oz pancetta, diced",
                "4 large eggs",
                "1 cup Pecorino Romano, grated"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Cook pasta in salted boiling water until al dente"
                },
                {
                  "@type": "HowToStep",
                  "text": "Render pancetta in large skillet until crispy"
                }
              ]
            }
            </script>
          </head>
          <body>
            <h1>Perfect Pasta Carbonara</h1>
          </body>
        </html>
      `;

      const scraper = new BonAppetit(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Perfect Pasta Carbonara');
      expect(result.recipe!.description).toBe('Creamy Roman pasta with eggs and pancetta');
      expect(result.recipe!.author).toBe('Claire Saffitz');
      expect(result.recipe!.totalTime).toBe(25);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });
  });
});