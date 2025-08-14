import { AbstractScraper } from './base';

export class LidlKochen extends AbstractScraper {
  static host(): string {
    return 'lidl-kochen.de';
  }

  static canScrape(url: string): boolean {
    return url.includes('lidl-kochen.de');
  }

  author(): string | undefined {
    return this.schema.author() || 'LIDL Kochen';
  }

  siteName(): string {
    return 'LIDL Kochen';
  }

  title(): string {
    return this.schema.title() || '';
  }

  ingredients(): string[] {
    return this.schema.ingredients();
  }

  instructions(): string {
    return this.schema.instructions() || '';
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
    // LIDL includes equipment in the schema as "tool" property
    if (!this.schema.data.tool) return [];
    
    const tools = this.schema.data.tool;
    if (Array.isArray(tools)) {
      return tools.map(tool => tool.item || tool.name || tool);
    }
    return [tools.item || tools.name || tools];
  }

  keywords(): string[] {
    return this.schema.keywords();
  }

  nutrients(): any {
    return this.schema.nutrients();
  }



  language(): string | undefined {
    return 'de';
  }
}