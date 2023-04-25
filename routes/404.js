const express = require("express");
const router = express();

router.set('view engine','ejs')
router.set('views','./views/users')

router.get('*',(req,res) => res.render('404'));



module.exports = router ;