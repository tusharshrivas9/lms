const mongoose = require("mongoose")

const courseSchema = new Schema({
 title:{
    type:String,
    required:true
 },
 description:{
    type:String,
    required:true
 },
 category:{
    type:String
 },
 thumbnail:{
    public_id : {
        type:String
    },
    secure_url:{
        type:String
    } 
 },
 lecture:[{
    title:String,
    description:String,
    lecture:{
        public_id : {
            type:String
        },
        secure_url:{
            type:String
        }
    }
 }],

 NumberOflecture:{
    type:Number,
    default:0
 },

 createdBy:{
    type:String
 }
},{
    timestamps:true
}) 

const Course = model("Course",courseSchema)


module.exports = Course