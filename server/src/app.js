const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express()
app.use(morgan('combined'))
app.use(cors());
app.use(bodyParser.json())

const fetchRecipeIds = async () => {
 //http://food2fork.com/api/search?key=d21438f37fb5cfdecc886e9364e0549a&q=apple,tortilla
 let response = await axios.get('http://food2fork.com/api/search?key=d21438f37fb5cfdecc886e9364e0549a&q=banana');
 let recipeIds = response.data.recipes.map(recipe => recipe.recipe_id);
 return recipeIds;
};
const fetchRecipes = async (ids) => {
 let first = ids[0];
 let response = await axios.get(`http://food2fork.com/api/get?key=d21438f37fb5cfdecc886e9364e0549a&rId=${first}`);

 let recipe = response.data.recipe.ingredients.map(ingredient => {
  let regexp = RegExp('bananas?', 'gm');
  let isTarget = regexp.test(ingredient);
  if(!isTarget){
   return ingredient;
  }else{
   return null;
  }
 });

 console.log(recipe);
 return recipe;
};
(async function (){
 let ids = await fetchRecipeIds();
 let a = await fetchRecipes(ids);
 app.get('/testing', (req, res) => {
  return res.status(200).send({
   success: true,
   message: 'endpoint works!!',
   ingredients: a
  })
 });

})();

app.listen({
   port: process.env.PORT || 5000
 });