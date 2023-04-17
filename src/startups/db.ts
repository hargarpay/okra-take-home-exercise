import mongoose from "mongoose";

export const initiateDB = async () => {
    new Promise((resolve, reject) => {
        mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("Connected to MongoDB")
            resolve("Connected to MongoDB");
        })
        .catch((err) => {
            console.log(err);
            reject("Error connecting to Mongo");
        })
    })
}