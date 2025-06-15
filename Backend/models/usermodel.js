const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        minlength: [3, "First  name must be of atleast 3 digits"],
    },
    lastname: {
        type: String,
        minlength: [3, 'Last name must be at least 3 characters long']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, ' Email must be at least 5 charachters long'],
    },
    password: {
        type: String,
        required: true,
        unique: true,
        select:false,
    },
    sockerId: {
        type: String
    },
})

//creating token for jwt,
userSchema.methods.generateAuthtoken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET)
    return token;
}


userSchema.methods.comparePassword = async function (password){
      return await bcrypt.compare(password, this.password);
}

userSchema.statics.hashPassword = async function (password){
    return  await bcrypt.hash(password,10);
}

const userModel = mongoose.model('User', userSchema)

module.exports = userModel;