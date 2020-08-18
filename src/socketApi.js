const cocketio = require('socket.io');  // socket io qismi ulanish 
const randomColors =require('../helper/randomColor')    

const io = cocketio();

const socketApi = {};

socketApi.io = io;


const users = { };


io.on('connection', (socket) => {

    console.log(`Foydalanuvchi bog'landi`);

    socket.on("newUser", (data) => {
        // console.log(data.username);
        const defoultData = {
            id: socket.id,
            position: {
                x: 0,
                y: 0
            },
            color: randomColors()
        };

        const userData = Object.assign(data, defoultData);
       
        users[socket.id] = userData // socket id orqali ushladik
        // console.log(users[socket.id]);

        socket.broadcast.emit("newUser", users[socket.id]); // IndexControllerda qarshilimiz

        socket.emit("initPlayers", users);

        socket.on("disconnect", () => {
            socket.broadcast.emit('disUser', users[socket.id])
            console.log(users);
            delete users[socket.id]  // serverdan o'chirish uchun
            console.log(users + 'chiqib ketdi');
        })
    })
    socket.on("animate", (data) => {
        try{
            // console.log(positions);
            users[socket.id].position.x = data.x;
            users[socket.id].position.y = data.y;
            // console.log(data);
            // console.log(users);
            socket.broadcast.emit("animate", {
            socketId : socket.id,
            x: data.x,
            y: data.y
        })
        }catch(e){
            console.log(e);
        }
    })

    socket.on("newMessage", (data) => {
        socket.broadcast.emit("newMessage", data);
    })
})

module.exports = socketApi;