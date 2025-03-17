require("dotenv").config();
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const userSchema = require("../modals/user")
const salt = 10
const nodemailer = require("nodemailer")


const sendVerificationEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD  
        }
    });

    const verificationLink = `${process.env.CLIENT_URL}/api/user/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Please click the link below to verify your email:</p>
               <a href="${verificationLink}">${verificationLink}</a>`
    };

    await transporter.sendMail(mailOptions);
};


const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ isError: true, message: "Invalid or missing token" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        const user = await userSchema.User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({ isError: true, message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ isError: true, message: "Email is already verified" });
        }

        user.isVerified = true;
        await user.save();
        console.log(user)

        res.status(200).json({ isError: false, message: "Email verified successfully!" });

    } catch (error) {
        res.status(500).json({ isError: true, message: "Invalid or expired token" });
    }
};



const userRegistration = async (req, res) => {
    try {
        const { error, value } = userSchema.validateRegistrationForm(req.body);
        if (error) {
            return res.status(400).json({ isError: true, message: error.details[0].message.replace(/"/g, "") });
        }

        const hashedPassword = await bcrypt.hash(value.password, 10);

        const user = new userSchema.User({
            firstname: value.firstname.toLowerCase().trim(),
            lastname: value.lastname.toLowerCase().trim(),
            email: value.email,
            password: hashedPassword,
            isVerified: false
        });

        await user.save();

        const verificationToken = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN, { expiresIn: "1h" });

        await sendVerificationEmail(user.email, verificationToken);

        res.status(200).json({
            isError: false,
            message: "User Registration Successful! Please check your email to verify your account.",
            payload: user
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ isError: true, message: "Internal server error" });
    }
};



const userLogin = async (req, res) => {
    try {
        const {error, value} = userSchema.validateLoginForm(req.body)
        if(error){
            return res.status(400).json({isError: true, message: error.details[0].message.replace(/"/g, "")})
        }
        const user = await userSchema.User.findOne({email: value.email})

        if(!user){
            return res.status(400).json({ isError: true, message: "User not found!"})
        }
        const isMatch = await bcrypt.compare(value.password, user.password)

        if(!isMatch){
            return res.status(400).json({ isError: true, message: "Incorrect email or password!"})
        }

        const token = jwt.sign({_id: user._id}, process.env.ACCESS_TOKEN, {expiresIn: "24h"})
        req.user = token
        res.json({ isError: false, message: "Login Successful!", access_token: token})

    } catch (error) {
        res.json({isError: true, message: "Internal server error"})
    }
}


const updateProfile = async(req, res) => {
    try {
        const {error, value} = userSchema.validateUpdateForm(req.body)
        if(error){
            return res.status(400).json({ isError: true, message: error.details[0].message.replace(/"/g, "")})
        }

        const emailInUseByAnotherUser = await userSchema.User.findOne({ 
            email: value.email,
            _id: { $ne: new mongoose.Types.ObjectId(req.user._id) } 
        });
        
        if (emailInUseByAnotherUser) {
            return res.status(400).json({ isError: true, message: 'Email already in use!' });
        }

        const user = await userSchema.User.findOneAndUpdate({
            _id: new mongoose.Types.ObjectId(req.user._id), 
        },
        {
            firstname: value.firstname.toLowerCase().trim(),
            lastname: value.lastname.toLowerCase().trim(),
            email: value.email,
        })
        res.json({ isError: false, message: "Profile updated successfully!", payload: user})
    } catch (error) {
        res.json({isError: true, message: error.message})
    }
}

const getUserProfile = async (req, res) => {
    try {
        if(req.user){
            const user = await userSchema.User.findById(req.user._id)
            if(!user){
                return res.status(404).json({ isError: true, message: "User not found!"})
            }
            res.json({ isError: false, message: "", payload: user})
        }
    } catch (error) {
        res.json({isError: true, message: "Internal server error"})
    }
}

const createAddress = async (req, res) => {
    try {
        const {error, value} = userSchema.validateAddressForm(req.body)
        if(error){
            return res.status(400).json({ isError: true, message: error.details[0].message.replace(/"/g, "")})
        }
        const response = await userSchema.User.findById(req.user._id);

        if (!response) {
            return res.status(404).json({ isError: true, message: "User not found!" });
        }

        if (response.addresses.length == 2) {
            return res.status(400).json({ isError: true, message: "You cannot add more than two addresses." });
        }
        const user = await userSchema.User.findByIdAndUpdate(
            { _id: new mongoose.Types.ObjectId(req.user._id) },
            { $push: { addresses: value } },
            { new: true }
        )

        if (!user) {
            return res.status(404).json({ isError: true, message: "User not found!" });
        }

        res.json({ isError: false, message: "Address added successfully!", payload: user.addresses })
    } catch (error) {
        res.json({isError: true, message: "Internal server error"})
    }
}

const deleteAddress = async (req, res) => {
    try {
        const address_id = req.params.id
        if(address_id){
            const result = await userSchema.User.findOneAndUpdate(
                { _id: req.user._id },
                { $pull: { addresses: { _id: address_id } } },
                { new: true }
            );

            if (!result) {
                return res.status(404).json({ isError: true, message: "Address not found!" });
            }
            
            res.json({ isError: false, message: "Address deleted", payload: result.addresses })
        }
    } catch (error) {
        res.json({ isError: true, message: "Internal server error" })
    }
}

module.exports = {
    userRegistration,
    verifyEmail,
    userLogin,
    updateProfile,
    getUserProfile,
    createAddress,
    deleteAddress
}