const { scrapeRecipe } = require('../dist/recipe-scraper');

async function testLidlScraper() {
  const url = 'https://www.lidl-kochen.de/rezeptwelt/einfaches-gulasch-mit-spaetzle-324364?ref=search';
  
  try {
    console.log('Fetching recipe from:', url);
    console.log('---');
    
    const result = await scrapeRecipe(url);
    
    if (result.success && result.recipe) {
      console.log('SUCCESS! Recipe found:');
      console.log(JSON.stringify(result.recipe, null, 2));
    } else {
      console.log('FAILED to scrape recipe:');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('Error occurred:', error.message);
  }
}


testLidlScraper();