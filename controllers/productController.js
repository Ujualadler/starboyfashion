
const Product = require('../models/productModel')
const Category = require("../models/categoryModel")
const sharp = require('sharp')
const fs = require("fs")

let mes
let message
let images = []

// product add

const addProduct = async (req, res) => {
  try {
    const category = await Category.find()
    res.render("addProduct", { mes, category, message })
    mes = null
    message = null
  } catch (error) {
    res.status(500).send("Server Error");
  }
}

const verifyaddProduct = async (req, res) => {
  try {
    const verifyName = await Product.findOne({ name: req.body.name })
    if (verifyName) {
      message = "Product already exists"
      res.redirect("/admin/home/product/add")
    } else if (req.body.name === '' || req.body.category === '' || req.body.price === '' || req.body.quantity === '' || req.body.description === '' || req.body.brand === '' || req.body.size === '' || !req.files || req.files.length < 3) {
      message = "Please fill all the fields and upload at least 3 photos"
      res.redirect("/admin/home/product/add")
    } else {
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      for (let i = 0; i < req.files.length; i++) {
        const extension = req.files[i].filename.split('.').pop().toLowerCase();
        if (validExtensions.includes(extension)) {
          if(req.files.length == i ) break;
          images[i] = req.files[i].filename;
        }
      }

        const refCategory = await Category.findOne({ name: req.body.category })

        const product = new Product({
          name: req.body.name,
          price: req.body.price,
          quantity: req.body.quantity,
          category: refCategory._id,
          description: req.body.description,
          brand: req.body.brand,
          size: req.body.size,
          image:images,
        })

        const productData = await product.save()
        if (productData) {
          mes = "Product added successfully"
          res.redirect("/admin/home/product/add")
        }
      }
    
  }
  catch (error) {
    res.status(500).send("Server Error");
  }
}

// product list

const loadProductList = async (req, res) => {
  try {
    const productData = await Product.find().populate('category')
    res.render("productList", ({ products: productData, mes }))
    mes = null
  } catch (error) {
    res.status(500).send("Server Error");
  }
}

// editProduct

const loadEditProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    const productData = await Product.findById({ _id: productId }).populate('category');
    const refCategory = await Category.find();

    if (productData) {
      res.render('editProduct', { product: productData, category: refCategory, mes, message });
      mes = null;
      message = null;
    } else {
      res.redirect('/admin/home/products/list');
    }
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

const editProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    const { name, brand, description, category, price, quantity, size } = req.body;

    const categoryRef = await Category.findOne({ name: category });
    const productImg = await Product.findOne({ _id: productId }).populate('category');
    let images = [];

    if (req.files.length > 0) {
      for (let i = 0; i < 5 - productImg.image.length; i++) {
        if (req.files.length == i) break;
        images[i] = req.files[i].filename;
      }
    }

    if (images.length === 0 && productImg.image.length === 0) {
      message = 'No image available';
      return res.redirect(`/admin/home/product/edit?id=${productImg.id}`);
    }

    productImg.name = name;
    productImg.brand = brand;
    productImg.description = description;
    productImg.category = categoryRef._id;
    productImg.price = price;
    productImg.quantity = quantity;
    productImg.size = size;
    productImg.image = productImg.image.concat(images);
    const editProductData = await productImg.save();

    if (editProductData) {
      mes = 'Edited successfully';
      res.redirect('/admin/home/product/list');
    }
  } catch (error) {
    res.status(500).send('Server Error');
  }
};



const productsimagremove = async (req, res) => {
  try {
    const file = req.query.file
    const productId = req.query.productId
    await Product.updateOne({ _id: productId }, { $pull: { image: file } })
    res.send({ success: true, janu: 'dddd' })
  } catch (error) {
    res.status(500).send('Server Error');
  }
}


const flagProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    const productDoc = await Product.findById({ _id: productId });
    if (productDoc.is_flag == 0) {
      await Product.updateOne({ _id: productId }, { $set: { is_flag: 1 } });
      res.redirect('/admin/home/product/list');
    } else {
      await Product.updateOne({ _id: productId }, { $set: { is_flag: 0 } });
      res.redirect('/admin/home/product/list');
    }
  } catch (error) {
    res.status(500).send('Server Error');
  }
};






module.exports = {
  addProduct,
  verifyaddProduct,
  loadProductList,
  loadEditProduct,
  editProduct,
  productsimagremove,
  flagProduct,

}