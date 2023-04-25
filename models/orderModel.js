const mongoose=require("mongoose")


const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    order:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
            require:true
        },
        price:{
            type:Number,
            require:true

        },
        total:{
            type:Number,
            require:true
        },
        quantity:{
            type:Number,
            require:true
        },
        date:{
            type:Date,
            require:true
        },
        status:{
            type:String,
            require:true,
            default:'OrderConfirmed'
        },
        arrivingDate:{
            type:Date,
            require:true,
            
        },
        deliveredDate:{
            type:Date,
            require:true,
            
        },

    }],
    address:{
        type:Object,
        require:true
    },
    grandTotal:{
        type:Number,
        require:true
    },
    paymentMethod:{
        type:String,
        require:true
    },
    subTotal:{
        type:Number,
        
        
    },
    discount:{
        type:Number,
        
        
    }
})
const orderModel = mongoose.model('order',orderSchema)
module.exports=orderModel

