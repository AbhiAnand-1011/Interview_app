const express=require('express');
const router=express.Router();
const {AuthRegister,Register}=require('../controllers/register');
router.post('/firebase',AuthRegister);
router.post('/local',Register);
module.exports=router;