
require('dotenv/config')
const otpSchema = require('./otp.model');
const customError = require("../helper/customError");
const userSchema = require('../user/user.model');
const sendEmail = require('../helper/emailhandler');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000
};


async function sendOTP(req, res, next) {
    try {



        const { email } = req.body;

        if (email === undefined || email === null || email.trim() === '') {
            throw new customError("Invalid email format", 400);
        }

        const emailflag = !emailRegex.test(email);
        if (emailflag) {
            throw new customError("Invalid email format", 400);
        }
        console.time("findOTP");
        const user = await userSchema.findOne({ email: email });

        if (!user) {
            throw new customError("User not found", 404);
        }

        console.time("findOTP");

        console.timeEnd("findOTP");
        const findOTP = await otpSchema.findOne({ email }).exec();
        console.timeEnd("findOTP");

        console.log('findOTp result',findOTP)

        if (findOTP) {

            await sendEmail(email, findOTP.otp);
            return res.status(201).json({
                success: true,
                message: 'otp sent Succsfully'
            })
        };


        const OTP = Math.floor(100000 + Math.random() * 900000);



        const otps = await otpSchema.create(
            { email, otp: OTP }
        );

        await otps.save();

        await sendEmail(email, OTP);


        return res.status(200).json({
            success: true,
            message: 'otp sent Succsfully'
        })


    }
    catch (error) {
        next(error)
    }
};


async function verifyOtp(req, res, next) {
    try {
        const { email, otp } = req.body;

        const findOTP = await otpSchema.findOne({ email, otp });

        if (!findOTP) {
            throw new customError("Invalid OTP", 400);
        }



        const user = await userSchema.findOne({ email });
        if (!user) {
            return next(
                new customError("User Not found", 409)
            );
        }

        const user_sent = user.toObject();
        delete user_sent.password;

        const accessToken = jwt.sign(
            {
                _id: user._id,
                role: user.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '20s'
            }
        );
        const refreshToken = jwt.sign(
            {
                _id: user._id,
                role: user.role
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        );


        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false });
        await otpSchema.deleteOne({ email, otp });

        return res.cookie("refreshToken", refreshToken, options)
            .status(200).json({
                success: true,
                message: 'OTP verified successfully',
                user: user_sent,
                accessToken
            });

    } catch (error) {
        next(error);
    }
}

module.exports = { sendOTP, verifyOtp };