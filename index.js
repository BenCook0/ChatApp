//app, http and io
let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

app.get('/',(req,res) =>{
    res.sendFile(__dirname + '/index.html')
});

//on connect and disconnect messages
io.on('connection', (socket)=>{
    console.log('a user connected')
    //on chat message print to the console
    socket.on('chat message',msg =>{
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    })
    socket.on('disconnect', () =>{
        console.log('user disconnected')
    })
})



//listen on localhost for now
http.listen(3000,()=>{
    console.log("listening on port 3000")
})
