import { ChefJackOvens } from '../scrapers/chef-jack-ovens';
import { ScraperResult } from '../types/recipe';

describe('ChefJackOvens', () => {
  const testUrl = 'https://chefjackovens.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for chefjackovens.com URLs', () => {
      expect(ChefJackOvens.canScrape('https://chefjackovens.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Chef Jack Ovens URLs', () => {
      expect(ChefJackOvens.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(ChefJackOvens.host()).toBe('chefjackovens.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>BBQ Ribs Recipe - Chef Jack Ovens</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "BBQ Ribs Recipe",
              "description": "Smoky and tender BBQ ribs with homemade sauce",
              "image": "https://chefjackovens.com/bbq-ribs.jpg",
              "author": {
                "@type": "Person",
                "name": "Chef Jack Ovens"
              },
              "totalTime": "PT210M",
              "recipeYield": "6 servings",
              "recipeIngredient": [
                "2 racks baby back ribs",
                "2 tbsp brown sugar",
                "1 tbsp paprika",
                "1 cup BBQ sauce"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Remove membrane from back of ribs"
                },
                {
                  "@type": "HowToStep",
                  "text": "Mix all dry ingredients for rub"
                }
              ]
            }
            </script>
          </head>
          <body>
            <h1>BBQ Ribs Recipe</h1>
          </body>
        </html>
      `;

      const scraper = new ChefJackOvens(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('BBQ Ribs Recipe');
      expect(result.recipe!.description).toBe('Smoky and tender BBQ ribs with homemade sauce');
      expect(result.recipe!.author).toBe('Chef Jack Ovens');
      expect(result.recipe!.totalTime).toBe(210);
      expect(result.recipe!.yields).toBe('6 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });
  });
});