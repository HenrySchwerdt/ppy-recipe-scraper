const { IngredientParser } = require('../dist/utils/ingredient-parser');

// Test ingredients from LIDL recipe
const testIngredients = [
  "Zitronen 5 St.",
  "Zucker 300 g",
  "Wasser 100 ml",
  "Minze, frisch 40 g",
  "Thymian, frisch 10 g",
  "Basilikum, frisch 40 g",
  "Rosmarin, frisch 10 g",
  "Mineralwasser, classic 1 L"
];

console.log('Testing ingredient parser with LIDL ingredients:\n');

testIngredients.forEach((ingredient, index) => {
  console.log(`${index + 1}. Original: "${ingredient}"`);
  const parsed = IngredientParser.parse(ingredient);
  console.log('   Parsed:', JSON.stringify(parsed, null, 2));
  console.log('');
});

// Test with some English ingredients
const englishIngredients = [
  "2 cups all-purpose flour",
  "1/2 tsp salt",
  "3-4 large eggs, beaten",
  "1 lb ground beef, lean",
  "2 tbsp olive oil",
  "1 medium onion, diced"
];

console.log('\nTesting with English ingredients:\n');

englishIngredients.forEach((ingredient, index) => {
  console.log(`${index + 1}. Original: "${ingredient}"`);
  const parsed = IngredientParser.parse(ingredient);
  console.log('   Parsed:', JSON.stringify(parsed, null, 2));
  console.log('');
});