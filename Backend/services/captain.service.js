const captainModel = require("../models/captain.model");

module.exports.createCaptain = async ({
 firstname, lastname, email, password, color, plate, vehicleType, capacity, Modelname
})=>{
    console.log('🔧 Captain service - createCaptain called with:', {
        firstname, lastname, email, 
        color, plate, vehicleType, capacity, Modelname
    });
    
    if( !firstname || !email || !lastname || !password || !color || !capacity || !vehicleType || !plate || !Modelname){
        console.log('❌ Missing required fields');
        throw new Error('All fields are required')
    }
    
    console.log('📝 Creating captain document...');
    const captainData = {
        fullname: {
            firstname,
            lastname,
        },
        email, 
        password,
        vehicle:{
            color,
            plate,
            vehiclemodel: Modelname,
            capacity
        }
    };
    
    console.log('📄 Captain data to save:', JSON.stringify(captainData, null, 2));
    
    try {
        const captain = await captainModel.create(captainData);
        console.log('✅ Captain saved to database successfully:', captain._id);
        return captain;
    } catch (error) {
        console.log('💥 Error saving captain to database:');
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        console.log('Error code:', error.code);
        console.log('Full error:', error);
        throw error;
    }
}