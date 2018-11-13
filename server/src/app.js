const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json({limit: '100mb', type: 'application/json'}));
app.use('/public', express.static('../dist'));
app.set('view engine', 'pug');
app.set('views', '../views');


const gpKey = 'AIzaSyD_T_-P71RIM75L1-hef9rSXaMp2n_xezY';
//SC F2G KEY: ba51b78ade3a8eee87489ef11fb9dfc0

const fetchRecipeIds = async (input) => {
 //http://food2fork.com/api/search?key=d21438f37fb5cfdecc886e9364e0549a&q=apple,tortilla
 let response = await axios.get(`http://food2fork.com/api/search?key=d21438f37fb5cfdecc886e9364e0549a&q=${encodeURIComponent(input)}`);
 return response.data.recipes;
};

const fetchData = async (imgStr) => {
 let myRegexp = /,(.*)$/g;
 var matchedImgStr = myRegexp.exec(imgStr);

 let request = {
  requests: [{
   image: {
    content: matchedImgStr[1]
   },
   features: [{
    type: "LABEL_DETECTION"
   }]
  }]
 };

 let response = await axios.post(`https://vision.googleapis.com/v1/images:annotate?key=${gpKey}`, JSON.stringify(request), {
  headers: {
   'Accept': 'application/json',
   'Content-Type': 'application/json'
  }
 });

 return response.data;
};

app.get('/', function (req, res) {
 res.render('index');
})

app.post('/get-image-data', async (req, res) => {
 let rqstInput = req.body.image;
 if(!rqstInput) return res.status(500).send({
  success: false
 });

 let image = await fetchData(rqstInput);

 return res.status(200).send({
  success: true,
  data: image.responses[0].labelAnnotations[0]
 });
});

app.post('/get-recipes', async (req, res) => {
 let input = req.body.input;

 if(!input) {
  return res.status(500).send({
   success: false
  });
 }

 let recipes = await fetchRecipeIds(input);

 return res.status(200).send({
  success: true,
  data: recipes
 })
});


app.listen({
   port: process.env.PORT || 5000
 });