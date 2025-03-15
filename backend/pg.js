const {Client}=require('pg');
require('dotenv').config();

const client=new Client({
    connectionString:process.env.CONNECTION_STRING
});
client.connect();

module.exports=client;