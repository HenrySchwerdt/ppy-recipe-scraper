import { AbstractScraper } from './scrapers/base';
import { SCRAPERS, createScraperFromUrl } from './scrapers/index';
import { ScraperOptions, ScraperResult } from './types/recipe';

export class RecipeScraper {
  private options: ScraperOptions;

  constructor(options: ScraperOptions = {}) {
    this.options = options;
  }

  /**
   * Scrape a recipe from the given URL
   */
  async scrape(url: string): Promise<ScraperResult> {
    try {
      const scraper = await createScraperFromUrl(url, this.options);
      if (!scraper) {
        return {
          success: false,
          error: `No scraper available for URL: ${url}`
        };
      }

      return await scraper.scrape();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check if a URL can be scraped
   */
  canScrape(url: string): boolean {
    return this.getScraperClass(url) !== null;
  }

  /**
   * Get list of supported domains
   */
  getSupportedDomains(): string[] {
    return SCRAPERS.map(ScraperClass => ScraperClass.host());
  }

  private getScraperClass(url: string): any {
    for (const ScraperClass of SCRAPERS) {
      if (ScraperClass.canScrape(url)) {
        return ScraperClass;
      }
    }
    return null;
  }
}

// Convenience function for one-off scraping
export async function scrapeRecipe(url: string, options?: ScraperOptions): Promise<ScraperResult> {
  const scraper = new RecipeScraper(options);
  return scraper.scrape(url);
}