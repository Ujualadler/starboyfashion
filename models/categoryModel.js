const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({
    name:{
        uppercase:true,
        type:String,
        required:true
    }
})

const categoryModel = mongoose.model('category',categorySchema)
module.exports=categoryModel