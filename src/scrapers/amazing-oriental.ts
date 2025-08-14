import { AbstractScraper } from './base';
import { getMinutes, getYields } from '../utils/utils';

export class AmazingOriental extends AbstractScraper {
  static host(): string {
    return 'amazingoriental.com';
  }

  static canScrape(url: string): boolean {
    return url.includes('amazingoriental.com');
  }

  author(): string | undefined {
    return this.schema.author();
  }

  siteName(): string {
    return 'Amazing Oriental';
  }

  title(): string {
    if (!this.$) return '';
    return this.$('h1').first().text().trim();
  }

  ingredients(): string[] {
    if (!this.$) return [];
    
    const ingredients: string[] = [];
    this.$('.sidebar .ingredients-wrap ul li').each((_, element) => {
      if (!this.$) return;
      const text = this.$(element).text().replace(/\s+/g, ' ').trim();
      if (text) ingredients.push(text);
    });
    
    return ingredients;
  }

  instructions(): string {
    if (!this.$) return '';
    
    const instructions: string[] = [];
    this.$('.main-wrap ul li').each((_, element) => {
      if (!this.$) return;
      const text = this.$(element).text().trim();
      if (text) instructions.push(text);
    });
    
    return instructions.join('\n');
  }

  category(): string | undefined {
    if (!this.$) return undefined;
    const categoryElement = this.$('div.recipe-info .meal-type').first();
    return categoryElement.length > 0 ? categoryElement.text().trim() : undefined;
  }

  yields(): string | undefined {
    if (!this.$) return undefined;
    const yieldElement = this.$('.person-amount').first();
    if (yieldElement.length > 0) {
      return getYields(yieldElement.text().trim());
    }
    return undefined;
  }

  description(): string | undefined {
    return this.schema.description();
  }

  totalTime(): number | undefined {
    if (!this.$) return undefined;
    const timeElement = this.$('dl.prepare-time dd').first();
    if (timeElement.length > 0) {
      return getMinutes(timeElement.text().trim());
    }
    return undefined;
  }

  cookTime(): number | undefined {
    return this.schema.cookTime();
  }

  prepTime(): number | undefined {
    return this.schema.prepTime();
  }

  cuisine(): string | undefined {
    if (!this.$) return undefined;
    const cuisineElement = this.$('div.sidebar span.category').first();
    return cuisineElement.length > 0 ? cuisineElement.text().trim() : undefined;
  }

  image(): string | undefined {
    return this.schema.image();
  }
}