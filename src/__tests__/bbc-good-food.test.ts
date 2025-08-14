import { BBCGoodFood } from '../scrapers/bbc-good-food';
import { ScraperResult } from '../types/recipe';

describe('BBCGoodFood', () => {
  const testUrl = 'https://bbcgoodfood.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for bbcgoodfood.com URLs', () => {
      expect(BBCGoodFood.canScrape('https://bbcgoodfood.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-BBC Good Food URLs', () => {
      expect(BBCGoodFood.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(BBCGoodFood.host()).toBe('bbcgoodfood.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Classic Fish & Chips - BBC Good Food</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Classic Fish & Chips",
              "description": "Traditional British fish and chips recipe",
              "image": "https://bbcgoodfood.com/fish-chips.jpg",
              "author": {
                "@type": "Person",
                "name": "BBC Good Food Team"
              },
              "totalTime": "PT50M",
              "recipeYield": "4 servings",
              "recipeIngredient": [
                "4 large white fish fillets",
                "1kg potatoes, cut into chips",
                "200g plain flour",
                "300ml beer"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Cut potatoes into thick chips and soak in cold water"
                },
                {
                  "@type": "HowToStep",
                  "text": "Make batter with flour, beer and baking powder"
                }
              ],
              "nutrition": {
                "@type": "NutritionInformation",
                "calories": "650 calories",
                "proteinContent": "35g",
                "carbohydrateContent": "65g"
              }
            }
            </script>
          </head>
          <body>
            <h1>Classic Fish & Chips</h1>
          </body>
        </html>
      `;

      const scraper = new BBCGoodFood(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Classic Fish & Chips');
      expect(result.recipe!.description).toBe('Traditional British fish and chips recipe');
      expect(result.recipe!.author).toBe('BBC Good Food Team');
      expect(result.recipe!.totalTime).toBe(50);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });

    it('should handle missing schema.org data gracefully', async () => {
      const htmlWithoutSchema = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>British Recipe - BBC Good Food</title>
            <meta property="og:description" content="Delicious British cuisine">
          </head>
          <body>
            <h1>British Recipe</h1>
          </body>
        </html>
      `;

      const scraper = new BBCGoodFood(htmlWithoutSchema, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('British Recipe');
      expect(result.recipe!.description).toBe('Delicious British cuisine');
    });
  });
});