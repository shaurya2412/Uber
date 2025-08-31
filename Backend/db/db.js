const mongoose = require("mongoose");
const config = require("../config");

function connectTodb() {
    mongoose.connect(config.MONGODB_URI)
        .then(() => {
            console.log('Connected to MongoDB database successfully');
        })
        .catch((error) => {
            console.error('MongoDB connection error:', error);
            process.exit(1);
        });
}

module.exports = connectTodb;