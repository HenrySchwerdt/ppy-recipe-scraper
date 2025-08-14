export interface Recipe {
  title: string;
  totalTime?: number; // in minutes
  yields?: string;
  ingredients: string[];
  instructions: string[];
  image?: string;
  author?: string;
  description?: string;
  category?: string;
  cuisine?: string;
  keywords?: string[];
  nutritionInfo?: NutritionInfo;
  url?: string;
}

export interface NutritionInfo {
  calories?: string;
  fatContent?: string;
  saturatedFatContent?: string;
  cholesterolContent?: string;
  sodiumContent?: string;
  carbohydrateContent?: string;
  fiberContent?: string;
  sugarContent?: string;
  proteinContent?: string;
  servingSize?: string;
}

export interface ScraperOptions {
  timeout?: number;
  userAgent?: string;
  followRedirects?: boolean;
}

export interface ScraperResult {
  success: boolean;
  recipe?: Recipe;
  error?: string;
}