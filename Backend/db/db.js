const mongoose = require("mongoose");
const config = require("../config");

function connectTodb() {
    mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
        .then(() => {
            console.log('Connected to MongoDB database successfully');
        })
        .catch((error) => {
            console.warn('MongoDB connection notice:', error.message);
            console.warn('Server continuing to run on port ' + (config.PORT || 5000));
        });
}

module.exports = connectTodb;