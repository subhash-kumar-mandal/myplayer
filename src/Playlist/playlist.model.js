
const mongoose = require('mongoose')


const PlaylistSchema = new mongoose.Schema({



    name: {
        type: String,

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
    }
    ,

    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song"

        }
    ]
    ,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    description: {
        type: String,
        default: ""
    },

    visibility: {
        type: String,
        enum: ["public", "private"],
        default: "public"
    },

    isOfficial: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    followers: {
        type: Number,
        default: 0
    },

    songCount: {
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


    fullDuration: {
        type: Number,
        default: 0
    }


}, { timestamps: true });

module.exports = mongoose.model('Playlist', PlaylistSchema);