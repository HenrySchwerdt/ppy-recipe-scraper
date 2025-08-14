import { AldiNord } from '../scrapers/aldi-nord';
import { ScraperResult } from '../types/recipe';

describe('AldiNord', () => {
  const testUrl = 'https://www.aldi-nord.de/de/r.test-recipe.html';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for aldi-nord.de URLs', () => {
      expect(AldiNord.canScrape('https://www.aldi-nord.de/de/r.some-recipe.html')).toBe(true);
    });

    it('should return false for non-ALDI Nord URLs', () => {
      expect(AldiNord.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(AldiNord.host()).toBe('aldi-nord.de');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Recipe - ALDI Nord</title>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "ALDI Nord Test Recipe",
            "author": "ALDI Nord Chef",
            "recipeIngredient": [
              "2 cups flour",
              "1 cup sugar",
              "3 eggs"
            ],
            "recipeInstructions": [
              {"text": "Mix ingredients together"},
              {"text": "Bake for 30 minutes"}
            ],
            "totalTime": "PT45M",
            "recipeYield": "4 servings",
            "recipeCategory": "Dessert"
          }
          </script>
        </head>
        <body>
          <h1>ALDI Nord Test Recipe</h1>
        </body>
        </html>
      `;

      const scraper = new AldiNord(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('ALDI Nord Test Recipe');
      expect(result.recipe!.ingredients).toHaveLength(3);
      expect(result.recipe!.instructions).toHaveLength(2);
      expect(result.recipe!.totalTime).toBe(45);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.category).toBe('Dessert');
    });

    it('should handle static value exception for author', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "Test Recipe",
            "recipeIngredient": ["Test ingredient"],
            "recipeInstructions": [{"text": "Test instruction"}]
          }
          </script>
        </head>
        <body></body>
        </html>
      `;

      const scraper = new AldiNord(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe!.author).toBe('ALDI');
    });
  });
});