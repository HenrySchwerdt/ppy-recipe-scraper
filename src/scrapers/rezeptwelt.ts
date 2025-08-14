import { AbstractScraper } from './base';
import { StaticValueException, SchemaOrgException } from '../utils/exceptions';

export class Rezeptwelt extends AbstractScraper {
  static host(): string {
    return 'rezeptwelt.de';
  }

  static canScrape(url: string): boolean {
    return url.includes('rezeptwelt.de');
  }

  siteName(): string {
    throw new StaticValueException('Rezeptwelt');
  }

  author(): string | undefined {
    if (!this.$) return undefined;
    
    const authorElement = this.$('span#viewRecipeAuthor');
    if (authorElement.length > 0) {
      return this.normalizeString(authorElement.text());
    }
    
    return this.schema.author();
  }

  title(): string {
    return this.schema.title() || '';
  }

  ingredients(): string[] {
    return this.schema.ingredients();
  }

  instructions(): string {
    if (!this.$) return this.schema.instructions();

    const container = this.$('div#preparationSteps').find('span[itemprop="text"]');
    if (container.length > 0) {
      const instructions: string[] = [];
      container.find('p').each((_: any, paragraph: any) => {
        if (!this.$) return;
        const text = this.normalizeString(this.$(paragraph).text());
        if (text) instructions.push(text);
      });
      
      return instructions.filter(Boolean).join('\n');
    }

    return this.schema.instructions();
  }

  category(): string | undefined {
    return this.schema.category();
  }

  yields(): string | undefined {
    return this.schema.yields();
  }

  description(): string | undefined {
    const description = this.schema.description();
    if (description) {
      return description.replace(' Mehr Thermomix ® Rezepte auf www.rezeptwelt.de', '');
    }
    return undefined;
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
    try {
      return this.schema.cuisine();
    } catch (error) {
      if (error instanceof SchemaOrgException) {
        return undefined;
      }
      throw error;
    }
  }

  image(): string | undefined {
    return this.schema.image();
  }

  language(): string | undefined {
    if (!this.$) return undefined;
    
    const locale = this.$('meta[property="og:locale"]').attr('content');
    return locale || super.language();
  }
}