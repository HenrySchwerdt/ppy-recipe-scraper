import { ClosetCooking } from '../scrapers/closet-cooking';
import { ScraperResult } from '../types/recipe';

describe('ClosetCooking', () => {
  const testUrl = 'https://closetcooking.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for closetcooking.com URLs', () => {
      expect(ClosetCooking.canScrape('https://closetcooking.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Closet Cooking URLs', () => {
      expect(ClosetCooking.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(ClosetCooking.host()).toBe('closetcooking.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Chicken Tikka Masala - Closet Cooking</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Chicken Tikka Masala",
              "description": "Creamy and flavorful Indian chicken curry",
              "image": "https://closetcooking.com/tikka-masala.jpg",
              "author": {
                "@type": "Person",
                "name": "Kevin Lynch"
              },
              "totalTime": "PT50M",
              "recipeYield": "4 servings",
              "recipeIngredient": [
                "1 lb chicken breast, cubed",
                "1 cup plain yogurt",
                "2 tbsp garam masala",
                "1 cup heavy cream"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Marinate chicken in yogurt and spices for 30 minutes"
                },
                {
                  "@type": "HowToStep",
                  "text": "Cook chicken in skillet until golden brown"
                }
              ]
            }
            </script>
          </head>
          <body>
            <h1>Chicken Tikka Masala</h1>
          </body>
        </html>
      `;

      const scraper = new ClosetCooking(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Chicken Tikka Masala');
      expect(result.recipe!.description).toBe('Creamy and flavorful Indian chicken curry');
      expect(result.recipe!.author).toBe('Kevin Lynch');
      expect(result.recipe!.totalTime).toBe(50);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });
  });
});