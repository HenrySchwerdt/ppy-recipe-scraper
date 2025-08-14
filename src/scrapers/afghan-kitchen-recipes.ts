import { AbstractScraper } from './base';
import { StaticValueException } from '../utils/exceptions';
import { getYields } from '../utils/utils';

export class AfghanKitchenRecipes extends AbstractScraper {
  static host(): string {
    return 'afghankitchenrecipes.com';
  }

  static canScrape(url: string): boolean {
    return url.includes('afghankitchenrecipes.com');
  }

  author(): string | undefined {
    if (!this.$) return undefined;
    
    const givenName = this.$('h5.given-name');
    if (givenName.length > 0) {
      const authorLink = givenName.find('a[rel="author"]');
      const customAuthor = authorLink.length > 0 ? authorLink.text().trim() : undefined;
      if (customAuthor) return customAuthor;
    }
    
    // Fallback to schema.org
    return this.schema.author();
  }

  siteName(): string {
    throw new StaticValueException('Afghan Kitchen Recipes');
  }

  title(): string {
    // Try schema.org first, then fallback to page title
    const schemaTitle = this.schema.title();
    if (schemaTitle) return schemaTitle;
    
    if (!this.$) return '';
    return this.$('title').text().trim() || '';
  }

  ingredients(): string[] {
    if (!this.$) return [];
    
    const ingredients: string[] = [];
    this.$('li.ingredient').each((_, element) => {
      if (!this.$) return;
      const text = this.$(element).text().trim();
      if (text) ingredients.push(text);
    });
    
    // Fallback to schema.org if no custom ingredients found
    if (ingredients.length === 0) {
      return this.schema.ingredients();
    }
    
    return ingredients;
  }

  instructions(): string {
    if (!this.$) return '';
    
    const instructions: string[] = [];
    this.$('p.instructions').each((_, element) => {
      if (!this.$) return;
      const text = this.$(element).text().trim();
      if (text) instructions.push(text);
    });
    
    if (instructions.length > 0) {
      return instructions.join('\n');
    }
    
    // Fallback to schema.org
    return this.schema.instructions();
  }

  category(): string | undefined {
    return this.schema.category();
  }

  yields(): string | undefined {
    if (!this.$) return undefined;
    
    const servings = this.$('li.servings').first();
    if (servings.length > 0) {
      const customYields = getYields(servings.text().trim());
      if (customYields) return customYields;
    }
    
    // Fallback to schema.org
    return this.schema.yields();
  }

  description(): string | undefined {
    return this.schema.description();
  }

  totalTime(): number | undefined {
    if (!this.$) return undefined;
    
    const readyIn = this.$('li.ready-in').first();
    if (readyIn.length > 0) {
      const readyText = readyIn.find('span.value').text().trim();
      if (readyText && readyText.endsWith('h')) {
        const timePart = readyText.slice(0, -1); // Remove 'h'
        const [hours, minutes] = timePart.split(':');
        const customTime = parseInt(hours) * 60 + parseInt(minutes);
        if (!isNaN(customTime)) return customTime;
      }
    }
    
    // Fallback to schema.org
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
    if (!this.$) return undefined;
    
    const rating = this.$('meta[itemprop="ratingValue"]');
    if (rating.length > 0) {
      const content = rating.attr('content');
      return content ? Math.round(parseFloat(content) * 100) / 100 : undefined;
    }
    
    return undefined;
  }
}