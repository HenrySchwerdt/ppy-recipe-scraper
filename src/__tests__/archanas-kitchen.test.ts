import { ArchanasKitchen } from '../scrapers/archanas-kitchen';
import { ScraperResult } from '../types/recipe';

describe('ArchanasKitchen', () => {
  const testUrl = 'https://archanaskitchen.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for archanaskitchen.com URLs', () => {
      expect(ArchanasKitchen.canScrape('https://archanaskitchen.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Archana\'s Kitchen URLs', () => {
      expect(ArchanasKitchen.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(ArchanasKitchen.host()).toBe('archanaskitchen.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Butter Chicken Recipe - Archana's Kitchen</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Butter Chicken Recipe",
              "description": "Creamy and delicious Indian butter chicken",
              "image": "https://archanaskitchen.com/butter-chicken.jpg",
              "author": {
                "@type": "Person",
                "name": "Archana Doshi"
              },
              "totalTime": "PT75M",
              "recipeYield": "4 servings",
              "recipeIngredient": [
                "1 kg chicken, cut into pieces",
                "1 cup heavy cream",
                "2 tbsp butter",
                "1 onion, finely chopped"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Marinate chicken with yogurt and spices for 30 minutes"
                },
                {
                  "@type": "HowToStep",
                  "text": "Cook chicken in a pan until golden brown"
                }
              ],
              "nutrition": {
                "@type": "NutritionInformation",
                "calories": "420 calories",
                "proteinContent": "35g",
                "carbohydrateContent": "8g"
              }
            }
            </script>
          </head>
          <body>
            <h1>Butter Chicken Recipe</h1>
          </body>
        </html>
      `;

      const scraper = new ArchanasKitchen(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Butter Chicken Recipe');
      expect(result.recipe!.description).toBe('Creamy and delicious Indian butter chicken');
      expect(result.recipe!.author).toBe('Archana Doshi');
      expect(result.recipe!.totalTime).toBe(75);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });

    it('should handle missing schema.org data gracefully', async () => {
      const htmlWithoutSchema = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Indian Recipe - Archana's Kitchen</title>
            <meta property="og:description" content="Authentic Indian cooking">
          </head>
          <body>
            <h1>Indian Recipe</h1>
          </body>
        </html>
      `;

      const scraper = new ArchanasKitchen(htmlWithoutSchema, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Indian Recipe');
      expect(result.recipe!.description).toBe('Authentic Indian cooking');
    });
  });
});