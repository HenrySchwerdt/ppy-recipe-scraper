import * as cheerio from 'cheerio';
import { Recipe, ScraperOptions, ScraperResult } from '../types/recipe.js';
import { SchemaOrg } from '../utils/schema-org';
import { OpenGraph } from '../utils/opengraph';
import { IngredientParser } from '../utils/ingredient-parser';
import { StaticValueException, FieldNotProvidedByWebsiteException } from '../utils/exceptions';

export abstract class AbstractScraper {
  protected url: string;
  protected $: cheerio.CheerioAPI | null = null;
  protected options: ScraperOptions;
  protected pageData: string = '';
  protected schema: SchemaOrg;
  protected opengraph: OpenGraph;

  constructor(html: string, url: string, options: ScraperOptions = {}) {
    this.pageData = html;
    this.url = url;
    this.options = {
      timeout: 10000,
      userAgent: 'Mozilla/5.0 (compatible; RecipeScraperTS/1.0)',
      followRedirects: true,
      ...options
    };
    
    this.$ = cheerio.load(html);
    this.schema = new SchemaOrg(html);
    this.opengraph = new OpenGraph(this.$);
  }

  static host(domain?: string): string {
    throw new Error('host() method must be implemented by subclass');
  }

  static canScrape(url: string): boolean {
    const host = this.host();
    return url.includes(host);
  }

  // Abstract methods that must be implemented by subclasses
  abstract author(): string | undefined;
  abstract siteName(): string;
  abstract title(): string;
  abstract ingredients(): string[];
  abstract instructions(): string;
  abstract category(): string | undefined;
  abstract yields(): string | undefined;
  abstract description(): string | undefined;
  abstract totalTime(): number | undefined;
  abstract cookTime(): number | undefined;
  abstract prepTime(): number | undefined;
  abstract cuisine(): string | undefined;
  abstract image(): string | undefined;

  // Optional methods with default implementations
  canonicalUrl(): string {
    if (!this.$) return this.url;
    
    const canonicalLink = this.$('link[rel="canonical"][href]');
    if (canonicalLink.length > 0) {
      const href = canonicalLink.attr('href');
      if (href) {
        return new URL(href, this.url).href;
      }
    }
    return this.url;
  }

  language(): string | undefined {
    if (!this.$) return undefined;
    
    const html = this.$('html[lang]');
    if (html.length > 0) {
      return html.attr('lang');
    }
    
    const metaLanguage = this.$('meta[http-equiv="content-language"][content]');
    if (metaLanguage.length > 0) {
      const content = metaLanguage.attr('content');
      if (content) {
        return content.split(',')[0].trim();
      }
    }
    
    return undefined;
  }

  instructionsList(): string[] {
    return this.instructions()
      .split('\n')
      .map(instruction => instruction.trim())
      .filter(instruction => instruction.length > 0);
  }

  cookingMethod(): string | undefined {
    return undefined;
  }

  ratings(): number | undefined {
    return undefined;
  }

  ratingsCount(): number | undefined {
    return undefined;
  }

  equipment(): string[] {
    return [];
  }

  nutrients(): any {
    return undefined;
  }

  dietaryRestrictions(): string[] {
    return [];
  }

  keywords(): string[] {
    return [];
  }

  ingredientGroups(): any[] {
    return [];
  }

  links(): Array<{ href: string; [key: string]: any }> {
    if (!this.$) return [];
    
    const links: Array<{ href: string; [key: string]: any }> = [];
    const invalidHrefs = new Set(['#', '']);
    
    this.$('a[href]').each((_, element) => {
      if (!this.$) return;
      const href = this.$(element).attr('href');
      if (href && !invalidHrefs.has(href)) {
        const attrs: any = { href };
        const elementAttrs = element.attribs;
        Object.keys(elementAttrs).forEach(key => {
          attrs[key] = elementAttrs[key];
        });
        links.push(attrs);
      }
    });
    
    return links;
  }

  async scrape(): Promise<ScraperResult> {
    try {
      const ingredients = this.safeCall(() => this.ingredients()) || [];
      
      const recipe: Recipe = {
        title: this.safeCall(() => this.title()) || '',
        ingredients,
        parsedIngredients: ingredients.length > 0 ? IngredientParser.parseIngredients(ingredients) : [],
        instructions: this.safeCall(() => this.instructionsList()) || [],
        totalTime: this.safeCall(() => this.totalTime()),
        yields: this.safeCall(() => this.yields()),
        image: this.safeCall(() => this.image()),
        author: this.safeCall(() => this.author()),
        category: this.safeCall(() => this.category()),
        cuisine: this.safeCall(() => this.cuisine()),
        description: this.safeCall(() => this.description()),
        keywords: this.safeCall(() => this.keywords()) || [],
        url: this.canonicalUrl()
      };

      if (!recipe.title || recipe.ingredients.length === 0) {
        return { success: false, error: 'No recipe data found' };
      }

      return { success: true, recipe };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  private safeCall<T>(fn: () => T): T | undefined {
    try {
      return fn();
    } catch (error) {
      if (error instanceof StaticValueException || error instanceof FieldNotProvidedByWebsiteException) {
        return error.returnValue;
      }
      return undefined;
    }
  }

  toJson(): any {
    const result: any = {};
    const methods = [
      'author', 'siteName', 'title', 'ingredients', 'instructions', 
      'category', 'yields', 'description', 'totalTime', 'cookTime', 
      'prepTime', 'cuisine', 'image', 'canonicalUrl', 'language',
      'cookingMethod', 'ratings', 'ratingsCount', 'equipment', 
      'nutrients', 'dietaryRestrictions', 'keywords'
    ];

    methods.forEach(method => {
      try {
        const value = (this as any)[method]();
        if (value !== undefined && value !== null) {
          result[method] = value;
        }
      } catch (error) {
        // Ignore errors for optional methods
      }
    });

    return result;
  }

  // Utility methods
  protected cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  protected normalizeString(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  protected getMinutes(timeStr: string | null | undefined): number | undefined {
    if (!timeStr) return undefined;
    
    // Handle ISO 8601 duration format (PT30M, PT1H30M, etc.)
    const iso8601Match = timeStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (iso8601Match) {
      const hours = parseInt(iso8601Match[1] || '0');
      const minutes = parseInt(iso8601Match[2] || '0');
      return hours * 60 + minutes;
    }
    
    // Handle common text formats
    const textMatch = timeStr.match(/(\d+)\s*(hour|hr|h|minute|min|m)/gi);
    let totalMinutes = 0;
    
    if (textMatch) {
      textMatch.forEach(match => {
        const [, num, unit] = match.match(/(\d+)\s*(hour|hr|h|minute|min|m)/i) || [];
        const value = parseInt(num);
        if (unit && unit.toLowerCase().startsWith('h')) {
          totalMinutes += value * 60;
        } else {
          totalMinutes += value;
        }
      });
      return totalMinutes;
    }
    
    return undefined;
  }

  protected getYields(yieldStr: string | null | undefined): string | undefined {
    if (!yieldStr) return undefined;
    
    // Extract number from yield string
    const match = yieldStr.match(/(\d+)/);
    return match ? match[1] : yieldStr;
  }
}