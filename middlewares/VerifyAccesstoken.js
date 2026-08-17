require('dotenv/config');
const jwt = require("jsonwebtoken");
const customError = require("../src/helper/customError");



async function verifyAccessToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
            
        if (!authHeader?.startsWith("Bearer ")) {
            return next(new customError("Access token not found", 401));
        }
        const token = authHeader.split(" ")[1];

       

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
       
        req.user = decoded;

        
       
        next();

    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(new customError("Access Token Expired", 401));
        }

        if (error.name === "JsonWebTokenError") {
            return next(new customError("Invalid Access Token", 401));
        }

        next(error)
    }
};


module.exports = verifyAccessToken;