import mongoose from "mongoose";
const student =mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    phone:{type:String}
})