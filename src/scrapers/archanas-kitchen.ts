import { AbstractScraper } from './base';
import { groupIngredients, IngredientGroup } from '../utils/grouping-utils';

export class ArchanasKitchen extends AbstractScraper {
  static host(): string {
    return 'archanaskitchen.com';
  }

  static canScrape(url: string): boolean {
    return url.includes('archanaskitchen.com');
  }

  author(): string | undefined {
    return this.schema.author();
  }

  siteName(): string {
    return this.opengraph.siteName() || 'Archana\'s Kitchen';
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

  ingredientGroups(): IngredientGroup[] {
    if (!this.$) return [];
    
    return groupIngredients(
      this.ingredients(),
      this.$,
      '.ingredientssubtitle',
      'li[itemprop="ingredients"]'
    );
  }
}