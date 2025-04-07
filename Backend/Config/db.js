import mongoose from "mongoose";

export const connection = ()=>{
    mongoose
    .connect(URI,{
        dbName:"MERN_AUTHENTICATION",
    })
    .then(()=>{
        console.log("Connected to database !! ");
    })
    .catch((err) => {
        console.log(`Some error occured while connecting to database ${err}`);
    });
};