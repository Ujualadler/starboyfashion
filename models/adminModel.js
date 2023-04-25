const mongoose= require ('mongoose')

// ---------- schema creation
const adminSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : true,
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String ,
        require : true
    }
})




const adminModel = mongoose . model ('admin' , adminSchema )

module.exports = adminModel 