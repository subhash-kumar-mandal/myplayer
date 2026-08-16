const { model } = require("mongoose");
const PlaylistSchema = require("./playlist.model");






const playlistCreate = async (req, res) => {

    try {

        const { image, text } = req.body;

        if (!image?.trim() || !text?.trim()) {
            return res.status(403).json({
                success: false,
                message: "cover image and playlist name Required"
            })
        };


        const createPlaylist = await PlaylistSchema.insertOne({
            text: text,
            image: image
        })



        res.status(201)
            .json({
                message: `Playlist is created ${text}`,
                success: true,
                newPlaylist: createPlaylist
            })



    }
    catch (err) {
        res.status(500).
            json({
                success: false,
                message: err.message
            })
    }
};


const playlist_Add_Song = async (req, res) => {

    try {


        const { playlistId, songId } = req.params;




        const findPlaylist = await PlaylistSchema.findById(playlistId);


        if (!findPlaylist) return res.status(404).json({
            success: false,
            message: "playlist is not found"
        });


        if (findPlaylist.songs.includes(songId)) {
            return res.status(404).json({
                success: false,
                message: "Song already add displaylist"
            })
        }


        findPlaylist.songs.push(songId);
        await findPlaylist.save()




        res.status(201)
            .json({
                message: ` Add to song playlist ${findPlaylist.title}`,
                success: true,
                Playlist: findPlaylist
            })



    }
    catch (err) {
        res.status(500).
            json({
                success: false,
                message: err.message
            })
    }
};




async function getPlaylist_songs (req,res){
    try{

        const {playlistId} = req.params;



        const findPlaylist_songs = await PlaylistSchema.findById(playlistId)
        .populate(
            {
                path:'songs',
                populate:{
                    path:'artist'
                }
            }
        );


        if (!findPlaylist_songs) return res.status(404).json({
            success: false,
            message: "playlist is not found"
        });


        res.status(201)
            .json({
                message: `playlist find successfully`,
                success: true,
                playlistSongs:findPlaylist_songs 
            })

    }
    catch(err){
        res.status(500).json({
            success:false,
            message:err.message
        })
    }
}




module.exports = { playlistCreate, playlist_Add_Song ,getPlaylist_songs}