const express = require("express")
const router = express.Router()
const category = require("../controllers/category")

router.get("/", category.getAllCategories)
router.put("/create", category.createCategory)
router.patch("/edit/:id", category.editCategory)
router.delete("/delete/:id", category.deleteCategory)

module.exports = router