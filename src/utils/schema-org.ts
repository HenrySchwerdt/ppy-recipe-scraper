export class SchemaOrgException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaOrgException';
  }
}

export class SchemaOrg {
  public data: any = {};

  constructor(html: string) {
    this.parseSchemaOrg(html);
  }

  private parseSchemaOrg(html: string): void {
    // Extract JSON-LD data from HTML
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
    let match;
    
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        // Clean control characters and escape sequences that might break JSON parsing
        const cleanedJson = match[1]
          .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
          .replace(/\r\n/g, '\\n')         // Escape newlines
          .replace(/\r/g, '\\n')           // Escape carriage returns
          .replace(/\n/g, '\\n')           // Escape line feeds
          .replace(/\t/g, '\\t');          // Escape tabs
        
        const jsonData = JSON.parse(cleanedJson);
        if (this.isRecipeData(jsonData)) {
          this.data = jsonData;
          break;
        }
        
        // Check if it's an array or has @graph
        if (Array.isArray(jsonData)) {
          for (const item of jsonData) {
            if (this.isRecipeData(item)) {
              this.data = item;
              break;
            }
          }
        } else if (jsonData['@graph']) {
          for (const item of jsonData['@graph']) {
            if (this.isRecipeData(item)) {
              this.data = item;
              break;
            }
          }
        }
      } catch (error) {
        // Ignore invalid JSON
        continue;
      }
    }
  }

  private isRecipeData(data: any): boolean {
    if (!data || !data['@type']) return false;
    
    const type = data['@type'];
    return type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'));
  }

  author(): string | undefined {
    if (!this.data.author) return undefined;
    
    const author = this.data.author;
    if (typeof author === 'string') return author;
    if (Array.isArray(author)) {
      return author[0]?.name || author[0];
    }
    return author.name || author;
  }

  title(): string | undefined {
    return this.data.name;
  }

  description(): string | undefined {
    return this.data.description;
  }

  ingredients(): string[] {
    if (!this.data.recipeIngredient) return [];
    
    const ingredients = this.data.recipeIngredient;
    if (Array.isArray(ingredients)) {
      return ingredients.map(ing => typeof ing === 'string' ? ing : ing.text || ing.name || '');
    }
    return [ingredients];
  }

  instructions(): string {
    if (!this.data.recipeInstructions) return '';
    
    const instructions = this.data.recipeInstructions;
    if (typeof instructions === 'string') return instructions;
    
    if (Array.isArray(instructions)) {
      return instructions.map(inst => {
        if (typeof inst === 'string') return inst;
        return inst.text || inst.name || '';
      }).join('\n');
    }
    
    return instructions.text || instructions.name || '';
  }

  totalTime(): number | undefined {
    if (!this.data.totalTime) return undefined;
    return this.parseTime(this.data.totalTime);
  }

  prepTime(): number | undefined {
    if (!this.data.prepTime) return undefined;
    return this.parseTime(this.data.prepTime);
  }

  cookTime(): number | undefined {
    if (!this.data.cookTime) return undefined;
    return this.parseTime(this.data.cookTime);
  }

  yields(): string | undefined {
    if (!this.data.recipeYield) return undefined;
    
    const yields = this.data.recipeYield;
    if (Array.isArray(yields)) return yields[0];
    return yields;
  }

  category(): string | undefined {
    if (!this.data.recipeCategory) return undefined;
    
    const category = this.data.recipeCategory;
    if (Array.isArray(category)) return category[0];
    return category;
  }

  cuisine(): string | undefined {
    if (!this.data.recipeCuisine) return undefined;
    
    const cuisine = this.data.recipeCuisine;
    if (Array.isArray(cuisine)) return cuisine[0];
    return cuisine;
  }

  image(): string | undefined {
    if (!this.data.image) return undefined;
    
    const image = this.data.image;
    if (typeof image === 'string') return image;
    if (Array.isArray(image)) {
      return image[0]?.url || image[0];
    }
    return image.url || image;
  }

  keywords(): string[] {
    if (!this.data.keywords) return [];
    
    const keywords = this.data.keywords;
    if (Array.isArray(keywords)) return keywords;
    if (typeof keywords === 'string') {
      return keywords.split(',').map(k => k.trim());
    }
    return [];
  }

  ratings(): number | undefined {
    if (!this.data.aggregateRating) return undefined;
    
    const rating = this.data.aggregateRating.ratingValue;
    return rating ? parseFloat(rating) : undefined;
  }

  ratingsCount(): number | undefined {
    if (!this.data.aggregateRating) return undefined;
    
    const count = this.data.aggregateRating.ratingCount || this.data.aggregateRating.reviewCount;
    return count ? parseInt(count) : undefined;
  }

  nutrients(): any {
    if (!this.data.nutrition) return {};
    
    return this.data.nutrition;
  }

  private parseTime(timeStr: string): number | undefined {
    if (!timeStr) return undefined;
    
    // Handle ISO 8601 duration format (PT30M, PT1H30M, etc.)
    const iso8601Match = timeStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (iso8601Match) {
      const hours = parseInt(iso8601Match[1] || '0');
      const minutes = parseInt(iso8601Match[2] || '0');
      return hours * 60 + minutes;
    }
    
    return undefined;
  }
}