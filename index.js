const { userInfo } = require('os');

//app, http and io
let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

app.get('/',(req,res) =>{
    res.sendFile(__dirname + '/index.html')
});

let userID = 0;
let chatHistoryLimit = 200;
let chatHistory = [];

let userList = [];
let colorList = [];

//trims chat history according to the chat history limit
function chatHistoryTrim(history){
    if(history.length > chatHistoryLimit){
        history = history.slice(history.length - chatHistoryLimit,history.length)
    } 
    return(history)
}

//on connect and disconnect messages
io.on('connection', (socket)=>{    
    userID = userID + 1;
    let user = "User" + userID
    //ensures uniqueness if someone changes their name to UserX where X is already taken
    while(true){
        if(!userList.includes(user)){
            break;
        }
        userID = userID + 1;
        user = "User" + userID
    }
    console.log('a user connected and assigned ID ' + user);
    userList.push(user)
    io.emit("Joined", userList);
    io.emit("updateUsers",userList);
    //msg is an object with userSend and messageToDisplay
    socket.on('chat message',msg =>{
        //chat history
        //timestamp
        let today = new Date();
        let time = "<" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ">  ";
        msg.messageToDisplay = (time + msg.messageToDisplay);
        //MAY NEED TO UPDATE THIS WHEN CHANGING INTO COOKIES
        chatHistory.push(msg);
        chatHistory = chatHistoryTrim(chatHistory)
        console.log(chatHistory);
        io.emit('chat message', (chatHistory)); 
    })
    socket.on('disconnect', () =>{
        console.log('user disconnected')
    });
    socket.on("removeUser", (user) =>{
        userList.splice(userList.indexOf(user),1);
        io.emit("updateUsers",userList);
    })
    socket.on("userNameChange",(usernamechange) =>{
        userList[userList.indexOf(usernamechange.oldname)] = usernamechange.newname;
        io.emit("updateUsers",userList);
    });
})
//listen on localhost for now
http.listen(3000,()=>{
    console.log("listening on port 3000")
})
