import { AldiSued } from '../scrapers/aldi-sued';
import { ScraperResult } from '../types/recipe';

describe('AldiSued', () => {
  const testUrl = 'https://www.aldi-sued.de/de/r.test-recipe.html';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for aldi-sued.de URLs', () => {
      expect(AldiSued.canScrape('https://www.aldi-sued.de/de/r.some-recipe.html')).toBe(true);
    });

    it('should return false for non-ALDI Süd URLs', () => {
      expect(AldiSued.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(AldiSued.host()).toBe('aldi-sued.de');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Recipe - ALDI SÜD</title>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "ALDI SÜD Test Recipe",
            "author": "ALDI SÜD Chef",
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
          <h1>ALDI SÜD Test Recipe</h1>
        </body>
        </html>
      `;

      const scraper = new AldiSued(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('ALDI SÜD Test Recipe');
      expect(result.recipe!.ingredients).toHaveLength(3);
      expect(result.recipe!.instructions).toHaveLength(2);
      expect(result.recipe!.totalTime).toBe(45);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.category).toBe('Dessert');
    });

    it('should handle special instruction formatting', async () => {
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
            "recipeInstructions": [
              {"text": "Mix ingre­dients together"},
              {"text": "Bake for 30 min­utes"}
            ]
          }
          </script>
        </head>
        <body></body>
        </html>
      `;

      const scraper = new AldiSued(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe!.instructions).toEqual([
        'Mix ingredients together',
        'Bake for 30 minutes'
      ]);
    });
  });
});