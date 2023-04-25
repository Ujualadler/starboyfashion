const mongoose=require("mongoose")
const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    image:{
        type:Array,
        required:true
        
    },
    quantity:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
     },
    brand:{
        type:String,
        required:true
    },
    size:{
        type:Array,
       
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category',
    
         required:true
    },
    is_flag:{
        type:Number,
        default:0
    }
})

const productModel=mongoose.model('product',productSchema)
module.exports=productModel