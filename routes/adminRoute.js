const express = require("express");
const router = express();
const path = require("path")
const multer = require("multer");


const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/img'))
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+''+file.originalname)
    }
})

const upload=multer({storage:storage})

const session = require ('express-session');
const config = require ('../config/config');

router.use(session({secret:config.sessionSecret}));

router.set ('views','./views/admin');

const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended : true }));

const adminController = require ('../controllers/adminController');
const productController=require("../controllers/productController");
const categoryController=require("../controllers/categoryController")
const couponController=require("../controllers/couponController")
const auth = require ('../middleware/adminAuth');


router.get('/',auth.isLogout,adminController.loadLogin);
router.post('/login',auth.isLogout,adminController.verifyAdminLogin);

router.get('/home',auth.isLogin,adminController.loadDashbord);
router.get('/home/userData',auth.isLogin,adminController.loadUserData);


router.get('/home/product/add',auth.isLogin,productController.addProduct)
router.post('/home/product/add',upload.array('images',3), productController.verifyaddProduct)

router.route("/home/category/add").get(auth.isLogin,categoryController.categoryLoad).post(categoryController.verifyAddCategory)
router.get("/delete/category",auth.isLogin,categoryController.deleteCategory)
router.get("/home/product/list",auth.isLogin,productController.loadProductList)

router.get("/banner",auth.isLogin,adminController.bannerLoad)
router.post('/banner',upload.array('image',3),adminController.verifyAddBanner)
router.get('/banner/delete',auth.isLogin,adminController.deleteBanner)
router.get('/banner/ban',auth.isLogin,adminController.banBanner)
router.get('/banner/edit',auth.isLogin,adminController.bannerEditLoad)
router.post('/banner/edit',upload.array('images',3),auth.isLogin,adminController.bannerEdit)

router.get("/home/product/edit",auth.isLogin,upload.array('images',5),productController.loadEditProduct)
router.post("/home/product/edit",upload.array('image',5),productController.editProduct)
router.get('/product/image-remove',productController.productsimagremove)

router.get("/block_user",auth.isLogin,adminController.blockUnblockUser)

router.get("/flagProduct",auth.isLogin,productController.flagProduct)

router.get('/logout',auth.isLogin,adminController.logout);

router.get("/orderDetails",adminController.orderDetails)
router.get("/orderViews",adminController.orderView)
router.post("/cancelOrder",adminController.orderArrived )
router.post("/ordershipped",adminController.ordershipped)
router.post('/returnaccept',adminController.adminOrderReturn)

router.get("/sales",adminController.loadSales)
router.post("/sales",adminController.sales)

router.get('/coupons/create',couponController.createCoupon)
router.post('/addcoupon',couponController.validateCoupon )
router.get('/delete/coupon',couponController.deleteCoupon)

router.get('*',(req,res) => res.redirect("/admin"));


module.exports = router ;