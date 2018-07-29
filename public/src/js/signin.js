const form = document.querySelector('form');
const emailEl = document.querySelector('#email');
const passwordEl = document.querySelector('#password');


form.addEventListener('submit',(e)=>{
    e.preventDefault();
    showLoader('Logging in...');

    if(passwordEl.value.length < 1 || emailEl.value.length < 1){
        showModal('Please fill all the fields');
        hideLoader();
        return false;
    }

    auth.signInWithEmailAndPassword(emailEl.value,passwordEl.value)
        .then((snapshot)=>{
            hideLoader();
            clearFields();            
            localStorage.setItem('userUid',snapshot.user.uid);
            location.assign('../../index.html');
        })
        .catch(err =>{
            showModal(err.message);
            hideLoader();
            clearFields();
        })
})

function clearFields(){
    emailEl.value = '';
    passwordEl.value = '';
}