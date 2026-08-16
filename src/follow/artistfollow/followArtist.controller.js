const { default: mongoose } = require("mongoose");


const followArtistSchema = require("./followArtist.model");
const ArtistSchema = require('../../Artist/artist.model');

async function Artist_Follow_toggle(req, res, next) {
    try {

        const user = req.user;
        const { artistId } = req.params;

        if (!mongoose.isValidObjectId(artistId)) return next(new customError("Invaild mongo ID", 400))

        if (!user) return next(new customError("user not found", 400));



        const [follow, find_artist] = await Promise.all([
            followArtistSchema.findOne({
                userId: user._id
            }),
            ArtistSchema.findById(artistId)
        ])

        if (!find_artist) return next(new customError("Artist is not found", 400))


        if (!follow) {

            const create = await followArtistSchema.create({
                userId: user._id,
                artistsFollow: [artistId]
            });

            await ArtistSchema.updateOne(
                { _id: find_artist._id },
                {
                    $inc: {
                        followers: 1
                    }
                }
            )

            return res.status(200).json({
                success: true,
                message: "Successfully Follow",
                artist: find_artist,
                isFollow: true
            });
        };




        const isFollowArtist = follow.artistsFollow.includes(artistId);


        if (isFollowArtist) {

            await followArtistSchema.updateOne(
                { userId: user._id },
                { $pull: { artistsFollow: artistId } }
            );

             await ArtistSchema.updateOne(
                { _id: find_artist._id },
                {
                    $inc: {
                        followers: -1
                    }
                }
            )


            return res.status(200).json({
                success: true,
                message: " successfully unfollow",
                artist: find_artist,
                isFollow: false
            })

        };



        await followArtistSchema.updateOne(
            { userId: user._id },
            { $addToSet: { artistsFollow: artistId } }
        )


        await ArtistSchema.updateOne(
                { _id: find_artist._id },
                {
                    $inc: {
                        followers: 1
                    }
                }
            )



        return res.status(200).json({
            success: true,
            message: " successfully follow",
            artist: find_artist,
            isFollow: true
        })




    } catch (error) {
        next(error)
    }
}


module.exports = { Artist_Follow_toggle }