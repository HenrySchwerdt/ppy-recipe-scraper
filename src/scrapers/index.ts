import { AbstractScraper } from './base';
import { Aldi } from './aldi';
import { AldiNord } from './aldi-nord';
import { AldiSued } from './aldi-sued';
import { AldiSuisse } from './aldi-suisse';
import { Rewe } from './rewe';
import { Rezeptwelt } from './rezeptwelt';
import { ABeautifulMess } from './a-beautiful-mess';
import { AberleHome } from './aberle-home';
import { AllRecipes } from './all-recipes';
import { AmazingOriental } from './amazing-oriental';
import { AfghanKitchenRecipes } from './afghan-kitchen-recipes';
import { ArchanasKitchen } from './archanas-kitchen';
import { Argiro } from './argiro';
import { BBCGoodFood } from './bbc-good-food';
import { BonAppetit } from './bon-appetit';
import { BudgetBytes } from './budget-bytes';
import { BettyCrocker } from './betty-crocker';
import { BestRecipes } from './best-recipes';
import { ChefJackOvens } from './chef-jack-ovens';
import { Chefkoch } from './chefkoch';
import { Chefnini } from './chefnini';
import { CookieAndKate } from './cookie-and-kate';
import { CookingLight } from './cooking-light';
import { CookPad } from './cookpad';
import { ClosetCooking } from './closet-cooking';
import { ChefSavvy } from './chef-savvy';
import { LidlKochen } from './lidl-kochen';

export { 
  AbstractScraper, 
  Aldi, 
  AldiNord, 
  AldiSued, 
  AldiSuisse, 
  Rewe, 
  Rezeptwelt,
  ABeautifulMess,
  AberleHome,
  AllRecipes,
  AmazingOriental,
  AfghanKitchenRecipes,
  ArchanasKitchen,
  Argiro,
  BBCGoodFood,
  BonAppetit,
  BudgetBytes,
  BettyCrocker,
  BestRecipes,
  ChefJackOvens,
  Chefkoch,
  Chefnini,
  CookieAndKate,
  CookingLight,
  CookPad,
  ClosetCooking,
  ChefSavvy,
  LidlKochen
};

export const SCRAPERS = [
  Aldi,
  AldiNord,
  AldiSued,
  AldiSuisse,
  Rewe,
  Rezeptwelt,
  ABeautifulMess,
  AberleHome,
  AllRecipes,
  AmazingOriental,
  AfghanKitchenRecipes,
  ArchanasKitchen,
  Argiro,
  BBCGoodFood,
  BonAppetit,
  BudgetBytes,
  BettyCrocker,
  BestRecipes,
  ChefJackOvens,
  Chefkoch,
  Chefnini,
  CookieAndKate,
  CookingLight,
  CookPad,
  ClosetCooking,
  ChefSavvy,
  LidlKochen
] as const;

export type ScraperClass = typeof SCRAPERS[number];

// Factory function to create scraper from URL and HTML
export async function createScraperFromUrl(url: string, options?: { timeout?: number; userAgent?: string }): Promise<AbstractScraper | null> {
  try {
    // First check if any scraper can handle this URL
    let ScraperClass: any = null;
    for (const Scraper of SCRAPERS) {
      if (Scraper.canScrape(url)) {
        ScraperClass = Scraper;
        break;
      }
    }
    
    if (!ScraperClass) {
      return null; // No scraper available for this URL
    }

    // Fetch HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': options?.userAgent || 'Mozilla/5.0 (compatible; RecipeScraperTS/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    return new ScraperClass(html, url, options);
  } catch (error) {
    throw new Error(`Failed to create scraper: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}