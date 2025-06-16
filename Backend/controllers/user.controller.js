const userModel = require('../models/usermodel');
const userService = require("../services/user.service")
const {validationResult} = require('express-validator');

module.exports.registerUser = async(req, res, next) => {

    const errors = validationResult(req);
    if (!error.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }
    const {firstname, lastname, email, password} = req.body;

    const hashedPassword = await userModel.hassPassword(password);

  const user = await userService.createUser({
    firstname,
    lastname,
    email,
    password:hashedPassword
  })

  const token = user.generateAuthToken();
  
  res.status(201).json({token, user});  
}