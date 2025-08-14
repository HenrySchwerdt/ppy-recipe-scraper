import { CookieAndKate } from '../scrapers/cookie-and-kate';
import { ScraperResult } from '../types/recipe';

describe('CookieAndKate', () => {
  const testUrl = 'https://cookieandkate.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for cookieandkate.com URLs', () => {
      expect(CookieAndKate.canScrape('https://cookieandkate.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Cookie and Kate URLs', () => {
      expect(CookieAndKate.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(CookieAndKate.host()).toBe('cookieandkate.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Rainbow Veggie Bowl - Cookie and Kate</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Rainbow Veggie Bowl",
              "description": "Healthy and colorful vegetable bowl with tahini dressing",
              "image": "https://cookieandkate.com/veggie-bowl.jpg",
              "author": {
                "@type": "Person",
                "name": "Kate Taylor"
              },
              "totalTime": "PT45M",
              "recipeYield": "4 servings",
              "recipeIngredient": [
                "2 cups quinoa, cooked",
                "1 cup red cabbage, shredded",
                "1 cucumber, diced",
                "1/4 cup tahini"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Cook quinoa according to package directions"
                },
                {
                  "@type": "HowToStep",
                  "text": "Prepare all vegetables and arrange in bowls"
                }
              ]
            }
            </script>
          </head>
          <body>
            <h1>Rainbow Veggie Bowl</h1>
          </body>
        </html>
      `;

      const scraper = new CookieAndKate(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Rainbow Veggie Bowl');
      expect(result.recipe!.description).toBe('Healthy and colorful vegetable bowl with tahini dressing');
      expect(result.recipe!.author).toBe('Kate Taylor');
      expect(result.recipe!.totalTime).toBe(45);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });
  });
});