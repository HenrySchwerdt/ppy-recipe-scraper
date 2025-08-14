import { AmazingOriental } from '../scrapers/amazing-oriental';
import { ScraperResult } from '../types/recipe';

describe('AmazingOriental', () => {
  const testUrl = 'https://amazingoriental.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for amazingoriental.com URLs', () => {
      expect(AmazingOriental.canScrape('https://amazingoriental.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Amazing Oriental URLs', () => {
      expect(AmazingOriental.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(AmazingOriental.host()).toBe('amazingoriental.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Kung Pao Chicken - Amazing Oriental</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Kung Pao Chicken",
              "description": "Spicy Sichuan chicken dish with peanuts",
              "image": "https://amazingoriental.com/kung-pao.jpg",
              "author": {
                "@type": "Person",
                "name": "Chef Wong"
              },
              "totalTime": "PT35M",
              "recipeYield": "4 servings",
              "recipeIngredient": [
                "1 lb chicken breast, diced",
                "1/2 cup roasted peanuts",
                "3 dried chilies",
                "2 tbsp soy sauce"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Marinate chicken with soy sauce and cornstarch"
                },
                {
                  "@type": "HowToStep",
                  "text": "Heat oil in wok and stir-fry chicken"
                }
              ],
              "nutrition": {
                "@type": "NutritionInformation",
                "calories": "320 calories",
                "proteinContent": "28g",
                "carbohydrateContent": "12g"
              }
            }
            </script>
          </head>
          <body>
            <h1>Kung Pao Chicken</h1>
          </body>
        </html>
      `;

      const scraper = new AmazingOriental(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Kung Pao Chicken');
      expect(result.recipe!.description).toBe('Spicy Sichuan chicken dish with peanuts');
      expect(result.recipe!.author).toBe('Chef Wong');
      expect(result.recipe!.totalTime).toBe(35);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });

    it('should handle missing schema.org data gracefully', async () => {
      const htmlWithoutSchema = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Oriental Recipe - Amazing Oriental</title>
            <meta property="og:description" content="Delicious Asian cuisine">
          </head>
          <body>
            <h1>Oriental Recipe</h1>
          </body>
        </html>
      `;

      const scraper = new AmazingOriental(htmlWithoutSchema, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Oriental Recipe');
      expect(result.recipe!.description).toBe('Delicious Asian cuisine');
    });
  });
});