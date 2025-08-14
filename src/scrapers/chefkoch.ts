import { AbstractScraper } from './base';

export class Chefkoch extends AbstractScraper {
  static host(): string {
    return 'chefkoch.de';
  }

  static canScrape(url: string): boolean {
    return url.includes('chefkoch.de');
  }

  author(): string | undefined {
    return this.schema.author();
  }

  siteName(): string {
    return 'Chefkoch';
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
}