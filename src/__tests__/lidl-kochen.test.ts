import { LidlKochen } from '../scrapers/lidl-kochen';
import { ScraperResult } from '../types/recipe';

describe('LidlKochen', () => {
  const testUrl = 'https://www.lidl-kochen.de/rezeptwelt/kraeuterlimonade-146073';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('canScrape', () => {
    it('should return true for lidl-kochen.de URLs', () => {
      expect(LidlKochen.canScrape('https://www.lidl-kochen.de/rezeptwelt/some-recipe')).toBe(true);
    });

    it('should return false for non-LIDL Kochen URLs', () => {
      expect(LidlKochen.canScrape('https://www.example.com/recipe')).toBe(false);
    });
  });

  describe('host', () => {
    it('should return the correct host', () => {
      expect(LidlKochen.host()).toBe('lidl-kochen.de');
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a LIDL Kochen recipe', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html lang="de-DE">
        <head>
          <title>Kräuterlimonade - Rezept | LIDL Kochen</title>
          <meta name="description" content="Kräuterlimonade: Lass dich von Lidl Kochen inspirieren und probiere das Rezept direkt aus! ▶ 20min Zubereitung, 8 Zutaten, 350 kcal/Portion.">
          <script type="application/ld+json">
          [{
            "@context": "https://schema.org/",
            "@type": "Recipe",
            "name": "Kräuterlimonade",
            "description": "Kräuterlimonade: Lass dich von Lidl Kochen inspirieren und probiere das Rezept direkt aus! ▶ 20min Zubereitung, 8 Zutaten, 350 kcal/Portion.",
            "recipeYield": "4",
            "prepTime": "PT20M",
            "cookTime": "PT120M",
            "nutrition": {
              "@type": "NutritionInformation",
              "calories": "350 Kalorie"
            },
            "recipeInstructions": [
              {
                "@type": "HowToStep",
                "text": "Zitronen heiß waschen, trocken reiben und jeweils etwa 1 TL Schale sehr dünn abreiben. Alle Zitronen halbieren, auspressen und 300 ml Saft abmessen."
              },
              {
                "@type": "HowToStep",
                "text": "In einem Topf Zitronensaft mit Zucker und Wasser verrühren, aufkochen und ca. 3 Min. sprudelnd kochen, dann lauwarm abkühlen lassen."
              }
            ],
            "recipeIngredient": [
              "Zitronen 5 St.",
              "Zucker 300 g",
              "Wasser 100 ml",
              "Minze, frisch 40 g"
            ]
          }]
          </script>
        </head>
        <body>
          <div class="breadcrumb">
            <ul class="breadcrumb__list">
              <li><a href="/"><span>Home</span></a></li>
              <li><a href="/rezeptwelt/"><span>Rezeptwelt</span></a></li>
              <li><a href="/rezeptwelt/cocktail/"><span>Cocktail</span></a></li>
              <li><a href="/rezeptwelt/kraeuterlimonade-146073"><span>Kräuterlimonade</span></a></li>
            </ul>
          </div>
          
          <h1 class="recipe__header">Kräuterlimonade</h1>
          
          <div class="recipe-detail-data">
            <div class="recipe-detail">
              <p class="recipe-detail__value">
                <span class="recipe-detail__value--title">Zeit gesamt</span>
                2h 20min
              </p>
            </div>
            <div class="recipe-detail">
              <p class="recipe-detail__value">
                <span class="recipe-detail__value--title">Zubereitungszeit</span>
                20min
              </p>
            </div>
            <div class="recipe-detail">
              <p class="recipe-detail__value">
                <span class="recipe-detail__value--title">Schwierigkeit</span>
                Einfach
              </p>
            </div>
          </div>

          <div class="recipe__h2">Zubereitung <small>4 Portionen</small></div>

          <table class="ingredients-table">
            <tr>
              <td>
                <div class="ingredient__name">
                  <span class="ingredient__name__text">Zitronen</span>
                </div>
              </td>
              <td class="ingredient__quantity">5 St.</td>
            </tr>
            <tr>
              <td>
                <div class="ingredient__name">
                  <span class="ingredient__name__text">Zucker</span>
                </div>
              </td>
              <td class="ingredient__quantity">300 g</td>
            </tr>
            <tr>
              <td>
                <div class="ingredient__name">
                  <span class="ingredient__name__text">Wasser</span>
                </div>
              </td>
              <td class="ingredient__quantity">100 ml</td>
            </tr>
          </table>

          <div class="preparation__step">
            <div class="preparation__step-number">1.</div>
            <div class="preparation__step-content">
              <div class="preparation__step-content-text">
                Zitronen heiß waschen, trocken reiben und jeweils etwa 1 TL Schale sehr dünn abreiben. Alle Zitronen halbieren, auspressen und 300 ml Saft abmessen.
              </div>
            </div>
          </div>

          <div class="preparation__step">
            <div class="preparation__step-number">2.</div>
            <div class="preparation__step-content">
              <div class="preparation__step-content-text">
                In einem Topf Zitronensaft mit Zucker und Wasser verrühren, aufkochen und ca. 3 Min. sprudelnd kochen, dann lauwarm abkühlen lassen.
              </div>
            </div>
          </div>

          <div class="ingredients__data">
            <div class="ingredients__list">
              <span class="ingredients__text">kleiner Topf</span>
              <span class="ingredients__text">Sieb</span>
            </div>
          </div>

          <div class="nutritional-values">
            <div class="nutritional-values__item">
              <p class="nutritional-values-item__title">Kaloriengehalt</p>
              <p class="nutritional-values-item__number">350</p>
            </div>
            <div class="nutritional-values__item">
              <p class="nutritional-values-item__title">Kohlenhydrate</p>
              <p class="nutritional-values-item__number">92</p>
            </div>
            <div class="nutritional-values__item">
              <p class="nutritional-values-item__title">Eiweiß</p>
              <p class="nutritional-values-item__number">3</p>
            </div>
          </div>

          <div class="slider__item__recipe">
            <img src="/images/recipe-wide/613327/kraeuterlimonade-146073.jpg" alt="Kräuterlimonade">
          </div>
        </body>
        </html>
      `;

      const scraper = new LidlKochen(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Kräuterlimonade');
      expect(result.recipe!.ingredients).toHaveLength(4);
      expect(result.recipe!.instructions).toHaveLength(2);
      expect(result.recipe!.yields).toBe('4');
      expect(result.recipe!.author).toBe('LIDL Kochen');
      expect(result.recipe!.category).toBe('Cocktail');
      expect(result.recipe!.totalTime).toBe(140); // 2h 20min = 140 minutes
      expect(result.recipe!.image).toBe('/images/recipe-wide/613327/kraeuterlimonade-146073.jpg');
    });

    it('should handle HTML parsing when schema is not available', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Simple Recipe - LIDL Kochen</title>
          <meta name="description" content="A simple test recipe">
        </head>
        <body>
          <h1 class="recipe__header">Simple Test Recipe</h1>
          
          <div class="recipe__h2">Zubereitung <small>2 Portionen</small></div>

          <table class="ingredients-table">
            <tr>
              <td>
                <div class="ingredient__name">
                  <span class="ingredient__name__text">Test Ingredient</span>
                </div>
              </td>
              <td class="ingredient__quantity">1 piece</td>
            </tr>
          </table>

          <div class="preparation__step">
            <div class="preparation__step-content">
              <div class="preparation__step-content-text">
                Mix everything together.
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const scraper = new LidlKochen(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe).toBeDefined();
      expect(result.recipe!.title).toBe('Simple Test Recipe');
      expect(result.recipe!.ingredients).toEqual(['1 piece Test Ingredient']);
      expect(result.recipe!.instructions).toEqual(['Mix everything together.']);
      expect(result.recipe!.yields).toBe('2');
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

      const scraper = new LidlKochen(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(false);
      expect(result.error).toBe('No recipe data found');
    });

    it('should parse time formats correctly', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <body>
          <h1 class="recipe__header">Time Test Recipe</h1>
          
          <div class="recipe-detail">
            <p class="recipe-detail__value">
              <span class="recipe-detail__value--title">Zeit gesamt</span>
              1h 30min
            </p>
          </div>

          <table class="ingredients-table">
            <tr>
              <td><div class="ingredient__name"><span class="ingredient__name__text">Test</span></div></td>
              <td class="ingredient__quantity">1 piece</td>
            </tr>
          </table>

          <div class="preparation__step">
            <div class="preparation__step-content">
              <div class="preparation__step-content-text">Test instruction</div>
            </div>
          </div>
        </body>
        </html>
      `;

      const scraper = new LidlKochen(mockHtml, testUrl);
      const result: ScraperResult = await scraper.scrape();

      expect(result.success).toBe(true);
      expect(result.recipe!.totalTime).toBe(90); // 1h 30min = 90 minutes
    });

    it('should extract equipment correctly', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <body>
          <h1 class="recipe__header">Equipment Test Recipe</h1>
          
          <table class="ingredients-table">
            <tr>
              <td><div class="ingredient__name"><span class="ingredient__name__text">Test</span></div></td>
              <td class="ingredient__quantity">1 piece</td>
            </tr>
          </table>

          <div class="preparation__step">
            <div class="preparation__step-content">
              <div class="preparation__step-content-text">Test instruction</div>
            </div>
          </div>

          <div class="ingredients__data">
            <div class="ingredients__list">
              <span class="ingredients__text">Mixing Bowl</span>
              <span class="ingredients__text">Whisk</span>
              <span class="ingredients__text">Baking Pan</span>
            </div>
          </div>
        </body>
        </html>
      `;

      const scraper = new LidlKochen(mockHtml, testUrl);
      const equipment = scraper.equipment();

      expect(equipment).toEqual(['Mixing Bowl', 'Whisk', 'Baking Pan']);
    });
  });
});