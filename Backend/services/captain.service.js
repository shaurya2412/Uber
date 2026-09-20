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

module.exports.findNearestCaptains = async ({ lng, lat, maxDistanceMeters = 5000 }) => {
    try {
        if (captainModel.db.readyState !== 1) {
            return [];
        }

        const captains = await captainModel.find({
            active: true,
            status: 'active',
            approvalStatus: { $ne: 'suspended' },
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: maxDistanceMeters
                }
            }
        }).limit(10);
        return captains;
    } catch (error) {
        console.error('Error finding nearest captains via $nearSphere:', error.message);
        // Fallback in case of index initialising or mock locations
        return await captainModel.find({ active: true, status: 'active' }).limit(10);
    }
};