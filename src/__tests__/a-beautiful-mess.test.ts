import { ABeautifulMess } from '../scrapers/a-beautiful-mess';
import { ScraperResult } from '../types/recipe';

describe('ABeautifulMess', () => {
  const testUrl = 'https://www.abeautifulmess.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for abeautifulmess.com URLs', () => {
      expect(ABeautifulMess.canScrape('https://www.abeautifulmess.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-A Beautiful Mess URLs', () => {
      expect(ABeautifulMess.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(ABeautifulMess.host()).toBe('abeautifulmess.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Recipe - A Beautiful Mess</title>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "Beautiful Test Recipe",
            "author": "A Beautiful Mess Team",
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
          <h1>Beautiful Test Recipe</h1>
          <div class="wprm-recipe-equipment-name">Stand Mixer</div>
          <div class="wprm-recipe-equipment-name">Baking Sheet</div>
          <div class="wprm-recipe-equipment-name">Wire Rack</div>
        </body>
        </html>
      `;

      const scraper = new ABeautifulMess(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Beautiful Test Recipe');
      expect(result.recipe!.ingredients).toHaveLength(3);
      expect(result.recipe!.instructions).toHaveLength(2);
      expect(result.recipe!.totalTime).toBe(45);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.category).toBe('Dessert');
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
          <div class="wprm-recipe-equipment-name">Stand Mixer</div>
          <div class="wprm-recipe-equipment-name">Baking Sheet</div>
          <div class="wprm-recipe-equipment-name">Wire Rack</div>
        </body>
        </html>
      `;

      const scraper = new ABeautifulMess(mockHtml, testUrl);
      const equipment = scraper.equipment();

      expect(equipment).toEqual(['Stand Mixer', 'Baking Sheet', 'Wire Rack']);
    });
  });
});