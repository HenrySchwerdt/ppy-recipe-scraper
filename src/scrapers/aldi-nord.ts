import { AbstractScraper } from './base';
import { StaticValueException } from '../utils/exceptions';

export class AldiNord extends AbstractScraper {
  static host(domain: string = 'aldi-nord.de'): string {
    return domain;
  }

  static canScrape(url: string): boolean {
    return url.includes('aldi-nord.de');
  }

  author(): string | undefined {
    const schemaAuthor = this.schema.author();
    if (schemaAuthor) return schemaAuthor;
    
    throw new StaticValueException('ALDI');
  }

  siteName(): string {
    throw new StaticValueException('ALDI');
  }

  title(): string {
    return this.schema.title() || '';
  }

  ingredients(): string[] {
    return this.schema.ingredients();
  }

  instructions(): string {
    const instructions = this.schema.instructions();
    return instructions
      .replace(/\xa0/g, ' ')
      .replace(/\r\n /g, '\n');
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