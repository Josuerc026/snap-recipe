const userInput = document.querySelector('[name="user-image"]');
const imgBoard = document.querySelector('.img-board');

const fetchData = async (imgStr) => {
 let myRegexp = /,(.*)$/g;
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

 return response;
};

const reAnalyze = async (elem) => {
 let imgStr = elem.querySelector('img').src;
 elem.querySelector('p').innerText = 're-analyzing...';
 let responseArr = await fetchData(imgStr);
 let newLabel = `${responseArr.responses[0].labelAnnotations[1].description}, accuracy: ${Math.floor(responseArr.responses[0].labelAnnotations[1].score * 100)}%`;
 elem.querySelector('p').innerText = newLabel;
};

const deleteItem = (elem) => {
 elem.remove();
};

const generateImages = (src, response) => {
  let prevBoard = document.querySelector('.img-board');
  let template =
    `<div class="img-wrap" style="background: url(${src}) no-repeat center center / cover;">
        <img src="${src}" data-label="${response.description}" width="200" style="display: none;">
        <div class="object-info">
            <p>${response.description}, accuracy: ${Math.floor(response.score * 100)}%</p>
            <div class="btn-container">
              <button class="re-analyze">Re-analyze</button>
              <button class="delete-item">Delete</button>
            </div>
        </div>
    </div>`;
  prevBoard.insertAdjacentHTML('afterbegin', template);
};

const fr = (elem) => {
  let file = elem.files[0];
  return new Promise((resolve => {
   let reader = new FileReader();
   reader.onloadend = () => resolve(reader.result);
   reader.readAsDataURL(file);
  }));
};

const getBaseString = async (elem) => {
 let imgStr = await fr(elem);
 let responseArr = await fetchData(imgStr);
 generateImages(imgStr, responseArr.responses[0].labelAnnotations[0]);
 console.log(responseArr);
};


imgBoard.addEventListener('click', function (e) {
  if(e.target.matches('.re-analyze')){
   reAnalyze(e.target.closest('.img-wrap'));
  }
  if(e.target.matches('.delete-item')){
   deleteItem(e.target.closest('.img-wrap'));
  }
});

userInput.addEventListener('change', function(){
 getBaseString(this);
});