M.AutoInit();

class renderElements {
    constructor(options) {
        this._root = document.querySelector(options.root);
        this._openModalBtn = document.querySelector(options.openModalBtn);
        this._modalBody = document.querySelector(options.modalBody);
        this._gridItemClass = options.gridItemClass;
    }
    generateItemTemplate(src, response) {
        let template =
            `<div class="col s12 m6 l4">
        <div class="card" data-label="${response.description}" >
        <div class="card-image" style="background: url(${src}) no-repeat center center / cover; width: 100%; height: 100px;">
            <img src="${src}" style="display: none;">
            <button class="btn-floating halfway-fab waves-effect waves-light blue"><i class="material-icons re-analyze">refresh</i></button>
        </div>
        <div class="card-content">
           <span class="card-title">${response.description}</span>
           <p>Accuracy Level: ${Math.floor(response.score * 100)}%</p>
           <button class="waves-effect waves-light btn red mt-15 delete-item"><i class="material-icons left">delete_forever</i>Delete</button>
        </div>
        </div>
    </div>
     `;
        this._root.insertAdjacentHTML('afterbegin', template);
        this.checkToDisable();
    }
    checkToDisable() {
        let items = [...document.querySelectorAll(this._gridItemClass)];
        if (!items.length) {
            this._openModalBtn.classList.add('disabled');
            return;
        }
        this._openModalBtn.classList.remove('disabled');
    }
    getListCount() {
        let items = [...document.querySelectorAll(this._gridItemClass)];
        if (!items.length) return;
        let ingredients = [];
        items.forEach(item => ingredients.push(item.dataset.label));
        return ingredients;
    }
    generateIngredientList() {
        let confirmModal = this._modalBody;
        let ingredients = this.getListCount();
        let template =
            `                
            <h4>Confirm ${ingredients.length} ${ ingredients.length > 1 ? 'items' : 'item'}</h4>
            <p>The following ${ingredients.length} items will be submitted to find recipes. Continue if you're okay with the selection or close to make any changes.</p>
            <ul class="collection">
              ${ingredients.map(item => `<li class="collection-item">${ item }</li>`).join('')}
            </ul>
            `;
        confirmModal.innerHTML = template;
    }
    getProgressBar(v) {
        if (v) {
            this._root.insertAdjacentHTML('afterbegin', '<div class="progress"><div class="indeterminate"></div></div>');
        } else {
            this._root.querySelector('.progress').remove();
        }
    }
}
const userInput = document.querySelector('[name="user-image"]');
const imgBoard = document.querySelector('.img-board');
const getRecipePre = document.querySelector('.get-recipes');

const init = new renderElements({
    root: '.img-board',
    gridItemClass: '.card',
    openModalBtn: '.get-recipes',
    modalBody: '#confirm-group .modal-content'
})

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

    let response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyD_T_-P71RIM75L1-hef9rSXaMp2n_xezY', {
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
    elem.setAttribute('data-label', responseArr.responses[0].labelAnnotations[1].description);
    elem.querySelector('.card-title').innerText = responseArr.responses[0].labelAnnotations[1].description;
    elem.querySelector('p').innerText = newLabel;
};

const deleteItem = (elem) => {
    elem.remove();
    checkToDisable();
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
    init.getProgressBar(true);
    let responseArr = await fetchData(imgStr);
    init.getProgressBar(false);
    init.generateItemTemplate(imgStr, responseArr.responses[0].labelAnnotations[0]);
};

imgBoard.addEventListener('click', function(e) {
    if (e.target.matches('.re-analyze')) {
        reAnalyze(e.target.closest('.card'));
    }
    if (e.target.matches('.delete-item')) {
        deleteItem(e.target.closest('.card'));
    }
});

userInput.addEventListener('change', function() {
    getBaseString(this);
});

getRecipePre.addEventListener('click', function() {
    init.generateIngredientList();
});