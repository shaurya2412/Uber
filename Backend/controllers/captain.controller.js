const captainModel = require("../models/captain.model");
const captainService = require("../services/captain.service");
const {validationResult} = require('express-validator');

module.exports.registerCaptain = async(req, res, next) => {
    console.log('🚀 Captain registration started');
    console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({error: errors.array()});
    }
    ``
    try {
        const { name, email, password, vehicle } = req.body;
        const { firstname, lastname } = name;
        const { color, plate, vehiclemodel, capacity } = vehicle;

        console.log('📋 Extracted data:', {
            firstname, lastname, email, 
            color, plate, vehiclemodel, capacity
        });

        console.log('🔐 Hashing password...');
        const hashedPassword = await captainModel.hashPassword(password);
        console.log('✅ Password hashed successfully');

        console.log('👤 Creating captain...');
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
        console.log('✅ Captain created successfully:', captain._id);

        console.log('🎫 Generating auth token...');
        const captaintoken = captain.generateAuthToken();
        console.log('✅ Token generated successfully');
        
        console.log('🎉 Registration completed successfully');
        res.status(201).json({captaintoken, captain});
    } catch (err) {
        console.log('💥 Registration error occurred:');
        console.log('Error name:', err.name);
        console.log('Error message:', err.message);
        console.log('Error code:', err.code);
        console.log('Full error:', err);
        
        if (err?.name === 'ValidationError') {
            console.log('📝 Mongoose validation errors:', err.errors);
            const errorArray = Object.values(err.errors).map(e => ({ msg: e.message }));
            return res.status(400).json({ error: errorArray });
        }
        if (err?.code === 11000) {
            console.log('📧 Duplicate email error');
            return res.status(400).json({ error: [{ msg: 'Email already registered' }] });
        }
        console.log('🔥 Unexpected error, returning 500');
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.loginCaptain = async(req, res, next)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({error: errors.array()});
    }
    
    const {email, password} = req.body;

    const captain = await captainModel.findOne({email}).select('+password');

    if(!captain){
        return res.status(401).json({message: "Invalid "});
    }

    const isMatch = await captain.comparePassword(password);

    if(!isMatch){
        return res.status(401).json({message: "Invalid password, or network issue"});
    }

    const captaintoken = captain.generateAuthToken();

    res.status(200).json({captaintoken, captain});
};

module.exports.getCaptainProfile = async(req, res, next)=>{
    res.status(200).json({
        success: true,
        captain: req.captain
    });
};

module.exports.updateCaptainStatus = async(req, res, next)=>{
    try {
        const { active } = req.body;
        const captainId = req.captain._id;

        console.log('🔄 Updating captain status:', { captainId, active });

        const captain = await captainModel.findByIdAndUpdate(
            captainId,
            { active: active },
            { new: true }
        );

        console.log('✅ Captain updated:', { captainId: captain._id, active: captain.active });

        if (!captain) {
            return res.status(404).json({
                success: false,
                message: "Captain not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Status updated successfully",
            captain: captain
        });
    } catch (error) {
        console.error('❌ Error updating captain status:', error);
        res.status(500).json({
            success: false,
            message: "Error updating captain status",
            error: error.message
        });
    }
};

