const { default: mongoose } = require("mongoose");





const followArtistSchema  = new  mongoose.Schema({
       
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    artistsFollow:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Artist"
        }
    ]
},{timestamps:true});



module.exports  = mongoose.model('FollowArtist',followArtistSchema)