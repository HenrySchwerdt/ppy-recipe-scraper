import { AbstractScraper } from './base';
import { normalizeString } from '../utils/utils';

export class CookingLight extends AbstractScraper {
  static host(): string {
    return 'cookinglight.com';
  }

  static canScrape(url: string): boolean {
    return url.includes('cookinglight.com');
  }

  author(): string | undefined {
    return this.schema.author();
  }

  siteName(): string {
    return 'Cooking Light';
  }

  title(): string {
    return this.schema.title() || '';
  }

  ingredients(): string[] {
    // Try schema first
    const schemaIngredients = this.schema.ingredients();
    if (schemaIngredients.length > 0) return schemaIngredients;

    // Fallback to HTML parsing
    if (!this.$) return [];
    
    const ingredients: string[] = [];
    const ingredientsContainer = this.$('div.ingredients ul');
    
    if (ingredientsContainer.length > 0) {
      ingredientsContainer.find('li').each((_, element) => {
        if (!this.$) return;
        const text = normalizeString(this.$(element).text());
        if (text) ingredients.push(text);
      });
    }
    
    return ingredients;
  }

  instructions(): string {
    // Try schema first
    const schemaInstructions = this.schema.instructions();
    if (schemaInstructions) return schemaInstructions;

    // Fallback to HTML parsing
    if (!this.$) return '';
    
    const instructions: string[] = [];
    const instructionsContainer = this.$('div.recipe-instructions');
    
    if (instructionsContainer.length > 0) {
      instructionsContainer.find('div.step').each((_, element) => {
        if (!this.$) return;
        const text = normalizeString(this.$(element).text());
        if (text) instructions.push(text);
      });
    }
    
    return instructions.join('\n');
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

  ratings(): number | undefined {
    try {
      return this.schema.ratings();
    } catch (error) {
      return undefined;
    }
  }
}