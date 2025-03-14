const express=require('express');
const passport = require('passport');
const client=require('./pg');
const cors=require('cors');
const cookieParser=require('cookie-parser');
const registerRoutes=require('./routes/register');
const LoginRoute=require('./routes/login');
const app=express();
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
//app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(cookieParser());
app.use('/auth',registerRoutes);
app.use('/login',LoginRoute)
app.listen(8080);



