const mongoose= require ('mongoose')

// ---------- schema creation
const userSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : true,
    },
    email : {
        type : String,
        required : true
    },
    mobile:{
        type:Number,
        require:true
    },
    password : {
        type : String ,
        require : true
    },
    rePassword : {
        type : String,
        require : true    
    },
    is_block : {
        type : Number ,
        require : true,
        default : 0
    },
    is_verified:{   
        type:Number,
        default:0,
    },
    discountedTotal:{   
        type:Number,
        
    },
     wallet:{
            type:Number,
            default:0
        },
    address:[{
        name:{
            type:String,
            required:true
        },
        houseName:{
            type:String,
            required:true
        },
        townCity:{
            type:String,
            required:true
        },
        district:{
            type:String,
            require:true
        },
        state:{
            type:String,
            require:true
        },
        pincode:{
            type:Number,
            require:true
        },
        mobileNo:{
            type:Number,
            require:true
        },
        email:{
            type:String,
            require:true
        },
       
        
    }],
    cart:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
            requiure:true
        },
        quantity:{
            type:Number,
            require:true,
            default:1
        },
        total:{
            type:Number,
            require:true
        },
        size:{
            type:String,
            require:true
        },
        grandTotal:{
            type:Number,
            require:true
        }


    }],
    wishlist:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
            requiured:true
        },
       

    }]
})

const userModel = mongoose . model ('User' , userSchema )

module.exports = userModel 