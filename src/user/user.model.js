

const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true

    },
    refreshToken: {
        type: String,
        default: null,
        select: false
    }
    ,

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        default: null,
        select: false
    },
    avatar: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' }
    },
    gender: {
        type: String,
        enum: ['Male',
            'Female',
            'Other',
            "Non-binary",
            "Something else",
            "Prefer not to say"
        ],

    },

    authProvider: {
        type: String,
        enum: ["LOCAL", "GOOGLE", "FACEBOOK", "PHONE"],
        default: "LOCAL"
    },

    providerId: {
        type: String,
        default: null
    },

    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    status: {
        type: String,
        enum: ['ACTIVE', "BLOCKED"],
        default: "ACTIVE"
    },
    DOB: {
        dd: {
            type: String,
            default: ''
        },
        month: {
            type: String,
            default: ''
        },
        yyyy: {
            type: String,
            default: ""
        }

    },



}, { timestamps: true });


module.exports = mongoose.model('User', userSchema)