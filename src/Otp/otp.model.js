const mongoose = require('mongoose');


const otpSchema = new mongoose.Schema({
    otp: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    expiredAt :{
        default:Date.now,
        type:Date,
        expires:300
    }
},
    { timestamps: true }
);


module.exports = mongoose.model('otp',otpSchema);