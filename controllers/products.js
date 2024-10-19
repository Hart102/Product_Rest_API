require("dotenv").config()
const mongoose = require("mongoose")
const productSchema = require("../modals/product")
const { FileUploader, storage } = require("../config/appWrite")


const createProduct = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ isError: true, message: "No image uploaded!" });
        }
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        for (const file of req.files) {
            if (!allowedImageTypes.includes(file.mimetype)) {
                return res.status(400).json({ isError: true, message: "Invalid image type! Only JPEG, PNG, and JPG are allowed." });
            }
        }
        const uploadedFiles = await FileUploader(req.files)

        if (uploadedFiles.length > 0) {
            const {name, price, description, quantity, status, category_id} = req.body
            const product = new productSchema.product({
                name,
                price,
                description,
                quantity,
                status,
                images: uploadedFiles,
                user_id: req.user._id,
                category_id
            })
            await product.save()
            if(product){
                res.json({ isError: false, message: "Product created successfully", payload: product })
            }
        }
    } catch (error) {
        res.json({isError: true, message: error.message})
    }
}


const editProduct = async (req, res) => {
    try {
        const { id } = req.params
        const { name, price, description, quantity, status, category_id } = req.body

        if(req.files.length > 0){
            const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

            for (const file of req.files) {
                if (!allowedImageTypes.includes(file.mimetype)) {
                    return res.status(400).json({ isError: true, message: "Invalid image type! Only JPEG, PNG, and JPG are allowed." });
                }
            }
            // const images = JSON.parse(req.body.images)
            // const replacedImageIds = JSON.parse(req.body.replacedImageIds)

            const images = req.body.images
            const replacedImageIds = req.body.replacedImageIds

            let deleteCount = 0
            for(const fileId of replacedImageIds){
                //Delete old files
                deleteCount++
                await storage.deleteFile(process.env.APPWRITE_BUCKET_ID, fileId);

                //upload and replace old images
                if(deleteCount == replacedImageIds.length){
                    const uploadedFiles = await FileUploader(req.files)

                    const replaceOldImages = () => {
                        for(let index = 0; index < images.length; index++){
                            if(images.includes(replacedImageIds[index])){
                                images[images.indexOf(replacedImageIds[index])] = uploadedFiles[index]
                            }
                        }
                        return images
                    }
                    if(replaceOldImages()){
                        const product = await productSchema.product.findOneAndUpdate(new mongoose.Types.ObjectId(id),
                        {
                            name,
                            price,
                            description,
                            quantity,
                            status,
                            images: replaceOldImages(),
                            category_id
                        }, { new: true })

                        if(product){
                            res.json({ isError: false, message: "Product updated successfully", payload: product })
                        }
                    }
                }
            }
        }else{
            //update with images
            const product = await productSchema.product.findOneAndUpdate(new mongoose.Types.ObjectId(id),
            {
                name,
                price,
                description,
                quantity,
                status,
                category_id
            }, { new: true })

            if(product){
                res.json({ isError: false, message: "Product updated successfully", payload: product })
            }
        }
    } catch (error) {
        res.json({isError: true, message: error.message})
    }
}

module.exports = { createProduct, editProduct }
