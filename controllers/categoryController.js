const Category = require("../models/categoryModel")
const Product = require("../models/productModel")

let message
let mes

const categoryLoad = async (req, res) => {
    try {
      const categoryData = await Category.find();
      res.render("addCategory", { mes, message, category: categoryData });
      message = null;
      mes = null;
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };
  
const verifyAddCategory = async (req, res) => {
    try {
      const newCategory = req.body.category;
      const validCategory = newCategory.toUpperCase();
      const checkCategory = await Category.findOne({ name: validCategory });
  
      if (checkCategory) {
        message = "Category already exists";
        res.redirect("/admin/home/category/add");
      } else {
        const newCategory = new Category({
          name: req.body.category
        });
        const categoryData = await newCategory.save();
        if (categoryData) {
          mes = "Successfully added new category";
          res.redirect("/admin/home/category/add");
        }
      }
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };
  
const deleteCategory = async (req, res) => {
    try {
      categoryId = req.query.id;
      productData = await Product.findOne({ category: categoryId });
      if (productData) {
        message = "Category cannot delete because product exists in this category";
        res.redirect("/admin/home/category/add");
      } else {
        await Category.deleteOne({ _id: categoryId });
        mes = "Successfully deleted";
        res.redirect("/admin/home/category/add");
      }
    } catch (error) {
      res.status(500).send("Server Error");
    }
  };
  


module.exports = {
    categoryLoad,
    verifyAddCategory,
    deleteCategory
}