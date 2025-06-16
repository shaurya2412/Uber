const userModel = require("../models/usermodel")

module.exports.createUser = async ({
    firstname, lastname, email,password
})=>{
    if( !firstname || !email || !lastname || !password){
        throw new error('All fields are required')
    }
    const user = new userModel.create({
        fullname: {
            firstname,
            lastname,
        },
        email, 
        password
    })

    return user
}