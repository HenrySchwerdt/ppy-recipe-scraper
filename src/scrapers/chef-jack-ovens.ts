import { AbstractScraper } from './base';

export class ChefJackOvens extends AbstractScraper {
  static host(): string {
    return 'chefjackovens.com';
  }

  static canScrape(url: string): boolean {
    return url.includes('chefjackovens.com');
  }

  author(): string | undefined {
    return this.schema.author();
  }

  siteName(): string {
    return 'Chef Jack Ovens';
  }

  title(): string {
    return this.schema.title() || '';
  }

  ingredients(): string[] {
    return this.schema.ingredients();
  }

  instructions(): string {
    if (!this.$) return this.schema.instructions();

    const groups = this.$('div.wprm-recipe-instruction-group');
    
    // Check if there are groups with h4 headers
    let hasGroupsWithHeaders = false;
    groups.each((_, group) => {
      if (!this.$) return;
      if (this.$(group).find('h4').length > 0) {
        hasGroupsWithHeaders = true;
        return false; // break
      }
    });

    if (groups.length > 0 && hasGroupsWithHeaders) {
      const steps: string[] = [];
      
      groups.each((_, group) => {
        if (!this.$) return;
        const groupElement = this.$(group);
        
        if (groupElement.find('h4').length > 0) {
          const instructions = groupElement.find('ul.wprm-recipe-instructions li.wprm-recipe-instruction');
          
          instructions.each((_, li) => {
            if (!this.$) return;
            const textElement = this.$(li).find('.wprm-recipe-instruction-text');
            if (textElement.length > 0) {
              const text = textElement.text().trim();
              if (text) steps.push(text);
            }
          });
        }
      });
      
      return steps.join('\n');
    }

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
}