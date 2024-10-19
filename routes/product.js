const express = require("express")
const router = express.Router()
const Jwt = require("../config/jwt")
const { FileReader } = require("../config/appWrite")
const product = require("../controllers/products")


router.put("/create", Jwt, FileReader, product.createProduct)
router.patch("/edit/:id", FileReader, product.editProduct)


module.exports = router