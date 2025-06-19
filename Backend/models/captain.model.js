const mongoose = require("mongoose");

const captainSchema = new mongoose.schema({

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
    }
    
})