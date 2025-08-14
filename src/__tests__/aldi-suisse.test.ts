import { AldiSuisse } from '../scrapers/aldi-suisse';
import { ScraperResult } from '../types/recipe';

describe('AldiSuisse', () => {
  const testUrl = 'https://aldi-suisse.ch/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for aldi-suisse.ch URLs', () => {
      expect(AldiSuisse.canScrape('https://aldi-suisse.ch/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-ALDI Suisse URLs', () => {
      expect(AldiSuisse.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(AldiSuisse.host()).toBe('aldi-suisse.ch');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Rösti mit Speck - ALDI SUISSE</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Rösti mit Speck",
              "description": "Traditionelle Schweizer Rösti mit knusprigem Speck",
              "image": "https://aldi-suisse.ch/roesti-speck.jpg",
              "author": {
                "@type": "Organization",
                "name": "ALDI SUISSE"
              },
              "totalTime": "PT45M",
              "recipeYield": "4 Portionen",
              "recipeIngredient": [
                "1 kg Kartoffeln, festkochend",
                "200g Speck, gewürfelt",
                "2 EL Butter",
                "1 Zwiebel, gehackt"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Kartoffeln schälen und grob raffeln"
                },
                {
                  "@type": "HowToStep",
                  "text": "Speck in der Pfanne knusprig braten"
                }
              ],
              "nutrition": {
                "@type": "NutritionInformation",
                "calories": "320 kcal",
                "proteinContent": "12g",
                "carbohydrateContent": "35g"
              }
            }
            </script>
          </head>
          <body>
            <h1>Rösti mit Speck</h1>
          </body>
        </html>
      `;

      const scraper = new AldiSuisse(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Rösti mit Speck');
      expect(result.recipe!.description).toBe('Traditionelle Schweizer Rösti mit knusprigem Speck');
      expect(result.recipe!.author).toBe('ALDI SUISSE');
      expect(result.recipe!.totalTime).toBe(45);
      expect(result.recipe!.yields).toBe('4 Portionen');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });

    it('should handle missing schema.org data gracefully', async () => {
      const htmlWithoutSchema = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Schweizer Rezept - ALDI SUISSE</title>
            <meta property="og:description" content="Leckere Schweizer Küche">
          </head>
          <body>
            <h1>Schweizer Rezept</h1>
          </body>
        </html>
      `;

      const scraper = new AldiSuisse(htmlWithoutSchema, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Schweizer Rezept');
      expect(result.recipe!.description).toBe('Leckere Schweizer Küche');
    });
  });
});