const client=require('../pg');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const Login=async(req,res)=>{
    
    const userData=req.body;
    client.query('SELECT * FROM users WHERE email=$1',[userData.email],async(error,result)=>{
        if(!error){
           const hashedPassword=result.rows[0].password;
           const matched=await bcrypt.compare(userData.password,hashedPassword);
           if(matched){
            const token=jwt.sign({
                name:result.rows[0].name,
                email:userData.email
            },process.env.JWT_SECRET);
            res.cookie("token",token);
            res.json({
                status:200,
                name:result.rows[0].name
            })
           }
           else{
            res.json({
                status:'ERR'
            })
           }

        }
        else{
            console.log(error);
        }
    })
}
module.exports=Login;