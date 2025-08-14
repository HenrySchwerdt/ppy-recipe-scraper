import { AbstractScraper } from './base';
import { FieldNotProvidedByWebsiteException } from '../utils/exceptions';

export class Chefnini extends AbstractScraper {
  static host(): string {
    return 'chefnini.com';
  }

  static canScrape(url: string): boolean {
    return url.includes('chefnini.com');
  }

  author(): string | undefined {
    return 'chefNini';
  }

  siteName(): string {
    return 'ChefNini';
  }

  title(): string {
    if (!this.$) return '';
    const titleElement = this.$('span[itemprop="headline"]');
    return titleElement.length > 0 ? titleElement.text().trim() : '';
  }

  ingredients(): string[] {
    if (!this.$) return [];
    
    const ingredients: string[] = [];
    this.$('li[itemprop="ingredients"]').each((_, element) => {
      if (!this.$) return;
      const text = this.$(element).text().trim();
      if (text) ingredients.push(text);
    });
    
    return ingredients;
  }

  instructions(): string {
    if (!this.$) return '';
    
    const instructionsContainer = this.$('div[itemprop="recipeInstructions"]');
    if (instructionsContainer.length === 0) return '';
    
    const instructions: string[] = [];
    instructionsContainer.contents().each((_, element) => {
      if (!this.$) return;
      const text = this.$(element).text().trim();
      if (text) instructions.push(text);
    });
    
    return instructions.join('\n');
  }

  category(): string | undefined {
    return this.schema.category();
  }

  yields(): string | undefined {
    if (!this.$) return undefined;
    
    const yieldElement = this.$('h3[itemprop="recipeYield"]');
    if (yieldElement.length > 0) {
      const yieldText = yieldElement.text().trim();
      const match = yieldText.match(/Pour (\d+)/);
      if (match) {
        return `${match[1]} servings`;
      }
    }
    
    return undefined;
  }

  description(): string | undefined {
    if (!this.$) return undefined;
    const descElement = this.$('p[itemprop="description"]');
    return descElement.length > 0 ? descElement.text().trim() : undefined;
  }

  totalTime(): number | undefined {
    throw new FieldNotProvidedByWebsiteException(null);
  }

  cookTime(): number | undefined {
    return this.schema.cookTime();
  }

  prepTime(): number | undefined {
    return this.schema.prepTime();
  }

  cuisine(): string | undefined {
    return undefined;
  }

  image(): string | undefined {
    return this.schema.image();
  }

  ratings(): number | undefined {
    return undefined;
  }
}