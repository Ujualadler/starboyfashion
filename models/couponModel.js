const mongoose = require('mongoose')
const couponSchema =new mongoose.Schema({
    couponId:{
        type:String,
        required:true,
    },couponName:{
        type:String,
        required:true
    },
    expiryDate:{
        type:String,
        required:true
    },
    maxAmount:{
        type:Number,
        required:true
    },
    minAmount:{
        type:Number,
        require:true
    },
    discount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
       default:true
    },
    max_discount:{
        type:Number,
        required:true
    },
    ref:{
        type:String,
        default:1
    }
})
const couponModel =  mongoose.model('coupon',couponSchema)
module.exports =couponModel