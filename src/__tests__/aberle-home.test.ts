import { AberleHome } from '../scrapers/aberle-home';
import { ScraperResult } from '../types/recipe';

describe('AberleHome', () => {
  const testUrl = 'https://aberle-home.de/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for aberlehome.com URLs', () => {
      expect(AberleHome.canScrape('https://aberlehome.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Aberle Home URLs', () => {
      expect(AberleHome.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(AberleHome.host()).toBe('aberlehome.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Delicious Recipe - Aberle Home</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Delicious Recipe",
              "description": "A wonderful recipe description",
              "image": "https://aberle-home.de/recipe-image.jpg",
              "author": {
                "@type": "Person",
                "name": "Chef Aberle"
              },
              "totalTime": "PT45M",
              "recipeYield": "4 servings",
              "recipeIngredient": [
                "2 cups flour",
                "1 cup sugar",
                "3 eggs"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Mix flour and sugar"
                },
                {
                  "@type": "HowToStep", 
                  "text": "Add eggs and mix well"
                }
              ],
              "nutrition": {
                "@type": "NutritionInformation",
                "calories": "250 calories",
                "proteinContent": "8g",
                "carbohydrateContent": "45g"
              }
            }
            </script>
          </head>
          <body>
            <h1>Delicious Recipe</h1>
          </body>
        </html>
      `;

      const scraper = new AberleHome(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Delicious Recipe');
      expect(result.recipe!.description).toBe('A wonderful recipe description');
      expect(result.recipe!.image).toBe('https://aberle-home.de/recipe-image.jpg');
      expect(result.recipe!.author).toBe('Chef Aberle');
      expect(result.recipe!.totalTime).toBe(45);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.ingredients).toHaveLength(3);
      expect(result.recipe!.instructions).toHaveLength(2);
      expect(result.recipe!.nutritionInfo?.calories).toBe('250 calories');
    });

    it('should handle missing schema.org data gracefully', async () => {
      const htmlWithoutSchema = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Recipe Title</title>
            <meta property="og:description" content="Recipe description">
          </head>
          <body>
            <h1>Recipe Title</h1>
          </body>
        </html>
      `;

      const scraper = new AberleHome(htmlWithoutSchema, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Recipe Title');
      expect(result.recipe!.description).toBe('Recipe description');
    });
  });
});