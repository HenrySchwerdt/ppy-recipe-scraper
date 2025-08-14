async function debugLidlRaw() {
  const url = 'https://www.lidl-kochen.de/rezeptwelt/kraeuterlimonade-146073?ref=search';
  
  try {
    console.log('Fetching recipe from:', url);
    
    const response = await fetch(url);
    const html = await response.text();
    
    // Find JSON-LD scripts
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
    let match;
    let schemaIndex = 0;
    
    while ((match = jsonLdRegex.exec(html)) !== null) {
      schemaIndex++;
      console.log(`\n--- Raw JSON-LD Schema ${schemaIndex}:`);
      console.log('Length:', match[1].length);
      console.log('First 500 chars:');
      console.log(match[1].substring(0, 500));
      console.log('\n--- Last 200 chars:');
      console.log(match[1].substring(match[1].length - 200));
      
      // Try to clean and parse
      try {
        // Clean control characters
        const cleanedJson = match[1]
          .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
          .replace(/\r\n/g, '\\n')         // Escape newlines
          .replace(/\r/g, '\\n')           // Escape carriage returns
          .replace(/\n/g, '\\n')           // Escape line feeds
          .replace(/\t/g, '\\t');          // Escape tabs
        
        const jsonData = JSON.parse(cleanedJson);
        console.log('\n--- Parsed successfully!');
        
        if (Array.isArray(jsonData)) {
          jsonData.forEach((item, itemIndex) => {
            console.log(`  Item ${itemIndex + 1} type:`, item['@type']);
            if (item['@type'] === 'Recipe') {
              console.log('  Recipe name:', item.name);
              console.log('  Ingredients count:', item.recipeIngredient?.length);
              console.log('  First 3 ingredients:', item.recipeIngredient?.slice(0, 3));
            }
          });
        } else {
          console.log('  Type:', jsonData['@type']);
          if (jsonData['@type'] === 'Recipe') {
            console.log('  Recipe name:', jsonData.name);
            console.log('  Ingredients count:', jsonData.recipeIngredient?.length);
            console.log('  First 3 ingredients:', jsonData.recipeIngredient?.slice(0, 3));
          }
        }
      } catch (error) {
        console.log('Parse error:', error.message);
        
        // Show problematic area
        const errorPos = error.message.match(/position (\d+)/);
        if (errorPos) {
          const pos = parseInt(errorPos[1]);
          console.log('Error around position', pos);
          console.log('Context:', match[1].substring(Math.max(0, pos - 50), pos + 50));
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugLidlRaw();