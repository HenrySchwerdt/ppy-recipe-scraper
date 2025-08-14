import { scrapeRecipe, RecipeScraper, createScraperFromUrl } from '../src/index';

async function basicExample() {
  console.log('🍳 Recipe Scrapers TypeScript - Basic Example\n');

  // Example URLs for different scrapers
  const testUrls = [
    'https://www.allrecipes.com/recipe/123456/test-recipe',
    'https://www.aldi.com.au/en/recipes/test-recipe',
    'https://www.abeautifulmess.com/recipe/test-recipe'
  ];

  for (const url of testUrls) {
    console.log(`📄 Testing URL: ${url}\n`);

    try {
      // Simple usage with convenience function
      const result = await scrapeRecipe(url);

      if (result.success && result.recipe) {
        const recipe = result.recipe;
        
        console.log('✅ Recipe scraped successfully!\n');
        console.log(`📝 Title: ${recipe.title}`);
        console.log(`👨‍🍳 Author: ${recipe.author || 'Unknown'}`);
        console.log(`⏱️  Total Time: ${recipe.totalTime ? `${recipe.totalTime} minutes` : 'Not specified'}`);
        console.log(`🍽️  Serves: ${recipe.yields || 'Not specified'}`);
        console.log(`📂 Category: ${recipe.category || 'Not specified'}`);
        console.log(`🌍 Cuisine: ${recipe.cuisine || 'Not specified'}`);
        
        if (recipe.description) {
          console.log(`📖 Description: ${recipe.description}`);
        }

        console.log('\n🥘 Ingredients:');
        recipe.ingredients.forEach((ingredient, index) => {
          console.log(`  ${index + 1}. ${ingredient}`);
        });

        console.log('\n👩‍🍳 Instructions:');
        recipe.instructions.forEach((instruction, index) => {
          console.log(`  ${index + 1}. ${instruction}`);
        });

        if (recipe.keywords && recipe.keywords.length > 0) {
          console.log(`\n🏷️  Keywords: ${recipe.keywords.join(', ')}`);
        }

        if (recipe.image) {
          console.log(`\n🖼️  Image: ${recipe.image}`);
        }

      } else {
        console.log('❌ Failed to scrape recipe:');
        console.log(`Error: ${result.error}`);
      }

    } catch (error) {
      console.error('💥 Unexpected error:', error);
    }

    console.log('\n' + '='.repeat(50) + '\n');
  }
}

async function advancedExample() {
  console.log('🔧 Advanced Usage Example\n');

  // Create scraper with custom options
  const scraper = new RecipeScraper({
    timeout: 15000,
    userAgent: 'RecipeScrapersTS-Example/1.0'
  });

  const testUrls = [
    'https://www.allrecipes.com/recipe/123456/test-recipe',
    'https://www.aldi.com.au/en/recipes/test-recipe',
    'https://www.aldi-sued.de/de/r.some-recipe.html',
    'https://www.aldi-nord.de/de/r.some-recipe.html',
    'https://www.rewe.de/rezepte/test-recipe',
    'https://www.rezeptwelt.de/test-recipe',
    'https://www.abeautifulmess.com/recipe/test-recipe',
    'https://www.aberlehome.com/recipe/test-recipe',
    'https://www.amazingoriental.com/recipe/test-recipe',
    'https://www.afghankitchenrecipes.com/recipe/test-recipe',
    'https://www.example.com/unsupported-recipe'
  ];

  console.log('🌐 Supported domains:', scraper.getSupportedDomains().join(', '));
  console.log();

  for (const url of testUrls) {
    console.log(`🔍 Checking: ${url}`);
    
    if (scraper.canScrape(url)) {
      console.log('  ✅ Supported - would attempt to scrape');
    } else {
      console.log('  ❌ Not supported');
    }
  }
}

async function directScraperExample() {
  console.log('\n\n🎯 Direct Scraper Usage Example\n');

  // Example of using a scraper directly with HTML content
  const mockHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Recipe</title>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": "Delicious Test Recipe",
        "description": "A wonderful test recipe",
        "author": "Test Chef",
        "recipeIngredient": ["2 cups flour", "1 cup sugar", "3 eggs"],
        "recipeInstructions": [
          {"text": "Mix ingredients"},
          {"text": "Bake for 30 minutes"}
        ]
      }
      </script>
    </head>
    <body></body>
    </html>
  `;

  try {
    // Create scraper directly from URL (this would normally fetch the HTML)
    const url = 'https://www.allrecipes.com/recipe/123456/test-recipe';
    
    // For demo purposes, we'll create the scraper manually
    // In real usage, you'd use: const scraper = await createScraperFromUrl(url);
    const { AllRecipes } = await import('../src/scrapers/all-recipes');
    const scraper = new AllRecipes(mockHtml, url);
    
    const result = await scraper.scrape();
    
    if (result.success && result.recipe) {
      console.log('✅ Direct scraper usage successful!');
      console.log(`📝 Title: ${result.recipe.title}`);
      console.log(`👨‍🍳 Author: ${result.recipe.author}`);
      console.log(`🥘 Ingredients: ${result.recipe.ingredients.length} items`);
      console.log(`👩‍🍳 Instructions: ${result.recipe.instructions.length} steps`);
    }
    
  } catch (error) {
    console.error('💥 Error in direct scraper usage:', error);
  }
}

// Run examples
async function runExamples() {
  await basicExample();
  await advancedExample();
  await directScraperExample();
}

if (require.main === module) {
  runExamples().catch(console.error);
}

export { basicExample, advancedExample, directScraperExample };