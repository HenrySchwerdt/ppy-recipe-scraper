import { AbstractScraper } from './base';
import { normalizeString } from '../utils/utils';
import { SchemaOrgException } from '../utils/exceptions';

const NUTRIENT_MAP = {
  calories: '.mv-create-nutrition-calories',
  fatContent: '.mv-create-nutrition-total-fat',
  saturatedFatContent: '.mv-create-nutrition-saturated-fat',
  unsaturatedFatContent: '.mv-create-nutrition-unsaturated-fat',
  transFatContent: '.mv-create-nutrition-trans-fat',
  carbohydrateContent: '.mv-create-nutrition-carbohydrates',
  sugarContent: '.mv-create-nutrition-sugar',
  proteinContent: '.mv-create-nutrition-protein',
  sodiumContent: '.mv-create-nutrition-sodium',
  fiberContent: '.mv-create-nutrition-fiber',
  cholesterolContent: '.mv-create-nutrition-cholesterol',
};

export class AberleHome extends AbstractScraper {
  static host(): string {
    return 'aberlehome.com';
  }

  static canScrape(url: string): boolean {
    return url.includes('aberlehome.com');
  }

  author(): string | undefined {
    try {
      const author = this.schema.author();
      if (author) return author;
    } catch (error) {
      // Fall through to meta tag search
    }

    if (!this.$) return undefined;
    const authorMeta = this.$('meta[name="author"]');
    return authorMeta.attr('content') || undefined;
  }

  siteName(): string {
    return 'Aberle Home';
  }

  title(): string {
    try {
      const title = this.schema.title();
      if (title) return title;
    } catch (error) {
      // Fall through to HTML parsing
    }

    if (!this.$) return '';
    return this.$('.entry-title').first().text().trim();
  }

  ingredients(): string[] {
    const schemaIngredients = this.schema.ingredients();
    if (schemaIngredients.length > 0) return schemaIngredients;

    if (!this.$) return [];
    const ingredients: string[] = [];
    this.$('.mv-create-ingredients li').each((_, element) => {
      if (!this.$) return;
      const text = normalizeString(this.$(element).text());
      if (text) ingredients.push(text);
    });

    return ingredients;
  }

  instructions(): string {
    const schemaInstructions = this.schema.instructions();
    if (schemaInstructions) return schemaInstructions;

    if (!this.$) return '';
    
    // Try list format first
    const listInstructions: string[] = [];
    this.$('.mv-create-instructions li').each((_, element) => {
      if (!this.$) return;
      const text = normalizeString(this.$(element).text());
      if (text) listInstructions.push(text);
    });

    if (listInstructions.length > 0) {
      return listInstructions.join('\n');
    }

    // Try paragraph format
    const paragraphInstructions: string[] = [];
    this.$('.mv-create-instructions p').each((_, element) => {
      if (!this.$) return;
      const text = normalizeString(this.$(element).text());
      if (text) paragraphInstructions.push(text);
    });

    return paragraphInstructions.join('\n');
  }

  category(): string | undefined {
    const schemaCategory = this.schema.category();
    if (schemaCategory) return schemaCategory;

    if (!this.$) return undefined;
    const categoryElement = this.$('.mv-create-category').first();
    if (categoryElement.length > 0) {
      let category = categoryElement.text().trim();
      if (category.startsWith('Category: ')) {
        category = category.substring('Category: '.length);
      }
      return category;
    }

    return undefined;
  }

  yields(): string | undefined {
    try {
      return this.schema.yields();
    } catch (error) {
      if (!this.$) return undefined;
      return this.$('.mv-create-time-yield .mv-create-time-format').text().trim() || undefined;
    }
  }

  description(): string | undefined {
    try {
      return this.schema.description();
    } catch (error) {
      if (!this.$) return undefined;
      return this.$('.mv-create-description p').first().text().trim() || undefined;
    }
  }

  totalTime(): number | undefined {
    try {
      return this.schema.totalTime();
    } catch (error) {
      if (!this.$) return undefined;
      const timeText = this.$('.mv-create-time-total .mv-time-part').first().text().trim();
      return this.getMinutes(timeText);
    }
  }

  cookTime(): number | undefined {
    try {
      return this.schema.cookTime();
    } catch (error) {
      if (!this.$) return undefined;
      const timeText = this.$('.mv-create-time-active .mv-time-part').first().text().trim();
      return this.getMinutes(timeText);
    }
  }

  prepTime(): number | undefined {
    try {
      return this.schema.prepTime();
    } catch (error) {
      if (!this.$) return undefined;
      const timeText = this.$('.mv-create-time-prep .mv-time-part').first().text().trim();
      return this.getMinutes(timeText);
    }
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
      if (!this.$) return undefined;
      const rating = this.$('.mv-create-reviews').attr('data-mv-create-rating');
      return rating ? parseFloat(rating) : undefined;
    }
  }

  ratingsCount(): number | undefined {
    try {
      return this.schema.ratingsCount();
    } catch (error) {
      if (!this.$) return undefined;
      const count = this.$('.mv-create-reviews').attr('data-mv-create-total-ratings');
      return count ? parseInt(count) : undefined;
    }
  }

  nutrients(): any {
    const schemaNutrients = this.schema.nutrients();
    if (schemaNutrients && Object.keys(schemaNutrients).length > 0) {
      return schemaNutrients;
    }

    if (!this.$) return {};
    
    const nutrients: any = {};
    for (const [key, selector] of Object.entries(NUTRIENT_MAP)) {
      const item = this.$(selector);
      if (item.length > 0) {
        const labelTag = item.find('.mv-create-nutrition-label');
        labelTag.remove();
        const value = item.text().trim();
        if (value) nutrients[key] = value;
      }
    }

    return nutrients;
  }
}