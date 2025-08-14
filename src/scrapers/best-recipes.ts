import { AbstractScraper } from './base';
import { StaticValueException } from '../utils/exceptions';

export class BestRecipes extends AbstractScraper {
  static host(): string {
    return 'bestrecipes.com.au';
  }

  static canScrape(url: string): boolean {
    return url.includes('bestrecipes.com.au');
  }

  author(): string | undefined {
    return this.schema.author();
  }

  siteName(): string {
    return 'Best Recipes';
  }

  title(): string {
    return this.schema.title() || '';
  }

  ingredients(): string[] {
    return this.schema.ingredients();
  }

  instructions(): string {
    return this.schema.instructions();
  }

  category(): string | undefined {
    return this.schema.category();
  }

  yields(): string | undefined {
    return this.schema.yields();
  }

  description(): string | undefined {
    return this.schema.description();
  }

  totalTime(): number | undefined {
    return this.schema.totalTime();
  }

  cookTime(): number | undefined {
    return this.schema.cookTime();
  }

  prepTime(): number | undefined {
    return this.schema.prepTime();
  }

  cuisine(): string | undefined {
    return this.schema.cuisine();
  }

  image(): string | undefined {
    return this.schema.image();
  }

  language(): string | undefined {
    throw new StaticValueException('en-AU');
  }
}