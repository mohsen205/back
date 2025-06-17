// authRoutes.js
const express = require('express');
const authController = require('../Controllers/authControllers');
const upload = require('../midelware/multer');
const authenticateToken=require('../midelware/auth')

const router = express.Router();

router.post('/Inscription', upload.single('imageprofile'), authController.Inscription);
router.post('/login', authController.login);
router.post('/logout',authController.logout);
router.get('/user-info',authenticateToken,authController.getUserInfo);
module.exports = router;
