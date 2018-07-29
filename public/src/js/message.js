// const otherUserUid = localStorage.getItem('otherUserUid');
let otherUserUid;
const messageSection = document.querySelector('#messages-section');
const messageContainer = document.querySelector('#message-container');
const sendMessageForm = document.querySelector('#message-form');
const userMessageEl = sendMessageForm.querySelector('input[type="text"]');
let roomId;
let otherUserName;

sendMessageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    if(userMessageEl.value.trim().length < 1){
        showModal('Please write something');
        return false;
    }
    showLoader('Sending message');
    const userMessage = userMessageEl.value;
    console.log()
    db.collection('rooms').doc(roomId).collection('messages').add({
        message : userMessage,
        senderId: currentUserUid,
        senderName: currentUsername,
        receiverId: otherUserUid,
        timeStamp: Date.now()
    })
    .then(()=>{
        console.log('msg sent');
        userMessageEl.value = '';
        hideLoader();
        // sendNotification(userMessage);
    })
})




window.addEventListener('load',()=>{
    if(navigator.onLine){
        otherUserUid =  readURLParam('id');
        if(!otherUserUid){
            showModal("Sorry! the chat you are looking for doesn't exist!,please check url");
            return false;
        }
        showLoader('Fetching messages...');
        db.collection('rooms').where(`users.${currentUserUid}`,'==',true).where(`users.${otherUserUid}`,'==',true)
            .onSnapshot(async (querySnapshot)=>{
                console.log(querySnapshot);
                console.log(otherUserUid)
                await db.collection('users').doc(otherUserUid).get().then((snapshot)=>{
                    console.log(snapshot)
                    console.log(snapshot.data())                    
                    otherUserName = snapshot.data().username;
                    otherUserAvatar = snapshot.data().avatar;
                })
                if(querySnapshot.empty){
                    showModal("No Previous chat");           
                    db.collection('rooms').add({
                        users : {
                            [currentUserUid] : true,
                            [otherUserUid] : true
                        },
                        usersInfo : [
                            {
                                name: currentUsername,
                                uid: currentUserUid
                            },{
                                name: otherUserName,
                                uid: otherUserUid
                            }
                        ]
                    }).then((snapshot)=>{
                        hideLoader();   
                        roomId = snapshot.id;
                    })
                }else{
                    console.log('Room Found');
                    querySnapshot.forEach((snapshot)=>{
                        roomId = snapshot.id;
                        loadMessages();
                    })
                } 
            })
    }else{
        hideLoader();
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="jumbotron text-center">
                <h2>You are offline but you can still see your saved ads</h2>
                <a href="/src/pages/save.html" class="btn btn-primary">See your Saved ads</a>
            </div>
        `
    }
});

function loadMessages(){
    console.log('Load messages')
    db.collection('rooms').doc(roomId).collection('messages').orderBy('timeStamp')
        .onSnapshot((querySnapshot)=>{
            console.log(querySnapshot)
            hideLoader();
            if(querySnapshot.empty){
                console.log('If')
                showModal("No Previous chat");
                return false;
            }
            querySnapshot.docChanges().forEach((snapshot)=>{
                console.log(snapshot)
                let msgObj = snapshot.doc.data();
                messageContainer.innerHTML += `
                    <div class="message-outer ${msgObj.senderId === currentUserUid ? 'right-message-outer': 'left-message-outer'}">
                        <span class="avatar-message mx-2" style="background-image:url(${msgObj.senderId === currentUserUid ? currentUserAvatar : otherUserAvatar})"></span>
                        <li class="list-group-item message">
                            <span>${msgObj.message}</span>
                        </li>                
                    </div>
                    `
                scrollToBottom();
            })
        })
}


function scrollToBottom(){
    messageSection.scrollTop = messageSection.scrollHeight;
}