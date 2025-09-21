const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const captainSchema = new mongoose.Schema({
    fullname:{
        firstname:{
            type: String,
            required: true,
            minlength:[3, "Firstname should be atleast 3 in length"]
        },
        lastname:{
            type:String,
            minlength: [2, "lastname should be 3 in lenght"]
        }
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase: true
    },
    password:{
        type:String,
        required:true,
        select:false,
    },
    socketId:{
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    active: {
        type: Boolean,
        default: false,
    },

    vehicle: {
        color:{
             type: String,
             required: true,
             minlength: [3, 'Color must be three characters long'],
        },
        plate:{
            type:String,
            required: true,
            minlength: [10, "Goverment registered unique number is required"]
        },
        vehiclemodel: {
            type: String,
            required: true,
            minlength: [3, "The model name should be atleast 3 characters long"]
        },
        capacity:{
            type: String,
            required: true,
            minlength: [1, "The capacity of the vehicle should be more than 1"]
        },

        location: {
            lat:{
                type: Number,
            },
            lng:{
                type: Number
            }
        }
    }
});

captainSchema.methods.generateAuthToken = function(){
    console.log('🎫 Generating JWT token for captain:', this._id);
    console.log('🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔑 JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'undefined');
    
    try {
        const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
        console.log('✅ JWT token generated successfully');
        return token;
    } catch (error) {
        console.log('💥 JWT token generation failed:');
        console.log('Error:', error.message);
        throw error;
    }
};

captainSchema.methods.comparePassword = async function(password){
       return await bcrypt.compare(password, this.password);
};

captainSchema.statics.hashPassword = async function(password){
        return await bcrypt.hash(password,10);
};

const captainModel = mongoose.model('Captain', captainSchema);
module.exports = captainModel;

