const { userInfo } = require('os');

//app, http and io
let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

app.get('/',(req,res) =>{
    res.sendFile(__dirname + '/index.html')
});

let UserID = 0;
//on connect and disconnect messages
io.on('connection', (socket)=>{    
    UserID = UserID + 1;
    console.log('a user connected and assigned ID ' + UserID);
    //on chat message print to the console
    io.emit("Joined", "User" + UserID);
    socket.on('chat message',msg =>{
        //timestamp
        let today = new Date();
        let time = "<" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ">  ";
        //timestamp
        io.emit('chat message', (time + msg));
    })
    socket.on('disconnect', () =>{
        console.log('user disconnected')
    })
})

//listen on localhost for now
http.listen(3000,()=>{
    console.log("listening on port 3000")
})
