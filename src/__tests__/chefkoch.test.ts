import { Chefkoch } from '../scrapers/chefkoch';
import { ScraperResult } from '../types/recipe';

describe('Chefkoch', () => {
  const testUrl = 'https://chefkoch.de/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for chefkoch.de URLs', () => {
      expect(Chefkoch.canScrape('https://chefkoch.de/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Chefkoch URLs', () => {
      expect(Chefkoch.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(Chefkoch.host()).toBe('chefkoch.de');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Sauerbraten - Chefkoch</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Sauerbraten",
              "description": "Traditioneller rheinischer Sauerbraten",
              "image": "https://chefkoch.de/sauerbraten.jpg",
              "author": {
                "@type": "Person",
                "name": "Chefkoch User"
              },
              "totalTime": "PT210M",
              "recipeYield": "6 Portionen",
              "recipeIngredient": [
                "1,5 kg Rinderbraten",
                "500 ml Rotweinessig",
                "500 ml Rotwein",
                "2 Zwiebeln"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Fleisch 3-4 Tage in Beize einlegen"
                },
                {
                  "@type": "HowToStep",
                  "text": "Fleisch aus der Beize nehmen und trocken tupfen"
                }
              ]
            }
            </script>
          </head>
          <body>
            <h1>Sauerbraten</h1>
          </body>
        </html>
      `;

      const scraper = new Chefkoch(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Sauerbraten');
      expect(result.recipe!.description).toBe('Traditioneller rheinischer Sauerbraten');
      expect(result.recipe!.author).toBe('Chefkoch User');
      expect(result.recipe!.totalTime).toBe(210);
      expect(result.recipe!.yields).toBe('6 Portionen');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });
  });
});