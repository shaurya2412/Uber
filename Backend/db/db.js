const mongoose = require("mongoose");

function connectTodb(){
    mongoose.connect(process.env.DB_CONNECT).then(() =>{
            console.log('connected to mongodb database  ');
        }
    )
}
module.exports = connectTodb;