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
      return authorLink.length > 0 ? authorLink.text().trim() : undefined;
    }
    
    return undefined;
  }

  siteName(): string {
    throw new StaticValueException('Afghan Kitchen Recipes');
  }

  title(): string {
    return this.schema.title() || '';
  }

  ingredients(): string[] {
    if (!this.$) return [];
    
    const ingredients: string[] = [];
    this.$('li.ingredient').each((_, element) => {
      if (!this.$) return;
      const text = this.$(element).text().trim();
      if (text) ingredients.push(text);
    });
    
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
    
    return instructions.join('\n');
  }

  category(): string | undefined {
    return this.schema.category();
  }

  yields(): string | undefined {
    if (!this.$) return undefined;
    
    const servings = this.$('li.servings').first();
    if (servings.length > 0) {
      return getYields(servings.text().trim());
    }
    
    return undefined;
  }

  description(): string | undefined {
    return this.schema.description();
  }

  totalTime(): number | undefined {
    if (!this.$) return undefined;
    
    const readyIn = this.$('li.ready-in').first();
    if (readyIn.length === 0) return undefined;
    
    const readyText = readyIn.find('span.value').text().trim();
    if (!readyText || !readyText.endsWith('h')) return undefined;
    
    const timePart = readyText.slice(0, -1); // Remove 'h'
    const [hours, minutes] = timePart.split(':');
    
    return parseInt(hours) * 60 + parseInt(minutes);
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