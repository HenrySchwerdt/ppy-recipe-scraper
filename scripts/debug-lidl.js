const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function debugLidlPage() {
  const url = 'https://www.lidl-kochen.de/rezeptwelt/kraeuterlimonade-146073?ref=search';
  
  try {
    console.log('Fetching HTML from:', url);
    const response = await fetch(url);
    const html = await response.text();
    
    const $ = cheerio.load(html);
    
    console.log('\n=== SCHEMA.ORG JSON-LD DATA ===');
    $('script[type="application/ld+json"]').each((i, script) => {
      try {
        const jsonData = JSON.parse($(script).html());
        console.log(`Script ${i + 1}:`, JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log(`Script ${i + 1}: Invalid JSON`);
      }
    });
    
    console.log('\n=== INGREDIENTS TABLE ===');
    $('table.ingredients-table tr').each((i, row) => {
      const nameCell = $(row).find('td .ingredient__name__text');
      const quantityCell = $(row).find('td.ingredient__quantity');
      console.log(`Row ${i}: name="${nameCell.text()}" quantity="${quantityCell.text()}"`);
    });
    
    console.log('\n=== ALTERNATIVE INGREDIENT SELECTORS ===');
    console.log('Ingredients list items:', $('.ingredients li').length);
    $('.ingredients li').each((i, item) => {
      console.log(`Item ${i}:`, $(item).text().trim());
    });
    
    console.log('\n=== RECIPE INGREDIENTS SECTION ===');
    console.log('Recipe ingredients:', $('.recipe-ingredients').length);
    $('.recipe-ingredients').each((i, section) => {
      console.log(`Section ${i}:`, $(section).html());
    });
    
    console.log('\n=== ALL INGREDIENT-RELATED ELEMENTS ===');
    $('[class*="ingredient"]').each((i, element) => {
      console.log(`Element ${i}: class="${$(element).attr('class')}" text="${$(element).text().trim().substring(0, 100)}"`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugLidlPage();