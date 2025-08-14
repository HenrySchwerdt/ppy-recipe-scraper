import { Chefnini } from '../scrapers/chefnini';
import { ScraperResult } from '../types/recipe';

describe('Chefnini', () => {
  const testUrl = 'https://chefnini.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for chefnini.com URLs', () => {
      expect(Chefnini.canScrape('https://chefnini.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Chefnini URLs', () => {
      expect(Chefnini.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(Chefnini.host()).toBe('chefnini.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tarte Tatin - Chefnini</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Tarte Tatin",
              "description": "Tarte aux pommes caramélisées à l'envers",
              "image": "https://chefnini.com/tarte-tatin.jpg",
              "author": {
                "@type": "Person",
                "name": "Chefnini"
              },
              "totalTime": "PT75M",
              "recipeYield": "8 portions",
              "recipeIngredient": [
                "1 pâte brisée",
                "8 pommes Golden",
                "100 g sucre",
                "50 g beurre"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Éplucher et couper les pommes en quartiers"
                },
                {
                  "@type": "HowToStep",
                  "text": "Faire un caramel avec le sucre"
                }
              ]
            }
            </script>
          </head>
          <body>
            <h1>Tarte Tatin</h1>
          </body>
        </html>
      `;

      const scraper = new Chefnini(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Tarte Tatin');
      expect(result.recipe!.description).toBe('Tarte aux pommes caramélisées à l\'envers');
      expect(result.recipe!.author).toBe('Chefnini');
      expect(result.recipe!.totalTime).toBe(75);
      expect(result.recipe!.yields).toBe('8 portions');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });
  });
});