const { scrapeRecipe } = require('../dist/recipe-scraper');

async function testLidlScraper() {
  const url = 'https://www.aldi-sued.de/de/r.croque-monsieur-mit-champignons-und-spinat.Article_RZ49604560000000.html';
  
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