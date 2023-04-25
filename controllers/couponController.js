
const orderschema = require("../models/orderModel")
const couponSchema = require("../models/couponModel")
const user = require("../models/userModel")

// ======================================admin side=====================================================//


let message
let mes = null

const createCoupon = async (req, res) => {
  try {
    const couponDetails = await couponSchema.find({});
    res.render('createCoupon', { couponDetails, message, mes });
    message = null;
    mes = null;
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

// =====Add coupon======
const validateCoupon = async (req, res) => {
  try {
    const { couponId, expiryDate, minAmount, maxAmount, discount, maxdiscount, couponName } = req.body;
    const couponDetails = await couponSchema.findOne({ couponName: couponName });
    if (couponDetails) {
      message = 'Coupon already exists';
      res.redirect('/admin/createCoupon');
    } else {
      const couponData = new couponSchema({
        couponName: couponName,
        couponId: couponId,
        expiryDate: expiryDate,
        maxAmount: maxAmount,
        minAmount: minAmount,
        discount: discount,
        max_discount: maxdiscount,
        status: 'Active'
      });
      const details = await couponData.save();
      mes = 'Coupon added successfully';
      res.redirect('/admin/coupons/create');
    }
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

// ====Delete Coupon======
const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.query.id;
    await couponSchema.deleteOne({ _id: couponId });
    mes = 'Coupon successfully deleted';
    res.redirect('/admin/coupons/create');
  } catch (error) {
    res.status(500).send("Server Error");
  }
};




//////////////////////////////////////////////////// user side///////////////////////////////////////////


const useCoupon = async (req, res) => {
  try {
    const couponId = req.body.couponId;
    const subTotal = req.body.subtotal;
    const couponData = await couponSchema.findOne({ couponId: couponId });
    const userid = req.session.user_Id;

    if (couponData) {
      const min = couponData.minAmount;
      const max = couponData.maxAmount;
      const Avg = (min + max) / 2;
      let discount = couponData.discount;
      const maxDiscount = couponData.max_discount;
      let discountSubtotal;
      let messa;
      const checkUser = await couponSchema.findOne({ ref: userid, couponId: couponId });
      
      if (checkUser) {
        let wrong = 1;
        discountSubtotal = subTotal;
        discount = (discount - discount);
        messa = 'Coupon already used';
        res.status(200).send({ messa, wrong, discountSubtotal, discount });
      } else {
        const couponDate = new Date(couponData.expiryDate)
        const currentDate = new Date()

        if (currentDate < couponDate) {
          if (min <= subTotal) {
            if (subTotal <= Avg) {
              discountSubtotal = (subTotal * (1 - (couponData.discount) / 100)).toFixed(0);
              let userSchema = await user.findByIdAndUpdate(userid, { discountedTotal: discountSubtotal });
              messa = 'Coupon added';
              res.status(200).send({ discountSubtotal, discount, messa });
            } else {
              discountSubtotal = (subTotal * (1 - (couponData.max_discount) / 100)).toFixed(0);
              let userSchema = await user.findByIdAndUpdate(userid, { discountedTotal: discountSubtotal });
              messa = 'Coupon added';
              res.status(200).send({ discountSubtotal, maxDiscount, messa });
            }
          } else {
            messa = 'Minmum Amount for this coupon is ' + couponData.minAmount;
            discountSubtotal = subTotal;
            discount = "0"
            res.status(200).send({ messa, discountSubtotal, discount });
          }
        } else {
          const updateCoupon = await couponSchema.updateOne({ couponId: couponId }, { $set: { status: 'Expired' } })
          messa = 'Coupon Expired';
          discountSubtotal = subTotal;
          discount = '0'
          res.status(200).send({ messa, discountSubtotal, discount });
        }
      }
      const usedCoupon = await couponSchema.findOneAndUpdate({ couponId: couponId }, { $set: { ref: userid } });
    } else {
      res.status(404).send({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Internal server error' });
  }
};


module.exports = {
  createCoupon,
  validateCoupon,
  deleteCoupon,
  useCoupon
}