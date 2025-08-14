import { AbstractScraper } from './base';

export class Rewe extends AbstractScraper {
  static host(): string {
    return 'rewe.de';
  }

  static canScrape(url: string): boolean {
    return url.includes('rewe.de');
  }

  author(): string | undefined {
    return this.schema.author();
  }

  siteName(): string {
    return 'REWE';
  }

  title(): string {
    return this.schema.title() || '';
  }

  ingredients(): string[] {
    return this.schema.ingredients();
  }

  instructions(): string {
    const instructions = this.schema.instructions();
    // Filter out lines that start with "Schritt"
    return instructions
      .split('\n')
      .filter(line => !line.startsWith('Schritt'))
      .join('\n');
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

    const header = this.$('h2').filter((_, el) => {
      if (!this.$) return false;
      return this.$(el).text() === 'Utensilien';
    });
    if (header.length === 0) return [];

    const section = header.parent();
    if (section.length === 0) return [];

    const tools = section.find('p.kitchen-tools-entries');
    if (tools.length === 0) return [];

    const text = tools.text();
    if (!text) return [];

    return text
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
}