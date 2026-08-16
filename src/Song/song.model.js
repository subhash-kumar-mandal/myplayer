
const mongoose = require('mongoose')


const SongSchema = new mongoose.Schema({


    type: {
        type: String,
        default: "song"
    },

    name: {
        type: String,
        required: true,
        trim: true

    },


    audioUrl: {
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
    ],

    release: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album",
        required:true
    }
    ,
    codec: {
        type: String
    }

    ,
    size: {
        type: Number
    }
    ,
    bitrate: {
        type: Number
    }
    ,

    playCount: {
        type: Number,
        default: 0
    }
    ,
    likeCount: {
        type: Number,
        default: 0
    },

    duration: {
        type: Number,
        required: true
    }


    ,
    explicit: {
        type: Boolean,
        default: false
    }


    ,
    genres: [
        { type: String }
    ]

    ,
    language: {
        type: String,
        enum: [
            "Hindi",
            "Punjabi",
            "English",
            "Tamil",
            "Telugu",
            "Brazilian"
        ],
        default: "Hindi"
    }
    ,
    trackNumber: {
        type: Number,
        default: 1
    },

    discNumber: {
        type: Number,
        default: 1
    },

    previewAudio: {
        url: {
            type: String
        },
        publicId: {
            type: String
        }
    }


    ,

    credits: {
        singers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist"
        }],

        writers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist"
        }],

        composers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist"
        }],

        producers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist"
        }]
    },

    //  Ye kaam bad mein karna hai 
    canvasVideo: {
        url: {
            type: String,
            default: ""
        },
        publicId: {
            type: String,
            default: ""
        }
    }
    ,
    lyrics: {
        type: String,
        default: ""
    }

}, { timestamps: true });

module.exports = mongoose.model("Song", SongSchema);




