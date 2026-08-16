
const mongoose = require('mongoose');



const albumSchema = new mongoose.Schema({

    name: {
        type: String    ,
        required:true  ,
        trim:true
    }
    ,
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

    artists: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist",
            required: true
        }
    ]
    ,

    themeColor: {

        primary: {
            type: String,
            required: true
        },

        secondary: {
            type: String,
            default: ""
        }

    }
    ,
    countSongs: {
        type: Number,
        default: 0,
        required: true
    },

    fullDuration: {
        type: Number,
        required: true,
        default: 0
    },

    type: {
        type: String,
        enum: ["album", 'single', 'ep'],
        default: 'album'
    },
    releaseDate: {
        type: Date,
        required: true
    },

    genres: [
        {
            type: String
        }
    ],
    moods: [
        {
            type: String
        }
    ],

    copyright: {
        type: String,
        default: ""
    },
    label: {
        type: String
    },
    

}, {
    timestamps: true
});



module.exports = mongoose.model('Album', albumSchema)