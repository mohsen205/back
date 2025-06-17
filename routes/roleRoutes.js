const express=require('express');
const router=express.Router();
const roleController=require('../Controllers/role.Controller');


router.post('/create-Role',roleController.createRole);
router.post('/assignRole',roleController.assignRole);



module.exports=router;