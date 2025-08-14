export interface IngredientAmount {
  quantity: number;
  quantityMax?: number;
  unit?: string;
  text: string;
  isRange: boolean;
  isApproximate: boolean;
}

export interface ParsedIngredient {
  name: string;
  size?: string;
  amount?: IngredientAmount;
  preparation?: string;
  comment?: string;
  original: string;
}

export class IngredientParser {
  // Comprehensive unit mappings based on the original library
  private static readonly UNITS = new Map([
    // Volume - metric
    ['ml', { standard: 'milliliter', type: 'volume' }],
    ['milliliter', { standard: 'milliliter', type: 'volume' }],
    ['milliliters', { standard: 'milliliter', type: 'volume' }],
    ['l', { standard: 'liter', type: 'volume' }],
    ['liter', { standard: 'liter', type: 'volume' }],
    ['liters', { standard: 'liter', type: 'volume' }],
    ['litre', { standard: 'liter', type: 'volume' }],
    ['litres', { standard: 'liter', type: 'volume' }],
    
    // Volume - imperial/US
    ['cup', { standard: 'cup', type: 'volume' }],
    ['cups', { standard: 'cup', type: 'volume' }],
    ['c', { standard: 'cup', type: 'volume' }],
    ['tbsp', { standard: 'tablespoon', type: 'volume' }],
    ['tablespoon', { standard: 'tablespoon', type: 'volume' }],
    ['tablespoons', { standard: 'tablespoon', type: 'volume' }],
    ['tsp', { standard: 'teaspoon', type: 'volume' }],
    ['teaspoon', { standard: 'teaspoon', type: 'volume' }],
    ['teaspoons', { standard: 'teaspoon', type: 'volume' }],
    ['fl oz', { standard: 'fluid_ounce', type: 'volume' }],
    ['fluid ounce', { standard: 'fluid_ounce', type: 'volume' }],
    ['fluid ounces', { standard: 'fluid_ounce', type: 'volume' }],
    ['pint', { standard: 'pint', type: 'volume' }],
    ['pints', { standard: 'pint', type: 'volume' }],
    ['pt', { standard: 'pint', type: 'volume' }],
    ['quart', { standard: 'quart', type: 'volume' }],
    ['quarts', { standard: 'quart', type: 'volume' }],
    ['qt', { standard: 'quart', type: 'volume' }],
    ['gallon', { standard: 'gallon', type: 'volume' }],
    ['gallons', { standard: 'gallon', type: 'volume' }],
    ['gal', { standard: 'gallon', type: 'volume' }],
    
    // Weight - metric
    ['g', { standard: 'gram', type: 'weight' }],
    ['gram', { standard: 'gram', type: 'weight' }],
    ['grams', { standard: 'gram', type: 'weight' }],
    ['kg', { standard: 'kilogram', type: 'weight' }],
    ['kilogram', { standard: 'kilogram', type: 'weight' }],
    ['kilograms', { standard: 'kilogram', type: 'weight' }],
    
    // Weight - imperial/US
    ['oz', { standard: 'ounce', type: 'weight' }],
    ['ounce', { standard: 'ounce', type: 'weight' }],
    ['ounces', { standard: 'ounce', type: 'weight' }],
    ['lb', { standard: 'pound', type: 'weight' }],
    ['lbs', { standard: 'pound', type: 'weight' }],
    ['pound', { standard: 'pound', type: 'weight' }],
    ['pounds', { standard: 'pound', type: 'weight' }],
    
    // Count/discrete
    ['piece', { standard: 'piece', type: 'count' }],
    ['pieces', { standard: 'piece', type: 'count' }],
    ['pc', { standard: 'piece', type: 'count' }],
    ['pcs', { standard: 'piece', type: 'count' }],
    ['item', { standard: 'piece', type: 'count' }],
    ['items', { standard: 'piece', type: 'count' }],
    
    // German units
    ['tl', { standard: 'teaspoon', type: 'volume' }],
    ['teelöffel', { standard: 'teaspoon', type: 'volume' }],
    ['el', { standard: 'tablespoon', type: 'volume' }],
    ['esslöffel', { standard: 'tablespoon', type: 'volume' }],
    ['essl', { standard: 'tablespoon', type: 'volume' }],
    ['msp', { standard: 'pinch', type: 'volume' }],
    ['messerspitze', { standard: 'pinch', type: 'volume' }],
    ['prise', { standard: 'pinch', type: 'volume' }],
    ['prisen', { standard: 'pinch', type: 'volume' }],
    ['st', { standard: 'piece', type: 'count' }],
    ['stück', { standard: 'piece', type: 'count' }],
    ['stk', { standard: 'piece', type: 'count' }],
    
    // Container units
    ['can', { standard: 'can', type: 'container' }],
    ['cans', { standard: 'can', type: 'container' }],
    ['jar', { standard: 'jar', type: 'container' }],
    ['jars', { standard: 'jar', type: 'container' }],
    ['bottle', { standard: 'bottle', type: 'container' }],
    ['bottles', { standard: 'bottle', type: 'container' }],
    ['package', { standard: 'package', type: 'container' }],
    ['packages', { standard: 'package', type: 'container' }],
    ['pkg', { standard: 'package', type: 'container' }],
    ['box', { standard: 'box', type: 'container' }],
    ['boxes', { standard: 'box', type: 'container' }],
    
    // German containers
    ['dose', { standard: 'can', type: 'container' }],
    ['dosen', { standard: 'can', type: 'container' }],
    ['packung', { standard: 'package', type: 'container' }],
    ['päckchen', { standard: 'package', type: 'container' }],
    ['pck', { standard: 'package', type: 'container' }],
    ['glas', { standard: 'jar', type: 'container' }],
    ['flasche', { standard: 'bottle', type: 'container' }],
    ['becher', { standard: 'cup', type: 'container' }],
    
    // Specialized units
    ['clove', { standard: 'clove', type: 'count' }],
    ['cloves', { standard: 'clove', type: 'count' }],
    ['zehe', { standard: 'clove', type: 'count' }],
    ['zehen', { standard: 'clove', type: 'count' }],
    ['bunch', { standard: 'bunch', type: 'count' }],
    ['bunches', { standard: 'bunch', type: 'count' }],
    ['bund', { standard: 'bunch', type: 'count' }],
    ['head', { standard: 'head', type: 'count' }],
    ['heads', { standard: 'head', type: 'count' }],
    ['kopf', { standard: 'head', type: 'count' }],
    ['slice', { standard: 'slice', type: 'count' }],
    ['slices', { standard: 'slice', type: 'count' }],
    ['scheibe', { standard: 'slice', type: 'count' }],
    ['scheiben', { standard: 'slice', type: 'count' }],
  ]);

