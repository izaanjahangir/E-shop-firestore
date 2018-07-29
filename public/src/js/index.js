let currentUserUid;
let currentUsername;
let currentUserAvatar;
/****************************** ********************
****************************************************
****************************************************
 Functions related to Both Home page and submit ads
****************************************************
****************************************************
***************************************************/
document.addEventListener('DOMContentLoaded',()=>{
   if(localStorage.getItem('userUid')){
    showLoader('Setting up page...');
    currentUserUid = localStorage.getItem('userUid');
    requestToken();
    console.log(currentUserUid);
    console.log(localStorage.getItem('currentUserName'))

    if(localStorage.getItem('currentUserName')){
        console.log('From local')
        currentUsername = localStorage.getItem('currentUserName');
        currentUserAvatar = localStorage.getItem('currentUserAvatar');        
        console.log(currentUsername);
        console.log(currentUserAvatar);        
        renderPage();
    }else{
        console.log('From DB') 
        db.collection('users').doc(currentUserUid)
            .get()
            .then((snapshot)=>{
                currentUsername = snapshot.data().username;
                currentUserAvatar = snapshot.data().avatar;
                localStorage.setItem('currentUserName',currentUsername);
                localStorage.setItem('currentUserAvatar',currentUserAvatar);
                renderPage();
            })
       }
    }
})

function renderPage(){
    let greetUserEl = document.querySelector('#greet-user');
    let avatarEl = greetUserEl.querySelector('#avatar');
    greetUserEl.innerHTML = `
            <span class="avatar-container mx-2" style="background-image:url('${currentUserAvatar}');"></span>
            ${currentUsername}
        `;
}

function requestToken(){
    messaging.requestPermission().then(function() {
        console.log('Notification permission granted.');
        return messaging.getToken()
    }).then(function(currentToken) {
        console.log('currentToken****');
        console.log(currentToken);
        db.collection('users').doc(currentUserUid).set({deviceToken: currentToken},{merge: true})
    }).catch(function(err) {
        console.log('Unable to get permission to notify.', err);
    });
    
    messaging.onMessage((payload) => {
        console.log('payload****')
        console.log(payload)
    })
}





/****************************** ********************
****************************************************
****************************************************
 Functions related to Home page
****************************************************
****************************************************
***************************************************/
function fetchAds(){
    const container = document.querySelector('.container');
    if(navigator.onLine){
        showLoader('Fetching ads...');
        db.collection('ads').onSnapshot((querySnapshot)=>{
            if(querySnapshot.empty){
                showModal('No ads to show');
                hideLoader();
                container.innerHTML = `
                    <div class="jumbotron text-center">
                        <h2>No ad is available</h2>
                        <a href="/src/pages/add.html" class="btn btn-primary">Submit an ad</a>
                    </div>
                `
                return false;
            }
            querySnapshot.docChanges().forEach((snapshot)=>{
                hideLoader();               
                if(snapshot.type === 'added'){
                    renderAds(snapshot.doc.data(),snapshot.doc.id);
                }
            })
        })
    }else{
        hideLoader();
        container.innerHTML = `
            <div class="jumbotron text-center">
                <h2>You are offline but you can still see your saved ads</h2>
                <a href="/src/pages/save.html" class="btn btn-primary">See your Saved ads</a>
            </div>
        `
    }
}

function renderAds(ads,id){
    const adsContainer = document.querySelector('#ads-container');
    adsContainer.innerHTML += `
    <div class="custom-card">
        <div class="custom-card-body">
            <button class="fav-btn btn btn-danger" onClick="addToOffline('${id}')">Add to offline</button>
            <div class="image-container" style="background-image:url('${ads.downloadURL}')">
                <div class="price-label bg-primary">${ads.productPrice}$</div>            
            </div>
            <div class="details">
                <span>Product Category:</span>
                <span>${ads.productCategory}</span>
            </div>
            <div class="details">
                <span>Product Name:</span>
                <span>${ads.productName}</span>
            </div>
            <div class="details">
                <span>Product Model:</span>
                <span>${ads.productModel}</span>
            </div>
            <div class="details">
                <span>Seller Name:</span>
                <span>${ads.sellerName}</span>
            </div>
            <div class="details">
                <button class="btn btn-primary" onClick="showDescription('${id}')">See Description</button>
                <button class="btn btn-primary" onClick="routeToMessage('${ads.sellerUid}')">Contact Seller</button>
            </div>
        </div>
        <div class="custom-card-back" data-id="${id}" onClick="hideDescription('${id}')">
            <p>${ads.productDescription}</p>
        </div>
    </div>
`
}

