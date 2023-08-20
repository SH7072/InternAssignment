const express = require("express");
const router = express.Router();
// const authController = require("../controller/authController");
const {signUp, login} = require("../Controllers/userController");



// create user (signup)
router.post("/signup",signUp);

// login 
router.post('/login',login);

module.exports = router;
