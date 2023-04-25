const Admin = require('../models/adminModel');
const User = require('../models/userModel')
const Banner = require("../models/bannerModel")
const Order = require("../models/orderModel")
const Product = require("../models/productModel")
const bcrypt = require('bcrypt');


let mes;
let message

// ADMIN LOGIN
const loadLogin = (req, res) => {
    try {
      res.render('aLogin', { mes })
      mes = null
    } catch (error) {
      res.status(500).send("Server Error");
    }
  }
  
const verifyAdminLogin = async (req, res) => {
    try {
      const Aemail = req.body.email
      const Apassword = req.body.password
  
      if (req.body.email == '' && req.body.password == '') {
        mes = 'Enter email and password'
        res.redirect('/admin')
      } else if (req.body.email == '') {
        mes = 'Enter email'
        res.redirect('/admin')
      } else if (req.body.password == '') {
        mes = 'Enter password'
        res.redirect('/admin')
      } else {
        const adminData = await Admin.findOne({ email: Aemail })
  
        if (adminData) {
          const passwordMatch = await bcrypt.compare(Apassword, adminData.password)
  
          if (passwordMatch) {
            req.session.admin_Id = adminData._id
            res.redirect('/admin/home')
          } else {
            mes = "Password is incorrect"
            res.redirect('/admin')
          }
        } else {
          mes = "Email is incorrect"
          res.redirect('/admin')
        }
      }
    } catch (err) {
      res.status(500).send("Server Error")
    }
  }
  

