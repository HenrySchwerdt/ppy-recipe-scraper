import { Rezeptwelt } from '../scrapers/rezeptwelt';
import { ScraperResult } from '../types/recipe';

describe('Rezeptwelt', () => {
  const testUrl = 'https://www.rezeptwelt.de/test-recipe';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for rezeptwelt.de URLs', () => {
      expect(Rezeptwelt.canScrape('https://www.rezeptwelt.de/some-recipe')).toBe(true);
    });

    it('should return false for non-Rezeptwelt URLs', () => {
      expect(Rezeptwelt.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(Rezeptwelt.host()).toBe('rezeptwelt.de');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a recipe with schema data', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Recipe - Rezeptwelt</title>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "Rezeptwelt Test Recipe",
            "author": "Rezeptwelt Chef",
            "description": "A delicious test recipe Mehr Thermomix ® Rezepte auf www.rezeptwelt.de",
            "recipeIngredient": [
              "2 cups flour",
              "1 cup sugar",
              "3 eggs"
            ],
            "recipeInstructions": [
              {"text": "Mix ingredients together"},
              {"text": "Bake for 30 minutes"}
            ],
            "totalTime": "PT45M",
            "recipeYield": "4 servings",
            "recipeCategory": "Dessert",
            "recipeCuisine": "German"
          }
          </script>
        </head>
        <body>
          <span id="viewRecipeAuthor">Test Author Name</span>
          <div id="preparationSteps">
            <span itemprop="text">
              <p>First step of preparation</p>
              <p>Second step of preparation</p>
              <p></p>
              <p>Third step of preparation</p>
            </span>
          </div>
        </body>
        </html>
      `;

      const scraper = new Rezeptwelt(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Rezeptwelt Test Recipe');
      expect(result.recipe!.ingredients).toHaveLength(3);
      expect(result.recipe!.instructions).toHaveLength(3);
      expect(result.recipe!.totalTime).toBe(45);
      expect(result.recipe!.yields).toBe('4 servings');
      expect(result.recipe!.category).toBe('Dessert');
      expect(result.recipe!.cuisine).toBe('German');
    });

    it('should handle static value exception for site name', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
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
        <body></body>
        </html>
      `;

      const scraper = new Rezeptwelt(mockHtml, testUrl);
      
      // Test that siteName throws StaticValueException
      expect(() => scraper.siteName()).toThrow('Static value: Rezeptwelt');
    });

    it('should remove Thermomix promotion from description', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "Test Recipe",
            "description": "A delicious test recipe Mehr Thermomix ® Rezepte auf www.rezeptwelt.de",
            "recipeIngredient": ["Test ingredient"],
            "recipeInstructions": [{"text": "Test instruction"}]
          }
          </script>
        </head>
        <body></body>
        </html>
      `;

      const scraper = new Rezeptwelt(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe!.description).toBe('A delicious test recipe');
    });

    it('should parse HTML instructions when available', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "Test Recipe",
            "recipeIngredient": ["Test ingredient"]
          }
          </script>
        </head>
        <body>
          <div id="preparationSteps">
            <span itemprop="text">
              <p>First step of preparation</p>
              <p>Second step of preparation</p>
              <p></p>
              <p>Third step of preparation</p>
            </span>
          </div>
        </body>
        </html>
      `;

      const scraper = new Rezeptwelt(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe!.instructions).toEqual([
        'First step of preparation',
        'Second step of preparation',
        'Third step of preparation'
      ]);
    });
  });
});