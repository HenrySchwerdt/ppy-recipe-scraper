import { BudgetBytes } from '../scrapers/budget-bytes';
import { ScraperResult } from '../types/recipe';

describe('BudgetBytes', () => {
  const testUrl = 'https://budgetbytes.com/recipe/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for budgetbytes.com URLs', () => {
      expect(BudgetBytes.canScrape('https://budgetbytes.com/recipe/some-recipe')).toBe(true);
    });

    it('should return false for non-Budget Bytes URLs', () => {
      expect(BudgetBytes.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(BudgetBytes.host()).toBe('budgetbytes.com');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>One Pot Pasta - Budget Bytes</title>
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Recipe",
              "name": "One Pot Pasta",
              "description": "Easy and affordable one pot pasta recipe",
              "image": "https://budgetbytes.com/one-pot-pasta.jpg",
              "author": {
                "@type": "Person",
                "name": "Beth Moncel"
              },
              "totalTime": "PT20M",
              "recipeYield": "4 servings",
              "recipeIngredient": [
                "12 oz pasta",
                "1 can diced tomatoes",
                "1 onion, diced",
                "2 cups vegetable broth"
              ],
              "recipeInstructions": [
                {
                  "@type": "HowToStep",
                  "text": "Add all ingredients except cheese to large pot"
                },
                {
                  "@type": "HowToStep",
                  "text": "Bring to boil, then reduce heat and simmer"
                }
              ]
            }
            </script>
          </head>
          <body>
            <h1>One Pot Pasta</h1>
          </body>
        </html>
      `;

      const scraper = new BudgetBytes(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('One Pot Pasta');
      expect(result.recipe!.description).toBe('Easy and affordable one pot pasta recipe');
      expect(result.recipe!.author).toBe('Beth Moncel');
      expect(result.recipe!.totalTime).toBe(20);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
    });
  });
});