const loadDashbord = async (req, res) => {
    try {
      const adminData = await Admin.findOne({ _id: req.session.admin_Id });
      const userData = await User.find();
      const usersLength = userData.length;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
  
      const yearAgo = new Date(today);
      yearAgo.setFullYear(today.getFullYear() - 1);
  
      const dailySalesReport = await Order.aggregate([
        {
          $match: {
            "order.status": "OrderDelivered",
            "order.deliveredDate": {
              $gte: today,
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
        { $unwind: "$order" },
        {
          $match: {
            "order.status": "OrderDelivered",
            "order.deliveredDate": {
              $gte: today,
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$order.deliveredDate" } },
            totalSales: { $sum: "$grandTotal" },
            totalItemsSold: { $sum: "$order.quantity" },
          },
        },
        { $sort: { _id: 1 } },
      ]);
  
      const weeklySalesReport = await Order.aggregate([
        {
          $match: {
            "order.status": "OrderDelivered",
            "order.deliveredDate": {
              $gte: weekAgo,
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
        { $unwind: "$order" },
        {
          $match: {
            "order.status": "OrderDelivered",
            "order.deliveredDate": {
              $gte: weekAgo,
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$order.deliveredDate" } },
            totalSales: { $sum: "$grandTotal" },
            totalItemsSold: { $sum: "$order.quantity" },
          },
        },
        { $sort: { _id: 1 } },
      ]);
  
      const yearlySalesReport = await Order.aggregate([
        {
          $match: {
            "order.status": "OrderDelivered",
            "order.deliveredDate": {
              $gte: yearAgo,
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
        { $unwind: "$order" },
        {
          $match: {
            "order.status": "OrderDelivered",
            "order.deliveredDate": {
              $gte: yearAgo,
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
            {
             $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$order.deliveredDate" } },
                    totalSales: { $sum: "$grandTotal" },
                    totalItemsSold: { $sum: "$order.quantity" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        ////////////////////////////////// linechart//////////////////////////////////////////////////////

        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

        const monthlyStart = new Date(currentYear, currentMonth, 1).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const monthlyEnd = new Date(currentYear, currentMonth, daysInMonth);

        const monthlySalesData = await Order.find({
            'order.deliveredDate': {
                $gte: monthlyStart,
                $lte: monthlyEnd,
            },
        }).populate('order.product')

        const dailySalesDetails = []
        for (let i = 2; i <= daysInMonth + 1; i++) {
            const date = new Date(currentYear, currentMonth, i)
            const salesOfDay = monthlySalesData.filter((order) => {
                return new Date(order.order[0].deliveredDate).toDateString() === date.toDateString()
            })
            const totalSalesOfDay = salesOfDay.reduce((total, order) => {
                return total + order.grandTotal;
            }, 0);
            let productCountOfDay = 0;
            salesOfDay.forEach((order) => {
                productCountOfDay += order.order[0].product.quantity;
            });

            dailySalesDetails.push({ date: date, totalSales: totalSalesOfDay, totalItemsSold: productCountOfDay });
        }


        const order = await Order.aggregate([
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    codCount: {
                        $sum: {
                            $cond: { if: { $eq: ["$_id", "COD"] }, then: "$count", else: 0 }
                        }
                    },
                    razorpayCount: {
                        $sum: {
                            $cond: { if: { $eq: ["$_id", "razorpay"] }, then: "$count", else: 0 }
                        }
                    },
                    walletCount: {
                        $sum: {
                            $cond: { if: { $eq: ["$_id", "wallet"] }, then: "$count", else: 0 }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    codCount: 1,
                    razorpayCount: 1,
                    walletCount: 1
                }
            }
        ]);

        res.render("ahome", {
            dailySalesReport,
            weeklySalesReport,
            yearlySalesReport,
            message,
            usersLength,
            dailySalesDetails,
            order
        }),
            (message = null);

    } catch (error) {
        res.status(500).send("Server Error");
    }
}



const loadUserData = async (req, res) => {
    try {
      let search = '';
      if (req.query.search) {
        search = req.query.search;
      }
      const userData = await User.find({
        $or: [
          { name: { $regex: '.*' + search + '.*' } },
          { email: { $regex: '.*' + search + '.*' } }
        ]
      });
      res.render('userData', { users: userData });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };
  
  const blockUnblockUser = async (req, res) => {
    try {
      const userId = req.query.id;
      const userDoc = await User.findById({ _id: userId });
      if (userDoc.is_block === 0) {
        await User.updateOne({ _id: userId }, { $set: { is_block: 1 } });
        req.session.user_Id = null;
        res.redirect('/admin/home/userData');
      } else {
        await User.updateOne({ _id: userId }, { $set: { is_block: 0 } });
        res.redirect('/admin/home/userData');
      }
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };
  
  const bannerLoad = async (req, res) => {
    try {
      const banner = await Banner.find();
      res.render('banner', { mes, message, banner });
      message = null;
      mes = null;
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };
  
  const bannerEditLoad = async (req, res) => {
    try {
      const bannerId = req.query.id;
      const bannerData = await Banner.findOne({ _id: bannerId });
      res.render('bannerEdit', { bannerData, mes });
      mes = null;
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };
  
  const verifyAddBanner = async (req, res) => {
    try {
      const images = [];
      for (let i = 0; i < req.files.length; i++) {
        images[i] = req.files[i].filename;
      }
      const newBanner = await Banner({
        title: req.body.title,
        image: images,
        description: req.body.description
      }).save();
      if (newBanner) {
        mes = 'Successfully added new banner';
        res.redirect('/admin/banner');
      }
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };
  
  const bannerEdit = async (req, res) => {
    try {
      const bannerId = req.query.id;
      const bannerdata = await Banner.findOne({ _id: bannerId });
      console.log('hai');
      let images = [];
      if (req.files.length > 0) {
        for (i = 0; i < req.files.length; i++) {
          images[i] = req.files[i].filename;
        }
      } else {
        images = bannerdata.image;
      }
      const bannerData = await Banner.updateOne(
        { _id: bannerId },
        {
          $set: {
            title: req.body.title,
            description: req.body.description,
            image: images
          }
        }
      );
      console.log(bannerData);
      if (bannerData) {
        mes = 'Banner successfully updated';
        res.redirect(`/admin/banner?id=${bannerdata._id}`);
      }
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };

  const banBanner=async(req,res)=>{
    try {
      const bannerId = req.query.id;
        const bannerDoc = await Banner.findById({ _id: bannerId });
        if (bannerDoc.is_ban === 0) {
          await Banner.updateOne({ _id: bannerId }, { $set: { is_ban: 1 } });
          res.redirect('/admin/banner');
        } else {
          await Banner.updateOne({ _id: bannerId }, { $set: { is_ban: 0 } });
          res.redirect('/admin/banner');
        }
      
    } catch (error) {
      res.status(500).send('Server Error');
    }
  } 
  
  const deleteBanner = async (req, res) => {
    try {
      const bannerId = req.query.id;
      const banner = await Banner.find();
      const deleteBannner = await Banner.deleteOne({ _id: bannerId });
      message = 'Successfully deleted';
      res.redirect("/admin/banner");
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };
  
  const orderDetails = async (req, res) => {
    try {
      let currentPage = 1;
      if (req.query.currentpage) {
        currentPage = req.query.currentpage;
      }
      const limit = 10;
      offset = (currentPage - 1) * limit;
      const orderdetails = await Order.find({});
      const orderData = await Order.find({})
        .sort({ _id: -1 })
        .skip(offset)
        .limit(limit);
      const totalOrders = orderdetails.length;
      const totalPage = Math.ceil(totalOrders / limit);
  
      res.render("orderDetails", { orderData, currentPage, totalPage });
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
      res.render("adminOrderViews", { orderData });
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };
  

  const orderArrived = async (req, res) => {
    try {
      const id = req.query.id;
      const Data = await Order.findOne({ _id: id });
      const ids = Data.order.map((value) => {
        return value._id;
      });
  
      const deliveredDate = new Date();
  
      ids.forEach(async (element) => {
        await Order.updateOne(
          { _id: id, 'order._id': element },
          { $set: { 'order.$.status': 'OrderDelivered', 'order.$.deliveredDate': deliveredDate } }
        );
      });
  
      const data = Data.order.map((value) => {
        return value.status;
      });
  
      const responseData = {
        success: true,
        status: 'OrderDelivered',
      };
  
      res.json(responseData);
    } catch (error) {
      console.log(error);
    }
  };
  
  const ordershipped = async (req, res) => {
    try {
      const id = req.query.id;
      const Data = await Order.findOne({ _id: id });
      const ids = Data.order.map((value) => {
        return value._id;
      });
  
      ids.forEach(async (element) => {
        await Order.updateOne({ _id: id, 'order._id': element }, { $set: { 'order.$.status': 'OrderShipped' } });
      });
  
      const data = Data.order.map((value) => {
        return value.status;
      });
  
      const responseData = {
        success: true,
        status: 'OrderShipped',
      };
  
      res.json(responseData);
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };

  const adminOrderReturn = async (req, res) => {
    try {

        const id = req.query.id
        const userid=req.session.user_Id
        const Data = await Order.findOne({ _id: id })
        const userdata=await User.findOne({_id:userid})
        const ids = Data.order.map((value) => {
            return value._id
        })

        ids.forEach(async (element) => {
            await Order.updateOne({ _id: id, 'order._id': element }, { $set: { 'order.$.status': 'Returned' } })
        })
        const responseData = {
            success: true,
            status: 'Returned'
        };
        res.json(responseData);
        if (userdata.wallet) {
            const updatewallet = await User.updateOne({ _id: userid }, { $set: { wallet: userdata.wallet + Data.grandTotal } })
        } else {
            const wallet = await User.updateOne({ _id: userid }, { $set: { wallet: Data.grandTotal } })

        }

        Data.order.forEach(async (element) => {
            const product = await Product.findByIdAndUpdate({ _id: element.product })
            const inventoryUpdate = await Product.updateOne({ _id: element.product }, { $inc: { quantity: element.quantity } })
        });


    }

    catch (error) {
        console.log(error)

    }
}
  
  const loadSales = async (req, res) => {
    try {
      const filterData = await Order.find({ order: { $elemMatch: { status: 'OrderDelivered' } } }).populate('order.product');
      res.render('sales', { filterData });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };
  
  const sales = async (req, res) => {
    try {
      const { first, last } = req.body;
      const filterData = await Order.find({
        'order.status': 'OrderDelivered',
        'order.date': { $gte: first, $lte: last },
      }).populate('order.product');
      res.render('sales', { filterData });
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };
  
  const logout = (req, res) => {
    try {
      req.session.admin_Id = null;
      res.redirect('/admin');
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };
  

module.exports = {
    loadLogin,
    verifyAdminLogin,
    loadDashbord,
    loadUserData,
    blockUnblockUser,
    bannerLoad,
    deleteBanner,
    verifyAddBanner,
    bannerEditLoad,
    bannerEdit,
    banBanner,
    orderDetails,
    orderView,
    orderArrived,
    ordershipped,
    adminOrderReturn,
    loadSales,
    sales,
    logout
}