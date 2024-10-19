const mongoose = require("mongoose")
const  categorySchema = require("../modals/category")


const createCategory = async (req, res) => {
    try {
        const { name, status } = req.body
        const category = new categorySchema.category({
            name,
            status
        })
        await category.save()
        if(category){
            res.json({ isError: false, message: "Category created successfully", payload: category })
        }
    } catch (error) {
        res.json({isError: true, message: "Internal server error"})
    }
}

const editCategory = async (req, res) => {
    try {
        const { id } = req.params
        const { name, status } = req.body

        const category = await categorySchema.category.findOneAndUpdate( 
            new mongoose.Types.ObjectId(id), 
            { name, status }, { new: true }
        )

        if(category){
            res.json({ isError: false, message: "Category updated successfully", payload: category })
        }
    } catch (error) {
        res.json({isError: true, message: "Internal server error"})
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params
        const category = await categorySchema.category.findOneAndDelete(
            new mongoose.Types.ObjectId(id)
        )

        if(category){
            res.json({ isError: false, message: "Category deleted successfully" })
        }
    } catch (error) {
        res.json({isError: true, message: "Internal server error"})
    }
}

const getAllCategories = async (req, res) => {}

module.exports = { createCategory, editCategory, deleteCategory, getAllCategories }