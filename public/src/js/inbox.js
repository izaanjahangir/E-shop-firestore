// const otherUserUid = localStorage.getItem('sellerUid');
const inboxContainer = document.querySelector('#inbox-container');
const container = document.querySelector('.container');

window.addEventListener('load',()=>{
    console.log('load')
    if(navigator.onLine){
        db.collection('rooms').where(`users.${currentUserUid}`,'==',true).onSnapshot((querySnapshot)=>{
            hideLoader();
            if(querySnapshot.empty){
                showModal("You haven't chat with anyone");
                container.innerHTML = `
                        <div class="jumbotron text-center">
                            <h2>Nothing to show</h2>
                        </div>
                    `
                return false;
            }
            querySnapshot.docChanges().forEach(async (snapshot)=>{
                if(snapshot.type === 'added'){
                    console.log(snapshot)
                    console.log(snapshot.doc.data())                    
                    const data = snapshot.doc.data();
                    let otherUserObj;
                    let otherUid;
                    data.usersInfo.forEach((user)=>{
                        if(user.uid !== currentUserUid){
                            otherUserObj = user;
                            console.log(otherUserObj)
                        }
                    })
                    await db.collection('users').doc(otherUserObj.uid)
                        .get()
                        .then((snapshot)=>{
                            otherUserObj = snapshot.data();
                            otherUid = snapshot.id
                        })
                    inboxContainer.innerHTML += `
                                <div class="message-outer" onClick="routeToMessage('${otherUid}')">
                                    <span class="avatar-message mx-2" style="background-image:url(${otherUserObj.avatar})"></span>
                                    <li class="list-group-item message">
                                        <span class="left-content">${otherUserObj.username}</span>
                                        <span class="right-content"><img src='../images/right-arrow.png' alt="right arrow" style="width: 20px">
                                    </li>                
                                </div>
                            `
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
})

function routeToMessage(otherUserUid){
    location.assign(`message.html?id=${otherUserUid}`);
}

