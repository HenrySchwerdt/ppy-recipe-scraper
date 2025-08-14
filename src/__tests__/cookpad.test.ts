import { CookPad } from '../scrapers/cookpad';
import { ScraperResult } from '../types/recipe';

describe('CookPad', () => {
  const testUrl = 'https://cookpad.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for cookpad.com URLs', () => {
      expect(CookPad.canScrape('https://cookpad.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Cookpad URLs', () => {
      expect(CookPad.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(CookPad.host()).toBe('cookpad.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Japanese Chicken Teriyaki - Cookpad</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Japanese Chicken Teriyaki",
              "description": "Authentic Japanese teriyaki chicken recipe",
              "image": "https://cookpad.com/teriyaki-chicken.jpg",
              "author": {
                "@type": "Person",
                "name": "Cookpad User"
              },
              "totalTime": "PT35M",
              "recipeYield": "4 servings",
              "recipeIngredient": [
                "4 chicken thighs",
                "3 tbsp soy sauce",
                "2 tbsp mirin",
                "1 tbsp sugar"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Mix soy sauce, mirin, sake and sugar for teriyaki sauce"
                },
                {
                  "@type": "HowToStep",
                  "text": "Heat oil in pan and cook chicken skin-side down"
                }
              ]
            }
            </script>
          </head>
          <body>
            <h1>Japanese Chicken Teriyaki</h1>
          </body>
        </html>
      `;

      const scraper = new CookPad(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Japanese Chicken Teriyaki');
      expect(result.recipe!.description).toBe('Authentic Japanese teriyaki chicken recipe');
      expect(result.recipe!.author).toBe('Cookpad User');
      expect(result.recipe!.totalTime).toBe(35);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });
  });
});