
const Order = require("../models/orderModel")
const Product = require('../models/productModel')
const User = require('../models/userModel')
const Razorpay = require("razorpay");
const Coupon = require("../models/couponModel")

const instance = new Razorpay({
    key_id: "rzp_test_XAmcvH8COqaYws",
    key_secret: "L2bo4e5kg9SZPoZlvm5kH2pR",
});


let message


const loadCheckout = async (req, res) => {
    try {
      const id = req.query.id;
      const userId = req.session.user_Id;
      let order = req.session.order;
      const coupons = await Coupon.find({ ref: "1" });
      const cartData = await User.findOne({ _id: userId }).populate('cart.product');
      if (cartData.cart[0] !== undefined) {
        const userdetails = await User.findOne({ _id: userId });
        const address = userdetails.address.filter((value) => {
          return value._id == id;
        });
        res.render('checkout', { cartData, session: req.session.user_Id, address, userdetails, order, coupons, message });
        message = null;
      } else {
        res.redirect("/shop");
      }
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };
  

const placeOrder = async (req, res) => {
    try {
      const userId = req.session.user_Id
      const userData = await User.findOne({ _id: userId })
      let total = userData.discountedTotal
      const grand = req.query.grand
  
      if (total == null || total == 0) {
        total = grand
      }
      userData.discountedTotal = 0
      await userData.save()
  
      const orderDate = new Date()
      const orderArrivingDate = new Date()
      orderArrivingDate.setDate(orderDate.getDate() + 7)
  
      const payment = req.body
      const { name, house, phone, email, town, district, state, pincode } = req.body
      const paymentmethod = req.body.paymentOrder
  
      if (payment.paymentOrder == 'COD') {
        const cartData = await User.findOne({ _id: userId }).populate('cart.product')
  
        const orderItem = cartData.cart.map((value) => {
          return {
            product: value.product._id,
            price: value.product.price,
            quantity: value.quantity,
            total: value.total,
            date: orderDate,
            arrivingDate: orderArrivingDate
          }
        })
  
        const grandTot = cartData.cart.map((value) => {
          return value.total
        }).reduce((a, b) => {
          return a = a + b
        })
  
        const order = await Order({
          subTotal: grand,
          user: userId,
          order: orderItem,
          grandTotal: total,
          address: [{
            name: name,
            house: house,
            mobileNo: phone,
            email: email,
            townCity: town,
            district: district,
            state: state,
            pincode: pincode,
          }],
          paymentMethod: paymentmethod,
        })
  
        const saveOrder = await order.save()
  
        const orderData = await Order.findOne({ _id: saveOrder._id }).populate('order.product')
        cartData.cart = [];
        const Ucart = await cartData.save()
  
        orderItem.forEach(async (element) => {
          const product = await Product.findById({ _id: element.product })
          const inventoryUpdate = await Product.updateOne({ _id: element.product }, { $set: { quantity: Number(product.quantity) - Number(element.quantity) } })
        })
  
        res.redirect(`/orderSuccess?id=${orderData._id}`)
      } else if (payment.paymentOrder == 'razorpay') {
        const cartData = await User.findOne({ _id: userId }).populate('cart.product')
  
        const orderItem = cartData.cart.map((value) => {
          return {
            product: value.product._id,
            price: value.product.price,
            quantity: value.quantity,
            total: value.total,
            date: orderDate,
            arrivingDate: orderArrivingDate
          }
        })
  
        const grandTot = cartData.cart.map((value) => {
          return value.total
        }).reduce((a, b) => {
          return a = a + b
        })
  
        const options = {
          amount: total * 100,
          currency: "INR",
          receipt: "order_" + orderDate.getTime(),
        }
        
        
        const order = await instance.orders.create(options)
            req.session.order = order
            req.session.orderDatas = {
                amount: total * 100,
                currency: "INR",
                orderId: order.id,
                address: {
                    name: name,
                    house: house,
                    mobileNo: phone,
                    email: email,
                    townCity: town,
                    district: district,
                    state: state,
                    pincode: pincode
                },
                order: orderItem,
                grandTotal: total,
                subTotal: grandTot,
                paymentMethod: paymentmethod
            };

            res.redirect("/checkout?orderId=" + order.id)

        } else if (payment.paymentOrder == 'wallet') {

            const cartData = await User.findOne({ _id: userId }).populate('cart.product')

            const orderItem = cartData.cart.map((value) => {
                return {
                    product: value.product._id,
                    price: value.product.price,
                    quantity: value.quantity,
                    total: value.total,
                    date: orderDate,
                    arrivingDate: orderArrivingDate
                }
            })
            const grandTot = cartData.cart.map((value) => {
                return value.total
            }).reduce((a, b) => {
                return a = a + b
            })
            const order = await Order({
                subTotal: grand,
                user: userId,
                order: orderItem,
                grandTotal: total,
                address: [{
                    name: name,
                    house: house,
                    mobileNo: phone,
                    email: email,
                    townCity: town,
                    district: district,
                    state: state,
                    pincode: pincode,

                }],
                paymentMethod: paymentmethod,
            })
            const saveOrder = await order.save()

            const wallet = cartData.wallet - saveOrder.grandTotal
            const walletRemaining = await User.updateOne({ wallet: wallet })

            const orderData = await Order.findOne({ _id: saveOrder._id }).populate('order.product')
            cartData.cart = [];
            const Ucart = await cartData.save()
            orderItem.forEach(async (element) => {
                const product = await Product.findById({ _id: element.product })
                const inventoryUpdate = await Product.updateOne({ _id: element.product }, { $set: { quantity: Number(product.quantity) - Number(element.quantity) } })
            })
            res.redirect(`/orderSuccess?id=${orderData._id}`)
        } else {
            res.redirect("/checkout")
            message = "You have to choose a payment method"
        }
    } catch (error) {
        res.status(500).send("Server Error");
    }
}

const razorpay = async (req, res) => {
    const orderDatas = req.session.orderDatas
    const userId = req.session.user_Id
    const order = new Order({
        user: userId,
        order: orderDatas.order,
        paymentId: orderDatas.orderId,
        grandTotal: orderDatas.grandTotal,
        subTotal: orderDatas.subTotal,
        address: [orderDatas.address],
        paymentMethod: orderDatas.paymentMethod,

    });
    const save = await order.save();
    const orderData = await Order.findOne({ _id: save._id }).populate('order.product')
    const cartData = await User.findOne({ _id: userId }).populate('cart.product')
    cartData.cart = [];
    const Ucart = await cartData.save()

    orderDatas.order.forEach(async (element) => {
        const product = await Product.findById({ _id: element.product })
        const inventoryUpdate = await Product.updateOne({ _id: element.product }, { $set: { quantity: Number(product.quantity) - Number(element.quantity) } })
    })
    res.json({ orderData })
}

const orderSuccess = async (req, res) => {
    try {
        req.session.order = null
        const orderId = req.query.id
        const orderData = await Order.findOne({ _id: orderId }).populate("order.product")
        res.render("orderSuccess", { orderData, session: req.session.user_Id })
    } catch (error) {
        res.status(500).send("Server Error");
    }
}

const myOrders = async (req, res) => {
    try {
      const userId = req.session.user_Id;
      const user = await User.findById({ _id: userId });
      const orderData = await Order.find({ user: user._id })
        .sort({ _id: -1 })
        .populate("order.product");
      res.render("myOrders", { orderData, session: req.session.user_Id });
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };
  
const orderView = async (req, res) => {
    try {
      const orderId = req.query.id;
      const orderData = await Order.findById({ _id: orderId }).populate(
        "order.product"
      );
      res.render("orderView", { orderData, session: req.session.user_Id });
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };
  
const orderCancel = async (req, res) => {
    try {
      const id = req.query.id;
      const Data = await Order.findOne({ _id: id });
      const ids = Data.order.map((value) => {
        return value._id;
      });
      ids.forEach(async (element) => {
        await Order.updateOne(
          { _id: id, "order._id": element },
          { $set: { "order.$.status": "OrderCancelled" } }
        );
      });
      Data.order.forEach(async (element) => {
        const product = await Product.findByIdAndUpdate({ _id: element.product });
        const inventoryUpdate = await Product.updateOne(
          { _id: element.product },
          { $inc: { quantity: element.quantity } }
        );
      });
      const cancelProduct = await Order.findOne({});
      const data = Data.order.map((value) => {
        return value.status;
      });
      const responseData = {
        success: true,
        status: "OrderCancelled",
      };
      res.json(responseData);
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };

  
const returnOrder = async (req, res) => {
    try {
        const id = req.query.id;
        const userId = req.session.user_Id;
        const order = await Order.findOne({ _id: id });
        const gTotal = order.grandTotal;
        const userData = await User.findOne({ _id: userId });
        const wallet = userData.wallet;
        const walletData = wallet + gTotal;
        const orderIds = order.order.map((value) => {
            return value._id;
        });
        const deliveredDates = order.order.map((value) => {
            return value.deliveredDate;
        });
        const currentDate = Date.now();

        orderIds.forEach(async (element, index) => {
            const deliveredDate = deliveredDates[index];
            const timeDiff = currentDate - deliveredDate;
            const daysDiff = timeDiff / (24 * 60 * 60 * 1000);

            if (daysDiff > 5) {
                await Order.updateOne({ _id: id, 'order._id': element }, { $set: { 'order.$.status': 'ReturnPeriodExceeded' } });
            } else {
                await Order.updateOne({ _id: id, 'order._id': element }, { $set: { 'order.$.status': 'ReturnPending' } });

                // order.order.forEach(async (element) => {
                //     const product = await Product.findByIdAndUpdate({ _id: element.product });
                //     const inventoryUpdate = await Product.updateOne({ _id: element.product }, { $inc: { quantity: element.quantity } });
                // });

                // if (userData.wallet) {
                //     const walletNew = await User.updateOne({ _id: userId }, { $set: { wallet: walletData } });
                // } else {
                //     const walletNew = await User.updateOne({ _id: userId }, { $set: { wallet: gTotal } });
                // }
            }
        });

        const responseData = {
            success: true,
            status: "ReturnPending"
        };
        res.json(responseData);
    } catch (error) {
        res.status(500).send("Server Error");
    }
};  




module.exports={
    loadCheckout,
    placeOrder,
    razorpay,
    myOrders,
    orderView,
    orderSuccess,
    orderCancel,
    returnOrder
}