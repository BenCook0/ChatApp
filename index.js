const { userInfo } = require('os');

//app, http and io
let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

app.get('/',(req,res) =>{
    res.sendFile(__dirname + '/index.html')
});

let userID = 0;
let chatHistoryLimit = 200; //CHANGE TO 200 BEFORE FINAL RELEASElet chatHistory = [];
let chatHistory = []

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
    console.log('a user connected and assigned ID ' + userID);
    //userID and chat hisotry to emit
    let data = {
        userID: "User" + userID,
        history: chatHistory
    };
    //on chat message print to the console
    io.emit("Joined", data);
    socket.on('chat message',msg =>{
        //chat history
        chatHistory.push(msg);
        chatHistory = chatHistoryTrim(chatHistory)
        console.log(chatHistory);
        //chat history
        //timestamp
        let today = new Date();
        let time = "<" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ">  ";
        msg = (time + msg);
        //timestamp
        chatHistory.push(msg);
        chatHistory = chatHistoryTrim(chatHistory)
        console.log(chatHistory);
        io.emit('chat message', (msg));
    })
    socket.on('disconnect', () =>{
        console.log('user disconnected')
    })
})

//listen on localhost for now
http.listen(3000,()=>{
    console.log("listening on port 3000")
})
