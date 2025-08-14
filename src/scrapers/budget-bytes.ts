import { AbstractScraper } from './base';
import { getEquipment } from '../utils/utils';

export class BudgetBytes extends AbstractScraper {
  static host(): string {
    return 'budgetbytes.com';
  }

  static canScrape(url: string): boolean {
    return url.includes('budgetbytes.com');
  }

  author(): string | undefined {
    return this.schema.author();
  }

  siteName(): string {
    return 'Budget Bytes';
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

  equipment(): string[] {
    if (!this.$) return [];
    
    const equipmentItems: string[] = [];
    this.$('div.wprm-recipe-equipment-name').each((_, element) => {
      if (!this.$) return;
      const text = this.$(element).text().trim();
      if (text) equipmentItems.push(text);
    });
    
    return getEquipment(equipmentItems);
  }
}