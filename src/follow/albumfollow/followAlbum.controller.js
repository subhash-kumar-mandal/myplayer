const { default: mongoose } = require("mongoose");




const followAlbumModel = require("./followAlbum.model");
const albumModel = require("../../album/album.model");

async function Album_Follow_toggle(req, res, next) {
    try {

        const user = req.user;
        const { albumId } = req.params;

        if (!mongoose.isValidObjectId(albumId)) return next(new customError("Invaild mongo ID", 400))

        if (!user) return next(new customError("user not found", 400));



        const [follow, find_album] = await Promise.all([
            followAlbumModel.findOne({
                userId: user._id
            }),
            albumModel.findById(albumId).populate('artists')
        ])

        if (!find_album) return next(new customError("Album is not found", 400))

        
        if (!follow) {

              await followAlbumModel.create({
                userId: user._id,
                albumsFollow: [albumId]
            });

            return res.status(200).json({
                success: true,
                message: "successfully Follow",
                isFollowing:true,
                album: find_album
            });
        };



        const isFollowAlbum = follow.albumsFollow.some(
            id => id.toString() === albumId
        );

        // const isFollowAlbum = follow.albumsFollow.includes(albumId);


        if (isFollowAlbum) {

              await followAlbumModel.updateOne(
                { userId: user._id },
                { $pull: { albumsFollow: albumId } }
            );


            return res.status(200).json({
                success: true,
                message: "successfully unfollow",
                album: find_album,
                isFollowing:false,
            })

        };



        await followAlbumModel.updateOne(
            { userId: user._id },
            { $addToSet: { albumsFollow: albumId } }
        )

       



        return res.status(200).json({
            success: true,
            message: "successfully follow",
            isFollowing:true,
            album:find_album
        })




    } catch (error) {
        next(error)
    }
}


module.exports = { Album_Follow_toggle }