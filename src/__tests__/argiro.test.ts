import { Argiro } from '../scrapers/argiro';
import { ScraperResult } from '../types/recipe';

describe('Argiro', () => {
  const testUrl = 'https://argiro.gr/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for argiro.gr URLs', () => {
      expect(Argiro.canScrape('https://argiro.gr/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Argiro URLs', () => {
      expect(Argiro.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(Argiro.host()).toBe('argiro.gr');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Μουσακάς - Argiro.gr</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Μουσακάς",
              "description": "Παραδοσιακός ελληνικός μουσακάς",
              "image": "https://argiro.gr/moussaka.jpg",
              "author": {
                "@type": "Person",
                "name": "Αργυρώ Μπαρμπαρίγου"
              },
              "totalTime": "PT105M",
              "recipeYield": "8 servings",
              "recipeIngredient": [
                "2 κιλά μελιτζάνες",
                "500γρ κιμά μοσχαρίσιο",
                "2 κρεμμύδια",
                "3 ντομάτες"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Κόβουμε τις μελιτζάνες σε φέτες και τις τηγανίζουμε"
                },
                {
                  "@type": "HowToStep",
                  "text": "Σοτάρουμε τον κιμά με τα κρεμμύδια"
                }
              ],
              "nutrition": {
                "@type": "NutritionInformation",
                "calories": "380 calories",
                "proteinContent": "22g",
                "carbohydrateContent": "15g"
              }
            }
            </script>
          </head>
          <body>
            <h1>Μουσακάς</h1>
          </body>
        </html>
      `;

      const scraper = new Argiro(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Μουσακάς');
      expect(result.recipe!.description).toBe('Παραδοσιακός ελληνικός μουσακάς');
      expect(result.recipe!.author).toBe('Αργυρώ Μπαρμπαρίγου');
      expect(result.recipe!.totalTime).toBe(105);
      expect(result.recipe!.yields).toBe('8 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });

    it('should handle missing schema.org data gracefully', async () => {
      const htmlWithoutSchema = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ελληνική Συνταγή - Argiro.gr</title>
            <meta property="og:description" content="Νόστιμη ελληνική κουζίνα">
          </head>
          <body>
            <h1>Ελληνική Συνταγή</h1>
          </body>
        </html>
      `;

      const scraper = new Argiro(htmlWithoutSchema, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Ελληνική Συνταγή');
      expect(result.recipe!.description).toBe('Νόστιμη ελληνική κουζίνα');
    });
  });
});