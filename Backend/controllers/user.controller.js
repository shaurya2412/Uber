const userModel = require('../models/usermodel');
const userService = require("../services/user.service")
const {validationResult} = require('express-validator');

module.exports.registerUser = async(req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }
const { fullname, email, password } = req.body;
const { firstname, lastname } = fullname;

    const hashedPassword = await userModel.hashPassword(password);

  const user = await userService.createUser({
      firstname,
      lastname,
      email,
    password:hashedPassword
  })

  const token = user.generateAuthToken();
  
  res.status(201).json({token, user});  
}

module.exports.loginUser = async(req, res, next)=> {
  const errors = validationResult(req);
   if (!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }
    
    const {email,password} = req.body;

    const user = await userModel.findOne({email}).select('+password')

    if(!user){
      return res.status(401).json({message: "Invalid email or password"})
    }

    const isMatch = await user.comparePassword(password);

  if(!isMatch){
    return res.status(401).json({message: "Invalid password, or network issue"})
  }

  const token = user.generateAuthToken();

  res.status(200).json({token, user});

}

module.exports.getUserprofile = async(req,res,next)=>{
  res.status(200).json(req.user);

  
}