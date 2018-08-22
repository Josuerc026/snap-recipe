const userInput = document.querySelector('[name="user-image"]');

const fetchData = async (imgStr) => {
 var myRegexp = /,(.*)$/g;
 var matchedImgStr = myRegexp.exec(imgStr);
 let request = {
  requests:[
   {
     image: {
      content: matchedImgStr[1]
     },
    features: [
     {
      type: "LABEL_DETECTION"
     }
    ]
   }
  ]
 };

 let response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyD_T_-P71RIM75L1-hef9rSXaMp2n_xezY',{
  headers: {
   'Accept': 'application/json',
   'Content-Type': 'application/json'
  },
  method: "POST",
  body: JSON.stringify(request)
 }).then(response => response.json());

 console.log(response);
 return response;
}

const fr = (elem) => {
 let input = elem.files[0];
 return new Promise(resolve => {
  let reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.readAsDataURL(input);
 })
}

const getBaseString = async (elem) => {
 let imgStr = await fr(elem);
 let response = await fetchData(imgStr);
 alert(response.responses[0].labelAnnotations[0].description);
}

userInput.addEventListener('change', function(){
 getBaseString(this);
});