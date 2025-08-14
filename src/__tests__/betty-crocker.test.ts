import { BettyCrocker } from '../scrapers/betty-crocker';
import { ScraperResult } from '../types/recipe';

describe('BettyCrocker', () => {
  const testUrl = 'https://bettycrocker.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for bettycrocker.com URLs', () => {
      expect(BettyCrocker.canScrape('https://bettycrocker.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Betty Crocker URLs', () => {
      expect(BettyCrocker.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(BettyCrocker.host()).toBe('bettycrocker.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Chocolate Chip Cookies - Betty Crocker</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Chocolate Chip Cookies",
              "description": "Classic homemade chocolate chip cookies",
              "image": "https://bettycrocker.com/cookies.jpg",
              "author": {
                "@type": "Organization",
                "name": "Betty Crocker"
              },
              "totalTime": "PT27M",
              "recipeYield": "24 cookies",
              "recipeIngredient": [
                "2¼ cups all-purpose flour",
                "1 tsp baking soda",
                "1 cup butter, softened",
                "2 cups chocolate chips"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Preheat oven to 375°F"
                },
                {
                  "@type": "HowToStep",
                  "text": "Mix flour, baking soda and salt in bowl"
                }
              ]
            }
            </script>
          </head>
          <body>
            <h1>Chocolate Chip Cookies</h1>
          </body>
        </html>
      `;

      const scraper = new BettyCrocker(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Chocolate Chip Cookies');
      expect(result.recipe!.description).toBe('Classic homemade chocolate chip cookies');
      expect(result.recipe!.author).toBe('Betty Crocker');
      expect(result.recipe!.totalTime).toBe(27);
      expect(result.recipe!.yields).toBe('24 cookies');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });
  });
});