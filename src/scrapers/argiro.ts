import { AbstractScraper } from './base';
import { getYields } from '../utils/utils';
import { IngredientGroup } from '../utils/grouping-utils';

export class Argiro extends AbstractScraper {
  static host(): string {
    return 'argiro.gr';
  }

  static canScrape(url: string): boolean {
    return url.includes('argiro.gr');
  }

  author(): string | undefined {
    return 'Αργυρώ Μπαρμπαρίγου';
  }

  siteName(): string {
    return 'Argiro';
  }

  title(): string {
    // Try schema.org first, then fallback to custom selector
    const schemaTitle = this.schema.title();
    if (schemaTitle) return schemaTitle;
    
    if (!this.$) return '';
    const titleElement = this.$('h1.single_recipe__title');
    return titleElement.length > 0 ? titleElement.text().trim() : '';
  }

  description(): string | undefined {
    if (!this.$) return undefined;
    const metaDescription = this.$('meta[name="description"]');
    return metaDescription.attr('content') || undefined;
  }

  category(): string | undefined {
    if (!this.$) return undefined;
    const categories: string[] = [];
    this.$('.article__tags ul li.tag_item a').each((_, element) => {
      if (!this.$) return;
      const text = this.$(element).text().trim();
      if (text) categories.push(text);
    });
    return categories.length > 0 ? categories.join(', ') : undefined;
  }

  private parseTime(selector: string): number | undefined {
    if (!this.$) return undefined;
    
    const element = this.$(selector);
    if (element.length === 0) return undefined;
    
    const text = element.text().trim();
    const hoursMatch = text.match(/(\d+)\s*ώρα/);
    const minutesMatch = text.match(/(\d+)\s*λεπτά/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    
    return hours * 60 + minutes;
  }

  prepTime(): number | undefined {
    return this.parseTime('.item.preparation_time h2.item__title');
  }

  cookTime(): number | undefined {
    return this.parseTime('.item.cooking_time h2.item__title');
  }

  totalTime(): number | undefined {
    const prep = this.prepTime();
    const cook = this.cookTime();
    
    if (!prep || !cook) return undefined;
    return prep + cook;
  }

  equipment(): string[] {
    if (!this.$) return [];
    
    const equipment: string[] = [];
    this.$('.equipment__item h2.equipment__item__name').each((_, element) => {
      if (!this.$) return;
      const text = this.$(element).text().trim();
      if (text) equipment.push(text);
    });
    
    return equipment;
  }

  yields(): string | undefined {
    if (!this.$) return undefined;
    const yieldsElement = this.$('.item.portions h2.item__title');
    if (yieldsElement.length > 0) {
      return getYields(yieldsElement.text().trim());
    }
    return undefined;
  }

  ingredients(): string[] {
    if (!this.$) return [];
    
    const results: string[] = [];
    const containers = this.$('div.single_recipe__left_column div.ingredients');
    
    containers.each((_, container) => {
      if (!this.$) return;
      const sections = this.$(container).find('.ingredients__container');
      
      sections.each((_, section) => {
        if (!this.$) return;
        const items = this.$(section).find('.ingredients__item label.ingredient-label');
        
        items.each((_, label) => {
          if (!this.$) return;
          const quantity = this.$(label).find('.ingredients__quantity');
          const name = this.$(label).find('p');
          
          let text = '';
          if (quantity.length > 0) {
            text += quantity.text().trim() + ' ';
          }
          if (name.length > 0) {
            text += name.text().trim();
          }
          
          if (text.trim()) {
            results.push(text.trim());
          }
        });
      });
    });
    
    // Fallback to schema.org if no custom ingredients found
    if (results.length === 0) {
      return this.schema.ingredients();
    }
    
    return results;
  }

  ingredientGroups(): IngredientGroup[] {
    if (!this.$) return [];
    
    const groups: IngredientGroup[] = [];
    const containers = this.$('div.single_recipe__left_column div.ingredients');
    
    containers.each((_, container) => {
      if (!this.$) return;
      const sections = this.$(container).find('.ingredients__title');
      const containersBySection = this.$(container).find('.ingredients__container');
      
      sections.each((sectionIndex, titleElement) => {
        if (!this.$) return;
        const title = this.$(titleElement).text().trim();
        const purpose = title || null;
        const groupIngredients: string[] = [];
        
        const correspondingSection = containersBySection.eq(sectionIndex);
        const items = correspondingSection.find('.ingredients__item label.ingredient-label');
        
        items.each((_, label) => {
          if (!this.$) return;
          const quantity = this.$(label).find('.ingredients__quantity');
          const name = this.$(label).find('p');
          
          let text = '';
          if (quantity.length > 0) {
            text += quantity.text().trim() + ' ';
          }
          if (name.length > 0) {
            text += name.text().trim();
          }
          
          if (text.trim()) {
            groupIngredients.push(text.trim());
          }
        });
        
        if (groupIngredients.length > 0) {
          groups.push({ ingredients: groupIngredients, purpose });
        }
      });
      
      // Fallback: handle case with no group titles
      if (sections.length === 0 && containersBySection.length > 0) {
        containersBySection.each((_, section) => {
          if (!this.$) return;
          const groupIngredients: string[] = [];
          const items = this.$(section).find('.ingredients__item label.ingredient-label');
          
          items.each((_, label) => {
            if (!this.$) return;
            const quantity = this.$(label).find('.ingredients__quantity');
            const name = this.$(label).find('p');
            
            let text = '';
            if (quantity.length > 0) {
              text += quantity.text().trim() + ' ';
            }
            if (name.length > 0) {
              text += name.text().trim();
            }
            
            if (text.trim()) {
              groupIngredients.push(text.trim());
            }
          });
          
          if (groupIngredients.length > 0) {
            groups.push({ ingredients: groupIngredients, purpose: null });
          }
        });
      }
    });
    
    return groups;
  }

  instructions(): string {
    if (!this.$) return '';
    
    const steps: string[] = [];
    const stepElements = this.$('.single_recipe__method_steps ol li');
    const punctuation = ['.', ',', ';', '!', '?', ':', '·', '…', '–'];
    
    stepElements.each((_, step) => {
      if (!this.$) return;
      let text = this.$(step).text().replace(/\s+/g, ' ').trim();
      
      // Clean up punctuation spacing
      punctuation.forEach(punct => {
        text = text.replace(new RegExp(` \\${punct}`, 'g'), punct);
      });
      
      if (text) {
        steps.push(text);
      }
    });
    
    return steps.join('\n');
  }

  cuisine(): string | undefined {
    return 'Greek';
  }

  image(): string | undefined {
    return this.schema.image();
  }
}