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
        origin:["https://interview-webapp.netlify.app","http://localhost:5173"],
        methods:["GET","POST"],
        credentials:true
    }
});
const dotenv=require('dotenv');
dotenv.config();
app.use(cors({
    origin:["https://interview-webapp.netlify.app","http://localhost:5173"],
    credentials:true,
    methods:["GET","POST"]
}));
let users=[];
io.on("connection",(socket)=>{
   
    console.log(socket.id);
    users.push(socket.id);
    socket.emit("client_id",socket.id);
    socket.broadcast.emit("users",users);
    socket.on("outgoing:call",(data)=>{
          
        socket.to(data.to).emit("incomingOffer",{from:socket.id,offer:data.offer})
        console.log("offer sent ",data.offer)
    });
    socket.on("accepted",(data)=>{
        socket.to(data.to).emit("incomingAnswer",{answer:data.answer});
        console.log("answer sent");
        console.log(data.answer);
    })
    socket.on("negotiation",(data)=>{
        socket.to(data.to).emit("negotiation",{from:socket.id,offer:data.offer});
        console.log("negotiation offer sent",data.offer)
    })
    socket.on("nego-done",(data)=>{
        socket.to(data.to).emit("nego-final",{from:socket.id,answer:data.answer});
        console.log("negotiation answer sent",data.answer);
    })
    socket.on("disconnect",()=>{
        
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