  // Size modifiers
  private static readonly SIZE_MODIFIERS = [
    'large', 'medium', 'small', 'extra large', 'extra small',
    'big', 'little', 'tiny', 'huge', 'jumbo',
    'groß', 'große', 'großer', 'großes', 'klein', 'kleine', 'kleiner', 'kleines',
    'mittel', 'mittlere', 'mittlerer', 'mittleres', 'riesig', 'winzig'
  ];

  // Preparation terms
  private static readonly PREPARATION_TERMS = [
    // English
    'chopped', 'diced', 'minced', 'sliced', 'grated', 'shredded', 'crushed',
    'peeled', 'seeded', 'cored', 'stemmed', 'trimmed', 'cleaned', 'washed',
    'fresh', 'dried', 'frozen', 'thawed', 'cooked', 'raw', 'roasted', 'toasted',
    'melted', 'softened', 'room temperature', 'cold', 'warm', 'hot',
    'finely chopped', 'roughly chopped', 'thinly sliced', 'thickly sliced',
    'cut into', 'divided', 'separated', 'halved', 'quartered',
    
    // German
    'gehackt', 'gewürfelt', 'geschnitten', 'gerieben', 'zerkleinert', 'zerdrückt',
    'geschält', 'entkernt', 'geputzt', 'gewaschen', 'gesäubert',
    'frisch', 'getrocknet', 'tiefgekühlt', 'aufgetaut', 'gekocht', 'roh', 'geröstet',
    'geschmolzen', 'weich', 'zimmertemperatur', 'kalt', 'warm', 'heiß',
    'fein gehackt', 'grob gehackt', 'dünn geschnitten', 'dick geschnitten',
    'in stücke', 'geteilt', 'halbiert', 'geviertelt'
  ];

