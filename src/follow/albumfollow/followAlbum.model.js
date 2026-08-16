const mongoose  = require("mongoose");





const followAlbumSchema  = new  mongoose.Schema({
       
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    albumsFollow:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Album"
        }
    ]
},{timestamps:true});



module.exports  = mongoose.model('FollowAlbum',followAlbumSchema)