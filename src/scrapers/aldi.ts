import { AbstractScraper } from './base';
import { StaticValueException } from '../utils/exceptions';

export class Aldi extends AbstractScraper {
  static host(): string {
    return 'aldi.com.au';
  }

  static canScrape(url: string): boolean {
    return url.includes('aldi.com.au');
  }

  author(): string | undefined {
    const metaAuthor = this.$?.('meta[name="author"]').attr('content');
    if (metaAuthor) return metaAuthor;
    
    return 'ALDI'; // Return static value instead of throwing
  }

  siteName(): string {
    return 'Aldi';
  }

  title(): string {
    if (!this.$) return '';
    return this.cleanText(this.$('h1').first().text());
  }

  category(): string | undefined {
    if (!this.$) return undefined;
    const element = this.$('a.tab-nav--link.dropdown--list--link.m-active').first();
    if (element.length > 0) {
      const title = element.text();
      const recipePosition = title.indexOf(' Recipe');
      if (recipePosition !== -1) {
        return title.substring(0, recipePosition);
      }
    }
    return undefined;
  }

  prepTime(): number | undefined {
    return this.getMinutes(this.getValue(/prep/i));
  }

  cookTime(): number | undefined {
    return this.getMinutes(this.getValue(/cook/i));
  }

  totalTime(): number | undefined {
    const prep = this.prepTime() || 0;
    const cook = this.cookTime() || 0;
    return prep + cook || undefined;
  }

  yields(): string | undefined {
    const value = this.getValue(/(makes)|(serves)/i);
    return this.getYields(value);
  }

  description(): string | undefined {
    return this.schema.description();
  }

  cuisine(): string | undefined {
    return this.schema.cuisine();
  }

  image(): string | undefined {
    if (!this.$) return undefined;
    const figure = this.$('figure.csc-textpic-image.csc-textpic-last').first();
    if (figure.length > 0) {
      const img = figure.find('img').first();
      if (img.length > 0) {
        return img.attr('src') || undefined;
      }
    }
    return this.schema.image();
  }

  ingredients(): string[] {
    // Try schema first
    const schemaIngredients = this.schema.ingredients();
    if (schemaIngredients.length > 0) return schemaIngredients;

    // Fallback to HTML parsing
    if (!this.$) return [];
    
    // Find h2 containing "Ingredients"
    const h2Elements = this.$('h2');
    let ingredientsH2: any = null;
    
    h2Elements.each((_, element) => {
      if (!this.$) return;
      const text = this.$(element).text();
      if (/ingredients/i.test(text)) {
        ingredientsH2 = this.$(element);
        return false; // break
      }
    });

    if (!ingredientsH2) return [];

    const listElement = ingredientsH2.next('ul');
    if (listElement.length === 0) return [];

    const ingredients: string[] = [];
    listElement.find('li').each((_: any, li: any) => {
      if (!this.$) return;
      const text = this.cleanText(this.$(li).text());
      if (text) ingredients.push(text);
    });

    return ingredients;
  }

  instructions(): string {
    // Try schema first
    const schemaInstructions = this.schema.instructions();
    if (schemaInstructions) return schemaInstructions;

    // Fallback to HTML parsing
    if (!this.$) return '';
    
    const listElement = this.$('ol').first();
    if (listElement.length === 0) return '';

    const instructions: string[] = [];
    listElement.find('li').each((_: any, li: any) => {
      if (!this.$) return;
      const text = this.cleanText(this.$(li).text());
      if (text) instructions.push(text);
    });

    return instructions.join('\n');
  }

  private getValue(label: RegExp | string): string | null {
    if (!this.$) return null;

    // Find the element containing the label
    const allBTags = this.$('b');
    let labelElement: any = null;

    if (label instanceof RegExp) {
      // Find all b tags and filter manually for regex match
      allBTags.each((_, b) => {
        if (!this.$) return;
        const text = this.$(b).text();
        if (text && label.test(text)) {
          labelElement = this.$(b);
          return false; // break
        }
      });
    } else {
      // Direct string match
      allBTags.each((_, b) => {
        if (!this.$) return;
        const text = this.$(b).text();
        if (text === label) {
          labelElement = this.$(b);
          return false; // break
        }
      });
    }

    if (!labelElement) return null;

    // Extract value: Get parent of b tag and collect all text after the label
    const parent = labelElement.parent();
    if (parent.length === 0) return null;

    // Get all content in the parent after the label element
    let valueText = '';
    let capture = false;
    
    parent.contents().each((_: any, content: any) => {
      if (content === labelElement[0]) {
        capture = true;
        return;
      }
      
      if (capture && this.$) {
        if (content.type === 'text') {
          valueText += content.data;
        } else if (content.type === 'tag') {
          valueText += this.$(content).text();
        }
      }
    });

    return valueText.trim() || null;
  }

}