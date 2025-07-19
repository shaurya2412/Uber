const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const {validationResult} = require('express-validator');

module.exports.registerCaptain = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }
    
    const { name, email, password, vehicle } = req.body;
    const { firstname, lastname } = name;
    const { color, plate, vehiclemodel, capacity } = vehicle;

    const hashedPassword = await captainModel.hashPassword(password);

    const captain = await captainService.createCaptain({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        color,
        plate,
        vehicleType: vehiclemodel,
        capacity,
        Modelname: vehiclemodel
    });

    const token = captain.generateAuthToken();
    
    res.status(201).json({token, captain});  
};

module.exports.loginCaptain = async(req, res, next)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }
    
    const {email, password} = req.body;

    const captain = await captainModel.findOne({email}).select('+password');

    if(!captain){
        return res.status(401).json({message: "Invalid email or password"});
    }

    const isMatch = await captain.comparePassword(password);

    if(!isMatch){
        return res.status(401).json({message: "Invalid password, or network issue"});
    }

    const token = captain.generateAuthToken();

    res.status(200).json({token, captain});
};

module.exports.getCaptainProfile = async(req, res, next)=>{
    res.status(200).json(req.captain);
};

