const mongoose = require("mongoose")

const bannerSchema = new mongoose.Schema({
    image:{
        type:Array,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    title:{
     type:String,
     required:true
    },
    is_ban:{
        type:Number,
        default:0,
    }
})

const bannerModel = mongoose.model('banner',bannerSchema)
module.exports=bannerModel