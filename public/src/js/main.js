
/****************************************
 ****************************************
 
  Put your firebase configuration here 
  i am not providing because of security issues
  
 ****************************************
 ***************************************/


const db = firebase.firestore();
const auth = firebase.auth();
const storageRef = firebase.storage().ref();
const messaging = firebase.messaging();
const modalEl = document.querySelector('.custom-modal');
const loaderEl = document.querySelector('.custom-loader');


if(localStorage.getItem('userUid')){
  if(location.pathname === '/src/pages/signin.html' || location.pathname === '/src/pages/signup.html'){
      location.assign('/index.html');
  }
}else{
  if(location.pathname !== '/src/pages/signin.html'){
      if(location.pathname !== '/src/pages/signup.html'){
        location.assign('/src/pages/signin.html');
      }
  }
}

function showModal(message){
  modalEl.querySelector('.custom-modal-body').innerText = message;
  modalEl.style.display = 'block';
  setTimeout(()=>{
    modalEl.style.top = '50%';
    modalEl.style.opacity = '1';    
  },100)

  setTimeout(hideModal,3000);
}



function hideModal(){
  setTimeout(()=>{
    modalEl.style.display = 'none';
  },500);
  modalEl.style.top = 'calc(50% - 100px)';
  modalEl.style.opacity = '0';    
}



function showLoader(message){
  loaderEl.querySelector('span').innerText = message;
  loaderEl.style.display = 'flex';
  setTimeout(()=>{
    loaderEl.style.opacity = '1';    
  },100)
}



function hideLoader(){
  setTimeout(()=>{
    loaderEl.style.display = 'none';
  },500);
  loaderEl.style.opacity = '0';    
}

function logout(){
  showLoader('Logging out...');
  db.collection('users').doc(currentUserUid).set({deviceToken:null},{merge: true})
    .then(()=>{
      return auth.signOut()
    })
    .then(()=>{
      hideLoader();
      window.localStorage.removeItem('userUid');
      window.localStorage.removeItem('currentUserName');      
      location.assign('/src/pages/signin.html');
    })
}
function openMenu(){
  const menu = document.querySelector('#side-menu');
  menu.style.opacity = '1';
  menu.style.transform = 'translateX(0)';
}
function closeMenu(){
  const menu = document.querySelector('#side-menu'); 
  menu.style.opacity = '0';  
  menu.style.transform = 'translateX(-500px)';   
}

function readURLParam(parameter){
  let url = new URL(window.location.href);
  let param = url.searchParams.get(parameter);
  return param;
}


// if ("serviceWorker" in navigator) {
//   console.log("Service Worker is supported");

//   // if service worker supported then register my service worker
//   navigator.serviceWorker
//     .register("/firebase-messaging-sw.js")
//     .then(function(reg) {
//       console.log("Successfully Register :^)", reg);

//       reg.pushManager
//         .subscribe({
//           userVisibleOnly: true
//         })
//         .then(function(subscription) {
//           console.log("subscription:", subscription.toJSON());
//           // GCM were used this endpoint
//           console.log("endpoint:", subscription.endpoint);
//         });
//     })
//     .catch(function(error) {
//       console.log("SW Registration Failed: :^(", error);
//     });
// }
