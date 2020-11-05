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

//userlist is comprised of a user-color pair
let userList = [];

//trims chat history according to the chat history limit
function chatHistoryTrim(history){
    if(history.length > chatHistoryLimit){
        history = history.slice(history.length - chatHistoryLimit,history.length)
    } 
    return(history)
}

//on connect and disconnect messages
io.on('connection', (socket)=>{
    io.emit("CookieCheck",userList);
    socket.on("CookieConfirm",cookiemsg =>{
        if(cookiemsg === ""){
        userID = userID + 1;
        //ensures uniqueness if someone changes their name to UserX where X is already taken
        let isUnique = true;
        while(true){
                for(i = 0; i < userList.length; i++){
                    //the chosen ID is not unique
                    if(userList[i].user === ("User" + userID)){
                        isUnique = false;
                    }
                }
                if(isUnique){
                    break;
                } else{
                    userID = userID + 1;
                    isUnique = true;
                }
            }
            let randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
            let userColorPair = {
                user: "User" + userID,
                color: randomColor
                }
            console.log('a user has joined for the first time and assigned ID ' + userColorPair.user);
            userList.push(userColorPair)
        } else {
            console.log('a user re-connected and assigned ID ' + cookiemsg.user);
            userList.push(cookiemsg)
        }
        io.emit("Joined", userList);
        io.emit("updateUsers",userList);
        console.log(userList)
    })
    //msg is an object with userSend and messageToDisplay
    socket.on('chat message',msg =>{
        //chat history
        //timestamp
        let today = new Date();
        let time = "<" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ">  ";
        msg.messageToDisplay = (time + msg.messageToDisplay);
        chatHistory.push(msg);
        chatHistory = chatHistoryTrim(chatHistory)
        io.emit('chat message', (chatHistory)); 
    })
    socket.on('disconnect', () =>{
        console.log('user disconnected')
    });
    socket.on("removeUser", (user) =>{
        for(i = 0; i < userList.length; i++){
            if(userList[i].user === user){
                userList.splice(i,1)
            }
        }
        io.emit("updateUsers",userList);
    })
    //check for uniqueness is done clientside
    socket.on("userNameChange",(usernamechange) =>{
        console.log(userList);
        for(i = 0; i < userList.length; i++){
            if(usernamechange.oldname === userList[i].user){
                userList[i].user = usernamechange.newname;
            }
        }
        console.log(userList);
        io.emit("updateUsers",userList);
    });
    socket.on("colorChange",(colorchange)=>{
        //change both the color of the message history and the userlist
        for(i = 0; i < chatHistory.length; i++){
            if(chatHistory[i].userSend === colorchange.user){
                chatHistory[i].messageColor = colorchange.newcolor;
            }
        }
        for(i = 0; i < userList.length; i++){
            if(userList[i].user === colorchange.user){
                userList[i].color = colorchange.newcolor;
            }
        }
        io.emit("updateUsers",userList);
    });
})
//listen on localhost for now
http.listen(3000,()=>{
    console.log("listening on port 3000")
})
