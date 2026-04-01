const mongoose = require('mongoose');

const connectToDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to database successfully")
    } catch (error) {
        console.error("An unknown error occurred")
        process.exit(1)
    }
}

module.exports = connectToDB;