  // Fraction mappings
  private static readonly FRACTIONS = new Map([
    ['½', 0.5], ['1/2', 0.5],
    ['⅓', 1/3], ['1/3', 1/3],
    ['⅔', 2/3], ['2/3', 2/3],
    ['¼', 0.25], ['1/4', 0.25],
    ['¾', 0.75], ['3/4', 0.75],
    ['⅛', 0.125], ['1/8', 0.125],
    ['⅜', 0.375], ['3/8', 0.375],
    ['⅝', 0.625], ['5/8', 0.625],
    ['⅞', 0.875], ['7/8', 0.875],
    ['⅕', 0.2], ['1/5', 0.2],
    ['⅖', 0.4], ['2/5', 0.4],
    ['⅗', 0.6], ['3/5', 0.6],
    ['⅘', 0.8], ['4/5', 0.8],
    ['⅙', 1/6], ['1/6', 1/6],
    ['⅚', 5/6], ['5/6', 5/6]
  ]);

  static parse(ingredientText: string): ParsedIngredient {
    const original = ingredientText.trim();
    const tokens = this.tokenize(original);
    
    const result: ParsedIngredient = {
      name: original,
      original
    };

    // Extract amount (quantity + unit)
    const amountResult = this.extractAmount(tokens);
    if (amountResult.amount) {
      result.amount = amountResult.amount;
      tokens.splice(amountResult.startIndex, amountResult.length);
    }

    // Extract size modifiers
    const sizeResult = this.extractSize(tokens);
    if (sizeResult.size) {
      result.size = sizeResult.size;
      tokens.splice(sizeResult.startIndex, sizeResult.length);
    }

    // Extract preparation
    const prepResult = this.extractPreparation(tokens);
    if (prepResult.preparation) {
      result.preparation = prepResult.preparation;
      tokens.splice(prepResult.startIndex, prepResult.length);
    }

    // Extract comments (text in parentheses)
    const commentResult = this.extractComment(tokens);
    if (commentResult.comment) {
      result.comment = commentResult.comment;
      tokens.splice(commentResult.startIndex, commentResult.length);
    }

    // What remains is the ingredient name
    result.name = tokens.map(t => t.text).join(' ').trim() || original;

    return result;
  }

  private static tokenize(text: string): Array<{ text: string; index: number }> {
    // Simple tokenization - split on whitespace and punctuation but keep structure
    const tokens: Array<{ text: string; index: number }> = [];
    const words = text.split(/(\s+|[,()]+)/);
    let index = 0;
    
    for (const word of words) {
      if (word.trim()) {
        tokens.push({ text: word.trim(), index });
      }
      index += word.length;
    }
    
    return tokens;
  }

  private static extractAmount(tokens: Array<{ text: string; index: number }>): {
    amount?: IngredientAmount;
    startIndex: number;
    length: number;
  } {
    for (let i = 0; i < tokens.length - 1; i++) {
      const quantityResult = this.parseQuantity(tokens[i].text);
      if (quantityResult && i + 1 < tokens.length) {
        const unitInfo = this.UNITS.get(tokens[i + 1].text.toLowerCase());
        if (unitInfo) {
          const amount: IngredientAmount = {
            quantity: quantityResult.quantity,
            quantityMax: quantityResult.quantityMax,
            unit: unitInfo.standard,
            text: `${tokens[i].text} ${tokens[i + 1].text}`,
            isRange: quantityResult.isRange,
            isApproximate: quantityResult.isApproximate
          };
          return { amount, startIndex: i, length: 2 };
        }
      }
    }

    // Try quantity without unit
    for (let i = 0; i < tokens.length; i++) {
      const quantityResult = this.parseQuantity(tokens[i].text);
      if (quantityResult) {
        const amount: IngredientAmount = {
          quantity: quantityResult.quantity,
          quantityMax: quantityResult.quantityMax,
          text: tokens[i].text,
          isRange: quantityResult.isRange,
          isApproximate: quantityResult.isApproximate
        };
        return { amount, startIndex: i, length: 1 };
      }
    }

    return { startIndex: -1, length: 0 };
  }

