const captainModel = require("../models/captain.model");

module.exports.createCaptain = async ({
 firstname, lastname, email, password, color, plate, vehicleType, capacity, Modelname
})=>{
    if( !firstname || !email || !lastname || !password || !color || !capacity || !vehicleType || !plate || !Modelname){
        throw new Error('All fields are required')
    }
    const captain = await captainModel.create({
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

    })

    return captain;
}