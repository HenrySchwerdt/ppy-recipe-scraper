import { AbstractScraper } from './base';

export class AldiSued extends AbstractScraper {
  static host(domain: string = 'aldi-sued.de'): string {
    return domain;
  }

  static canScrape(url: string): boolean {
    return url.includes('aldi-sued.de');
  }

  author(): string | undefined {
    return this.schema.author();
  }

  siteName(): string {
    return 'ALDI SÜD';
  }

  title(): string {
    return this.schema.title() || '';
  }

  ingredients(): string[] {
    return this.schema.ingredients();
  }

  instructions(): string {
    const instructionElements = this.schema.data?.recipeInstructions || [];
    
    if (Array.isArray(instructionElements)) {
      return instructionElements
        .map((element: any) => {
          const text = element.text || element;
          return typeof text === 'string' ? text.replace(/\xad/g, '') : '';
        })
        .filter(Boolean)
        .join('\n');
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