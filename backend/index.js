const express=require('express');
const passport = require('passport');
const client=require('./pg');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const registerRoutes=require('./routes/register');
const LoginRoute=require('./routes/login');
const app=express();

const server=require('http').createServer(app);

const io=require('socket.io')(server,{
    cors:{
        origin:"http://localhost:5173",
        methods:["GET","POST"]
    }
});
const dotenv=require('dotenv');
dotenv.config();
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
    methods:["GET","POST"]
}));
let users=[];
io.on("connection",(socket)=>{
    console.log("user connect hua hai ");
    console.log(socket.id);
    users.push(socket.id);
    socket.emit("client_id",socket.id);
    socket.broadcast.emit("users",users);
    socket.on("outgoing:call",(data)=>{
        socket.to(data.to).emit("incomingOffer",{from:socket.id,offer:data.offer})
    });
    socket.on("accepted",(data)=>{
        socket.to(data.to).emit("incomingAnswer",{answer:data.answer});
        console.log("answer sent");
        console.log(data.answer);
    })
    socket.on("ice-candidate", (data) => {
       
    
            socket.to(data.to).emit("ice-candidate", {candidate: data.candidate });
        
    });
    socket.on("disconnect",()=>{
        console.log("user disconnect hua hai:",socket.id);
        users=users.filter((id)=>{
               id!=socket.id;
               
        })
        socket.broadcast.emit("users",users);
    })
})
app.use(express.json());
app.use(cookieParser());
app.use('/auth',registerRoutes);
app.use('/login',LoginRoute)
server.listen(process.env.PORT || 8080);