function addToOffline(id){
    showLoader('Adding offline...');
    let adsArr = [];
    if(localStorage.getItem('ads')){
        adsArr = JSON.parse(localStorage.getItem('ads'));
    }
    for(let i=0; i < adsArr.length; i++){
        if(adsArr[i].id === id){
            showModal('You already have this in offline');
            hideLoader();
            return false;
        }
    }
    db.collection('ads').doc(id)
        .get()
        .then((snapshot)=>{
            const dataSnapshot = {
                id,
                downloadURL: snapshot.data().downloadURL,
                productCategory: snapshot.data().productCategory,
                productDescription: snapshot.data().productDescription,
                productModel: snapshot.data().productModel,
                productName: snapshot.data().productName,
                productPrice: snapshot.data().productPrice,
                sellerName: snapshot.data().sellerName,
                sellerUid: snapshot.data().sellerUid,                
            }         
            console.log(dataSnapshot);
            adsArr.push(dataSnapshot);
            localStorage.setItem('ads',JSON.stringify(adsArr))
            const req = new Request(snapshot.data().downloadURL,{ mode: 'no-cors' });
            caches.open('static')
                .then((cache)=>{
                    fetch(req)
                        .then((response)=>{
                            hideLoader();
                            showModal('This ad is now available offline');
                            return cache.put(req,response);
                        })
                })
        })
}
function showDescription(id){
    console.log(id);
    let descriptionEl = document.querySelector(`div[data-id='${id}']`);
    descriptionEl.style.display = 'flex';
    setTimeout(()=>descriptionEl.style.opacity = '0.9',100);
}

function hideDescription(id){
    let descriptionEl = document.querySelector(`div[data-id='${id}']`);
    descriptionEl.style.opacity = '0';
    setTimeout(()=>descriptionEl.style.display = 'none',500);
}

function searchAds(){
    showLoader('Searching...');
    const searchTypeEl = document.querySelector('#search-form select');
    const userSearchEl = document.querySelector('#search-form input[type="text"]');
    const searchLabelEl = document.querySelector('#search-label');

    if(searchTypeEl.value === '0'){
        showModal('Please specify search type');
        hideLoader();
        return false;
    }
    if(userSearchEl.value.length < 1){
        showModal('Please write something to search');
        hideLoader();
        return false;
    }
    if(searchTypeEl.value === 'name'){
        console.log('By name');
        db.collection('ads').where('productName','==',userSearchEl.value)
            .get()    
            .then((querySnapshot)=>{
                hideLoader();
                if(querySnapshot.empty){
                    showModal('No Result Found!');
                    return false;
                }
                searchLabelEl.style.display = 'flex';
                searchLabelEl.querySelector('.left-content').innerText = `Showing results for ${userSearchEl.value}`;            
                const adsContainer = document.querySelector('#ads-container').innerHTML = '';                
                querySnapshot.forEach((snapshot)=>{
                    renderAds(snapshot.data(),snapshot.id);
                })
            })
            .catch((err)=>{
                showModal(err.message);
                hideLoader();
            })
    }

    if(searchTypeEl.value === 'category'){
        console.log('By Category');
        db.collection('ads').where('productCategory','==',userSearchEl.value)
            .get()
            .then((querySnapshot)=>{
            hideLoader();
            if(querySnapshot.empty){
                showModal('No Result Found!');
                return false;
            }
            searchLabelEl.style.display = 'flex';
            searchLabelEl.querySelector('.left-content').innerText = `Showing results for ${userSearchEl.value}`;        
            const adsContainer = document.querySelector('#ads-container').innerHTML = '';            
            querySnapshot.forEach((snapshot)=>{
                console.log(snapshot.data());
                renderAds(snapshot.data(),snapshot.id);                
            })
        })
        .catch((err)=>{
            showModal(err.message);
            hideLoader();
        })

    }
    return false;
}


function cancelSearch(){
    const adsContainer = document.querySelector('#ads-container').innerHTML = '';    
    const searchLabelEl = document.querySelector('#search-label');
    searchLabelEl.style.display = 'none';
    fetchAds();
    console.log('search');
}

