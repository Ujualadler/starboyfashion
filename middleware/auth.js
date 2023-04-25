
const User = require('../models/userModel')

const isLogin =  async (req,res,next) => {

    try {
        
        if (req.session.user_Id){
            next()            
        }
        else{
            res.redirect('/login')
        }
        
    } catch (error) {
        
        console.log(error.message);

    }
}

const isLogout = async (req,res,next) => {

    try {
        
        if(req.session.user_Id){
            res.redirect('/home')
        }else{
            next()
        }
             
    } catch (error) {
        
        console.log(error.message);

    }
}




module.exports = {
     isLogin,
     isLogout,
     
}