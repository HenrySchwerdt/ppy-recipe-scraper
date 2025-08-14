import * as cheerio from 'cheerio';

export interface IngredientGroup {
  ingredients: string[];
  purpose?: string | null;
}

export function groupIngredients(
  ingredients: string[],
  $: cheerio.CheerioAPI,
  groupTitleSelector: string,
  ingredientSelector: string
): IngredientGroup[] {
  const groups: IngredientGroup[] = [];
  
  // Find all group titles
  const groupTitles = $(groupTitleSelector);
  
  if (groupTitles.length === 0) {
    // No groups found, return all ingredients as one group
    return [{
      ingredients,
      purpose: null
    }];
  }
  
  groupTitles.each((_, titleElement) => {
    const title = $(titleElement).text().trim();
    const groupIngredients: string[] = [];
    
    // Find ingredients that belong to this group
    // This is a simplified implementation - in practice, you'd need more sophisticated logic
    // to determine which ingredients belong to which group based on DOM structure
    
    groups.push({
      ingredients: groupIngredients,
      purpose: title || null
    });
  });
  
  // If no ingredients were grouped, return all as one group
  if (groups.every(group => group.ingredients.length === 0)) {
    return [{
      ingredients,
      purpose: null
    }];
  }
  
  return groups;
}