function routeToMessage(sellerUid){
    location.assign(`src/pages/message.html?id=${sellerUid}`);
}

/****************************** ********************
****************************************************
****************************************************
 Functions related to Submit Ads Page
****************************************************
****************************************************
***************************************************/
function submitAdd(){
    showLoader('Submitting...');
    console.log('submit');

    // DOM Shortcuts
    const productCategory = document.querySelector('#product-category');
    const productName = document.querySelector('#product-name');
    const productModel = document.querySelector('#product-model');
    const productDescription = document.querySelector('#product-description');
    const productPrice = document.querySelector('#product-price');    
    const productImage = document.querySelector('#product-image');
    
    console.log(productCategory.value)
    if(productCategory.value === '0'){
        showModal('Please select a category');
        hideLoader();
        return false;
    }
    if(productName.value.trim().length < 1 ||productDescription.value.trim().length < 1|| productPrice.value.trim().length < 1 || productModel.value.trim().length < 1 ||productImage.files.length < 1){
        showModal('All fields are required!');
        hideLoader();
        return false;
    }

    const file = productImage.files[0];
    const name = Date.now() + '-' + file.name;
    const metaData = {contentType: file.type};

    storageRef.child(`ads/${name}`).put(file,metaData)
        .then(()=>{
            console.log('Storage Written!');
            return storageRef.child(`ads/${name}`).getDownloadURL();
        })
        .then((url)=>{
            const data = {
                productCategory : productCategory.value,
                productName : (productName.value).toLowerCase(),
                productDescription : productDescription.value,
                productModel : productModel.value,
                productPrice: productPrice.value,
                downloadURL : url,
                sellerUid : currentUserUid,
                sellerName : currentUsername
            }
            writeDatabase(data);
        })
        .catch(err =>{
            showModal(err.message);
            hideLoader();
        })
    return false;
}

function writeDatabase(data){
    db.collection('ads')
    .add(data)
    .then(()=>{
        clearAdForm();
        showModal('Your ad has been submitted! Redirecting you to home page');
        hideLoader();
        setTimeout(()=> location.assign('../../index.html'),2000);
    })
    .catch((err)=>{
        showModal(err.message)
        hideLoader();
    })
}
function clearAdForm(){
    hideLoader();
    if(!navigator.onLine){
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="jumbotron text-center">
                <h2>You are offline but you can still see your saved ads</h2>
                <a href="/src/pages/save.html" class="btn btn-primary">See your Saved ads</a>
            </div>
        `
    }
    const productCategory = document.querySelector('#product-category').value = '0';    
    const productName = document.querySelector('#product-name').value = '';
    const productModel = document.querySelector('#product-model').value = '';
    const productDescription = document.querySelector('#product-description').value = '';
}


/****************************** ********************
****************************************************
****************************************************
 Functions related to Offline page
****************************************************
****************************************************
***************************************************/

function renderSaveAds(){
    const mainContainer = document.querySelector('.container');
    const container = document.querySelector('#ads-container');
    hideLoader();
    if(!localStorage.getItem('ads')){
        showModal('Nothing to show');
        mainContainer.innerHTML = `
            <h2 class="jumbotron text-center">Nothing to show</h2>
        `
        return false;
    }
    const adsArr = JSON.parse(localStorage.getItem('ads'));
    adsArr.forEach((ad)=>{
        container.innerHTML += `
        <div class="custom-card">
            <div class="custom-card-body">
                <div class="image-container" style="background-image:url('${ad.downloadURL}')">
                    <div class="price-label bg-primary">${ad.productPrice}$</div>            
                </div>
                <div class="details">
                    <span>Product Category:</span>
                    <span>${ad.productCategory}</span>
                </div>
                <div class="details">
                    <span>Product Name:</span>
                    <span>${ad.productName}</span>
                </div>
                <div class="details">
                    <span>Product Model:</span>
                    <span>${ad.productModel}</span>
                </div>
                <div class="details">
                    <span>Seller Name:</span>
                    <span>${ad.sellerName}</span>
                </div>
                <div class="details">
                    <button class="btn btn-primary" onClick="showDescription('${ad.id}')">See Description</button>
                </div>
            </div>
            <div class="custom-card-back" data-id="${ad.id}" onClick="hideDescription('${ad.id}')">
                <p>${ad.productDescription}</p>
            </div>
        </div>
    `    
    })
}
