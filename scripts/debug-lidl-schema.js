const { RecipeScraper } = require('../dist/recipe-scraper');

async function debugLidlSchema() {
  const url = 'https://www.lidl-kochen.de/rezeptwelt/kraeuterlimonade-146073?ref=search';
  
  try {
    console.log('Fetching recipe from:', url);
    
    const scraper = new RecipeScraper();
    const recipe = await scraper.scrape(url);
    
    // Get the raw HTML to check schema data
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract JSON-LD data manually
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
    let match;
    let foundSchemas = [];
    
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonData = JSON.parse(match[1]);
        foundSchemas.push(jsonData);
      } catch (error) {
        console.log('Failed to parse JSON-LD:', error.message);
      }
    }
    
    console.log('\n--- Found JSON-LD schemas:', foundSchemas.length);
    foundSchemas.forEach((schema, index) => {
      console.log(`\n--- Schema ${index + 1}:`);
      if (Array.isArray(schema)) {
        schema.forEach((item, itemIndex) => {
          console.log(`  Item ${itemIndex + 1} type:`, item['@type']);
          if (item['@type'] === 'Recipe') {
            console.log('  Recipe found!');
            console.log('  Name:', item.name);
            console.log('  Ingredients:', item.recipeIngredient?.slice(0, 3));
          }
        });
      } else {
        console.log('  Type:', schema['@type']);
        if (schema['@type'] === 'Recipe') {
          console.log('  Recipe found!');
          console.log('  Name:', schema.name);
          console.log('  Ingredients:', schema.recipeIngredient?.slice(0, 3));
        }
      }
    });
    
    console.log('\n--- Recipe scraper result:');
    console.log(JSON.stringify(recipe, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugLidlSchema();