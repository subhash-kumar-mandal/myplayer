require('dotenv/config');
const userSchema = require('../src/user/user.model');
const jwt = require('jsonwebtoken');
const customError = require('../src/helper/customError');


const options = {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
};


async function Verify_JWT_TOKEN(req, res, next) {

    try {


        const refresh_Token = req.cookies.refreshToken;

        if (!refresh_Token) return next(new customError('Unauthentication', 401));


        const flagVerify = jwt.verify(refresh_Token, process.env.REFRESH_TOKEN_SECRET);




        const user = await userSchema.findById(flagVerify._id).select('+refreshToken');
        if (!user) {
            return res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: false,
                sameSite: "strict"
            }).status(401).json({
                message: "Unauthorized ",

            })
        };

        //  concurecy problem 
        // if (user.refreshToken !== refresh_Token) {


        //     return res.clearCookie("refreshToken", {
        //         httpOnly: true,
        //         secure: false,
        //         sameSite: "strict"
        //     }).status(401).json({
        //         message: "Unauthorized not same ",

        //     })
        // }


        const newrefreshToken = jwt.sign(
            {
                _id: flagVerify._id,
                role: flagVerify.role
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        );

        const newaccessToken = jwt.sign(
            {
                _id: flagVerify._id,
                role: flagVerify.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        );

        // user.refreshToken = newrefreshToken;
        // await user.save()

        res.cookie("refreshToken", user.refreshToken, options).status(200).json({
            success: true,
            message: "genreate refresh token",
            accessToken: newaccessToken
        })

    } catch (err) {

        if (err.name === "TokenExpiredError") {
               return res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: false,
                sameSite: "strict"
            }).status(401).json({
                success:false,
                message: "Refresh Token Expired",
            })
            
        }

        if (err.name === "JsonWebTokenError") {
               return res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: false,
                sameSite: "strict"
            }).status(401).json({
                success:false,
                message: "Invalid Refresh Token",
            })
        }

        next(err)
    }

};



module.exports = Verify_JWT_TOKEN;
