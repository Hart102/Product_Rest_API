const express = require("express")
const router = express.Router()
const cart = require("../controllers/cart")
const Jwt = require("../config/jwt")


router.put("/add", Jwt, cart.addtoCart)
router.delete("/remove/:id", Jwt, cart.removeCartItem)


module.exports = router