  private static parseQuantity(text: string): {
    quantity: number;
    quantityMax?: number;
    isRange: boolean;
    isApproximate: boolean;
  } | null {
    const cleanText = text.toLowerCase().trim();
    
    // Check for approximation indicators
    const isApproximate = /^(about|approximately|circa|ca\.?|~)/.test(cleanText);
    const numericText = cleanText.replace(/^(about|approximately|circa|ca\.?|~)\s*/, '');

    // Handle fractions
    if (this.FRACTIONS.has(numericText)) {
      return {
        quantity: this.FRACTIONS.get(numericText)!,
        isRange: false,
        isApproximate
      };
    }

    // Handle ranges (e.g., "2-3", "1 to 2")
    const rangeMatch = numericText.match(/^(\d+(?:[.,]\d+)?)\s*[-–—to]\s*(\d+(?:[.,]\d+)?)$/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1].replace(',', '.'));
      const max = parseFloat(rangeMatch[2].replace(',', '.'));
      return {
        quantity: min,
        quantityMax: max,
        isRange: true,
        isApproximate
      };
    }

    // Handle mixed numbers (e.g., "1 1/2")
    const mixedMatch = numericText.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
      const whole = parseInt(mixedMatch[1]);
      const numerator = parseInt(mixedMatch[2]);
      const denominator = parseInt(mixedMatch[3]);
      return {
        quantity: whole + (numerator / denominator),
        isRange: false,
        isApproximate
      };
    }

    // Handle simple fractions (e.g., "1/2")
    const fractionMatch = numericText.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
      const numerator = parseInt(fractionMatch[1]);
      const denominator = parseInt(fractionMatch[2]);
      return {
        quantity: numerator / denominator,
        isRange: false,
        isApproximate
      };
    }

    // Handle decimal numbers
    const decimalMatch = numericText.match(/^(\d+(?:[.,]\d+)?)$/);
    if (decimalMatch) {
      return {
        quantity: parseFloat(decimalMatch[1].replace(',', '.')),
        isRange: false,
        isApproximate
      };
    }

    return null;
  }

  private static extractSize(tokens: Array<{ text: string; index: number }>): {
    size?: string;
    startIndex: number;
    length: number;
  } {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].text.toLowerCase();
      if (this.SIZE_MODIFIERS.includes(token)) {
        return { size: tokens[i].text, startIndex: i, length: 1 };
      }
    }
    return { startIndex: -1, length: 0 };
  }

  private static extractPreparation(tokens: Array<{ text: string; index: number }>): {
    preparation?: string;
    startIndex: number;
    length: number;
  } {
    // Look for preparation terms
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].text.toLowerCase();
      if (this.PREPARATION_TERMS.includes(token)) {
        // Include following words that might be part of the preparation
        let endIndex = i + 1;
        while (endIndex < tokens.length && 
               (this.PREPARATION_TERMS.includes(tokens[endIndex].text.toLowerCase()) ||
                tokens[endIndex].text.match(/^(into|in|to|and|&)$/i))) {
          endIndex++;
        }
        
        const preparation = tokens.slice(i, endIndex).map(t => t.text).join(' ');
        return { preparation, startIndex: i, length: endIndex - i };
      }
    }

    return { startIndex: -1, length: 0 };
  }

  private static extractComment(tokens: Array<{ text: string; index: number }>): {
    comment?: string;
    startIndex: number;
    length: number;
  } {
    // Look for text in parentheses
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].text.startsWith('(')) {
        let endIndex = i;
        let comment = '';
        
        while (endIndex < tokens.length) {
          comment += tokens[endIndex].text + ' ';
          if (tokens[endIndex].text.endsWith(')')) {
            break;
          }
          endIndex++;
        }
        
        return {
          comment: comment.trim().replace(/^\(|\)$/g, ''),
          startIndex: i,
          length: endIndex - i + 1
        };
      }
    }

    return { startIndex: -1, length: 0 };
  }

  static parseIngredients(ingredients: string[] | undefined): ParsedIngredient[] | undefined {
    if (ingredients) {
        return ingredients.map(ingredient => this.parse(ingredient));
    }
    return undefined
  }

  static getSupportedUnits(): string[] {
    return Array.from(this.UNITS.keys());
  }

  static isValidUnit(unit: string): boolean {
    return this.UNITS.has(unit.toLowerCase());
  }
}