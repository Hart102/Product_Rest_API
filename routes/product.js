const express = require("express")
const router = express.Router()
const Jwt = require("../config/jwt")
const { FileReader } = require("../config/appWrite")
const product = require("../controllers/products")


router.get("/", product.getAllProducts)
router.get("/:id", product.getProductById)
router.get("/category/:name", product.getProductsByCategory)
router.put("/create", Jwt, FileReader, product.createProduct)
router.patch("/edit/:id", FileReader, product.editProduct)
router.delete("/delete/:id", product.deleteProduct)


module.exports = router