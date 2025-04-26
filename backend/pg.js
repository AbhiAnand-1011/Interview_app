const {Client}=require('pg');
require('dotenv').config();
console.log(process.env.CONNECTION_STRING);
const client=new Client({
    connectionString:process.env.CONNECTION_STRING
});
client.connect((err)=>{
    if(err)
       console.log(err);
}
);

module.exports=client;