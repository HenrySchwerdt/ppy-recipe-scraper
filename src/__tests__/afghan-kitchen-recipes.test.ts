import { AfghanKitchenRecipes } from '../scrapers/afghan-kitchen-recipes';
import { ScraperResult } from '../types/recipe';

describe('AfghanKitchenRecipes', () => {
  const testUrl = 'https://afghankitchenrecipes.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for afghankitchenrecipes.com URLs', () => {
      expect(AfghanKitchenRecipes.canScrape('https://afghankitchenrecipes.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Afghan Kitchen Recipes URLs', () => {
      expect(AfghanKitchenRecipes.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(AfghanKitchenRecipes.host()).toBe('afghankitchenrecipes.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Afghan Kabuli Pulao - Afghan Kitchen Recipes</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "Afghan Kabuli Pulao",
              "description": "Traditional Afghan rice dish with lamb and raisins",
              "image": "https://afghankitchenrecipes.com/kabuli-pulao.jpg",
              "author": {
                "@type": "Person",
                "name": "Afghan Kitchen"
              },
              "totalTime": "PT120M",
              "recipeYield": "6 servings",
              "recipeIngredient": [
                "2 lbs lamb, cut into pieces",
                "3 cups basmati rice",
                "1 cup raisins",
                "1 cup almonds, sliced"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Soak rice in water for 30 minutes"
                },
                {
                  "@type": "HowToStep",
                  "text": "Brown the lamb pieces in oil"
                }
              ],
              "nutrition": {
                "@type": "NutritionInformation",
                "calories": "450 calories",
                "proteinContent": "25g",
                "carbohydrateContent": "55g"
              }
            }
            </script>
          </head>
          <body>
            <h1>Afghan Kabuli Pulao</h1>
          </body>
        </html>
      `;

      const scraper = new AfghanKitchenRecipes(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Afghan Kabuli Pulao');
      expect(result.recipe!.description).toBe('Traditional Afghan rice dish with lamb and raisins');
      expect(result.recipe!.author).toBe('Afghan Kitchen');
      expect(result.recipe!.totalTime).toBe(120);
      expect(result.recipe!.yields).toBe('6 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });

    it('should handle missing schema.org data gracefully', async () => {
      const htmlWithoutSchema = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Afghan Recipe - Afghan Kitchen Recipes</title>
            <meta property="og:description" content="Delicious Afghan dish">
          </head>
          <body>
            <h1>Afghan Recipe</h1>
          </body>
        </html>
      `;

      const scraper = new AfghanKitchenRecipes(htmlWithoutSchema, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Afghan Recipe');
      expect(result.recipe!.description).toBe('Delicious Afghan dish');
    });
  });
});