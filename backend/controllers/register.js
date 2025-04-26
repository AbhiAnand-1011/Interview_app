const client=require('../pg');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const AuthRegister=async(req,res)=>{
        const userData=req.body;
        client.query(`INSERT INTO USERS(name,email,photo_url,auth_type) VALUES($1,$2,$3,$4)`,[userData.name,userData.email,userData.photo_url,'firebase'],(error,result)=>{
            if(!error){
                console.log(result.rows);
                res.json({
                    status:200
                });

            }
            else{
                console.log(error);
                res.send('err');
            }
           
        });
}
const Register=async(req,res)=>{
    const userData=req.body;
    const hashedPassword=await bcrypt.hash(userData.password,10);
    client.query(`INSERT INTO USERS(name,email,password,auth_type) VALUES($1,$2,$3,$4)`,[userData.name,userData.email,hashedPassword,'local'],(error,result)=>{
        if(!error){
            console.log(result.rows);
            const token=jwt.sign(userData,process.env.JWT_SECRET);
            console.log(token);
            res.cookie("token",token,{
                httpOnly:true,
                secure:true,
                sameSite:"none"
            });
            res.json({
                status:200
            });
        }
        else{
            console.log(error);
            res.json({
                status:'ERR',
                error_code:error.code
            });
        }
    })
}
module.exports={AuthRegister,Register};