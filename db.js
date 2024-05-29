const mongoose = require('mongoose');
// const mongoURI = 'mongodb://127.0.0.1:27017/inotebook';
const mongoURI = 'mongodb+srv://shreshthverma2001:password%40123@cluster0.gcwyevp.mongodb.net/';


const connectToMongo = () => {
    mongoose.connect(mongoURI)
        .then(() => {
            console.log("Successful connection to MongoDB!");
        })
        .catch(err => {
            console.error("Error connecting to MongoDB:", err);
        });
}

module.exports = connectToMongo;
