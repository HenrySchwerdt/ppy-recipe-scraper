import { Rewe } from '../scrapers/rewe';
import { ScraperResult } from '../types/recipe';

describe('Rewe', () => {
  const testUrl = 'https://www.rewe.de/rezepte/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for rewe.de URLs', () => {
      expect(Rewe.canScrape('https://www.rewe.de/rezepte/some-recipe')).toBe(true);
    });

    it('should return false for non-REWE URLs', () => {
      expect(Rewe.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(Rewe.host()).toBe('rewe.de');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Recipe - REWE</title>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "REWE Test Recipe",
            "author": "REWE Chef",
            "recipeIngredient": [
              "2 cups flour",
              "1 cup sugar",
              "3 eggs"
            ],
            "recipeInstructions": [
              {"text": "Schritt 1: Mix ingredients together"},
              {"text": "Schritt 2: Bake for 30 minutes"},
              {"text": "Regular instruction without Schritt"}
            ],
            "totalTime": "PT45M",
            "recipeYield": "4 servings",
            "recipeCategory": "Dessert"
          }
          </script>
        </head>
        <body>
          <h1>REWE Test Recipe</h1>
          <h2>Utensilien</h2>
          <div>
            <p class="kitchen-tools-entries">Mixing Bowl, Whisk, Baking Pan</p>
          </div>
        </body>
        </html>
      `;

      const scraper = new Rewe(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('REWE Test Recipe');
      expect(result.recipe!.ingredients).toHaveLength(3);
      expect(result.recipe!.instructions).toHaveLength(3);
      expect(result.recipe!.totalTime).toBe(45);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.category).toBe('Dessert');
    });

    it('should filter out instructions starting with "Schritt"', async () => {
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
              {"text": "Schritt 1: This should be filtered"},
              {"text": "This should remain"},
              {"text": "Schritt 2: This should also be filtered"}
            ]
          }
          </script>
        </head>
        <body></body>
        </html>
      `;

      const scraper = new Rewe(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe!.instructions).toEqual(['This should remain']);
    });

    it('should extract equipment correctly', async () => {
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
        <body>
          <h2>Utensilien</h2>
          <div>
            <p class="kitchen-tools-entries">Mixing Bowl, Whisk, Baking Pan</p>
          </div>
        </body>
        </html>
      `;

      const scraper = new Rewe(mockHtml, testUrl);
      const equipment = scraper.equipment();

      expect(equipment).toEqual(['Mixing Bowl', 'Whisk', 'Baking Pan']);
    });
  });
});