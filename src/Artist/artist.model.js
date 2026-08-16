
const mongoose = require('mongoose')


const ArtistSchema = new mongoose.Schema({



    name: {
        type: String,
        required: true,
        trim: true

    },

    image: {
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        }
    },

    followers: {
        type: Number,
        default: 0
    },
    monthlyListeners: {
        type: Number,
        default: 0
    },

    themeColor: {
        primary: {
            type: String,
            required: true
        },
        secondary: {
            type: String,
            default: ""
        }
    },
    genres: [
        {
            type: String
        }
    ]
    ,   
    bio: {
        type: String,
        
    },

    isVerified: {
        type: Boolean,
        default: false
    },
    playCount:{
        type:Number,
        default:0
    }

}, { timestamps: true });

module.exports = mongoose.model("Artist", ArtistSchema);