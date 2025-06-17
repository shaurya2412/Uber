const userModel = require("../models/usermodel")

module.exports.createUser = async ({
    firstname, lastname, email,password
})=>{
    if( !firstname || !email || !lastname || !password){
        throw new Error('All fields are required')
    }
    const user = await userModel.create({
        fullname: {
            firstname,
            lastname,
        },
        email, 
        password
    })

    return user;
}