const express = require("express");
const router = express();
const session = require ('express-session');
const config = require ('../config/config')
const dotenv=require("dotenv")
dotenv.config({ path:".env"})

router.use(session({secret:process.env.SESSION_SECRET ,resave:true,saveUninitialized:true}))

const auth = require ('../middleware/auth')

router.set ('views','./views/users')

const bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended : true }))
const userController = require ('../controllers/userController')
const couponController=require("../controllers/couponController")
const orderController=require("../controllers/orderController")

router.get('/register',userController.loadRegister);
router.post('/register',userController.insertUser );
router.get('/',userController.loadHome );
router.get('/home',userController.loadHome)

router.get('/login',auth.isLogout,userController.loginLoad )
router.post('/login',userController.verifyUserLogin)

router.get("/verify",userController.verifyMail)

router.get("/otplogin",auth.isLogout,userController.otpLogin)
router.post("/otplogin",userController.verifyOtpLogin)
router.post('/otpverification',userController.otpVerification)
router.post('/resendOtp',userController.resendOTP)

router.get("/shop",userController.shopLoad)
router.get("/productView", userController.loadProductView)

router.get("/addToCart",auth.isLogin,userController.loadAddToCart)
router.post("/addToCart",auth.isLogin,userController.addToCart)
router.post("/increment",userController.incrementCart)
router.get("/addToCartWish",userController.addToCart)
router.post("/decrement",userController.decrement)
router.get("/cart/delete",userController.deleteCart)

router.get("/wishlist",auth.isLogin,userController.loadWishlist)
router.get("/addwishlist",auth.isLogin,userController.addToWishlist)
router.get("/wishlist/delete",auth.isLogin,userController.deleteWishlist)

router.get("/userDetails",auth.isLogin,userController.loadUserDetails)
router.get("/editProfile",auth.isLogin,userController.loadEditProfile)
router.post("/editProfileDetails",userController.editProfile)
router.get("/profileAddress",auth.isLogin,userController.loadAddress)
router.get("/addAddress",auth.isLogin,userController.loadAddAddress)
router.post("/addAddress",userController.addAddress)
router.get("/editAddress",auth.isLogin,userController.loadEditAddress)
router.post("/editAddress",userController.editAddress)
router.get("/deleteAddress",userController.deleteAddress)

router.get("/checkout",auth.isLogin,orderController.loadCheckout)
router.post("/placeOrder",orderController.placeOrder)
router.get("/orderSuccess",orderController.orderSuccess)
router.get('/razorpay',orderController.razorpay)
router.get("/orderDetails",auth.isLogin,orderController.myOrders)
router.get("/orderView",auth.isLogin,orderController.orderView)
router.post("/cancelOrder",orderController.orderCancel)
router.post("/returnOrder",orderController.returnOrder)

router.get("/categoryFilter",userController.categoryFilter)

router.post('/coupon',couponController.useCoupon)

router.get('/logout',auth.isLogin,userController.userLogout)


module.exports = router ;