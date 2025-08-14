import { RecipeScraper, scrapeRecipe } from '../recipe-scraper';

// Mock fetch for testing
global.fetch = jest.fn();

describe('RecipeScraper', () => {
  let recipeScraper: RecipeScraper;

  beforeEach(() => {
    recipeScraper = new RecipeScraper();
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for supported URLs', () => {
      expect(recipeScraper.canScrape('https://www.aldi-sued.de/de/r.some-recipe.html')).toBe(true);
    });

    it('should return false for unsupported URLs', () => {
      expect(recipeScraper.canScrape('https://www.unsupported-site.com/recipe')).toBe(false);
    });
  });

  describe('getSupportedDomains', () => {
    it('should return list of supported domains', () => {
      const domains = recipeScraper.getSupportedDomains();
      expect(domains).toContain('aldi.com.au');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a supported URL', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Recipe</title>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "Test Recipe",
            "recipeIngredient": ["Test ingredient"],
            "recipeInstructions": [{"text": "Test instruction"}]
          }
          </script>
        </head>
        <body>
          <h1>Test Recipe</h1>
        </body>
        </html>
      `;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await recipeScraper.scrape('https://www.aldi.com.au/en/recipes/test-recipe.html');

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Test Recipe');
    });

    it('should return error for unsupported URLs', async () => {
      const result = await recipeScraper.scrape('https://www.unsupported-site.com/recipe');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No scraper available for URL');
    });
  });
});

describe('scrapeRecipe convenience function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work as a standalone function', async () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Convenience Test Recipe</title>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Recipe",
          "name": "Convenience Test Recipe",
          "recipeIngredient": ["Test ingredient"],
          "recipeInstructions": [{"text": "Test instruction"}]
        }
        </script>
      </head>
      <body>
        <h1>Convenience Test Recipe</h1>
      </body>
      </html>
    `;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHtml)
    });

    const result = await scrapeRecipe('https://www.aldi.com.au/en/recipes/convenience-test.html');

    expect(result.success).toBe(true);
    expect(result.recipe!.title).toBe('Convenience Test Recipe');
  });
});