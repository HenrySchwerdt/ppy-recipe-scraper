import { Aldi } from '../scrapers/aldi';
import { ScraperResult } from '../types/recipe';

describe('Aldi', () => {
  const testUrl = 'https://www.aldi.com.au/en/recipes/croque-monsieur-mit-champignons-und-spinat';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for aldi.com.au URLs', () => {
      expect(Aldi.canScrape('https://www.aldi.com.au/en/recipes/some-recipe.html')).toBe(true);
    });

    it('should return false for non-Aldi URLs', () => {
      expect(Aldi.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(Aldi.host()).toBe('aldi.com.au');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with proper HTML structure', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Croque Monsieur mit Champignons und Spinat</title>
          <meta name="author" content="ALDI">
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "Croque Monsieur mit Champignons und Spinat",
            "author": "ALDI",
            "recipeIngredient": [
              "8 Scheiben Toastbrot",
              "200g Champignons",
              "150g Spinat",
              "200g Schinken",
              "200g Käse"
            ],
            "recipeInstructions": [
              {"text": "Champignons in Scheiben schneiden und anbraten"},
              {"text": "Spinat waschen und blanchieren"},
              {"text": "Toastbrot mit Schinken, Champignons und Spinat belegen"},
              {"text": "Mit Käse überbacken bis goldbraun"}
            ]
          }
          </script>
        </head>
        <body>
          <h1>Croque Monsieur mit Champignons und Spinat</h1>
        </body>
        </html>
      `;

      const scraper = new Aldi(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Croque Monsieur mit Champignons und Spinat');
      expect(result.recipe!.ingredients).toHaveLength(5);
      expect(result.recipe!.instructions).toHaveLength(4);
    });

    it('should handle pages with no recipe data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>No Recipe Here</title>
        </head>
        <body>
          <h1>Just a regular page</h1>
          <p>No recipe content</p>
        </body>
        </html>
      `;

      const scraper = new Aldi(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(false);
      expect(result.error).toBe('No recipe data found');
    });
  });
});