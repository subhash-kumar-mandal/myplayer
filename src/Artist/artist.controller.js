
const ArtistSchema = require('./artist.model')
const SongSchema = require('../Song/song.model')
const albumSchema = require('../album/album.model');
const cloudinary = require('../../configs/cloudinary')
const Vibrant = require("node-vibrant");
const { default: mongoose } = require('mongoose');



//  optimize karna hai slow hai
async function CreateArtist(req, res) {


    let url;
    let publicId;

    try {


        url = req.file?.path;
        publicId = req.file?.filename

        const { name, genres, bio, isVerified } = req.body;



        const genresList = JSON.parse(genres);
        const isVerifiedBoolean = JSON.parse(isVerified);


        if (genresList.length === 0 && !genres) {
            throw new Error('select at least one genres required')
        };

        if (typeof isVerifiedBoolean !== 'boolean') {
            throw new Error('invalid explicit value');
        };









        if (!name?.trim()) {
            throw new Error('name is required')
        };








        if (!url || !publicId || !req.file) {
            throw new Error('Image is not found')

        }


        const pngUrl = url.replace("/upload/", "/upload/f_png/");


        const palette = await Vibrant.from(pngUrl).getPalette();


        const primary =
            palette.Vibrant ||
            palette.DarkVibrant ||
            palette.Muted;

        const secondary =
            palette.DarkMuted ||
            palette.Muted ||
            palette.LightMuted ||
            palette.DarkVibrant;



        const primaryHex = rgbToHex(primary.rgb);
        const secondaryHex = rgbToHex(secondary.rgb);

        const createartist = await ArtistSchema.create({
            name: name,
            image: {
                url: url,
                publicId: publicId
            },
            bio: bio ? bio : "",
            themeColor: {
                primary: primaryHex,
                secondary: secondaryHex
            },
            genres: genresList,
            isVerified: isVerifiedBoolean
        });

        await createartist.save();



        res.status(201).json({
            success: true,
            message: "Artist Create Successfully",
            artist: createartist


        })

    } catch (error) {

        if (req.file?.filename) {
            await cloudinary.uploader.destroy(req.file.filename)
        }

        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};



async function artistPageData(req, res) {
    try {

        const { artistId } = req.params;


        if (!mongoose.isValidObjectId(artistId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Artist ID"
            });
        }

        const ArtistInfo = await ArtistSchema.findById(artistId);

        if (!ArtistInfo) {
            return res.status(404).json({
                success: false,
                message: "Artist not found"
            });
        }



        const [ArtistSongs, AlbumSingles, Albums, EPs] = await Promise.all([
            SongSchema.find({
                artists: artistId
            })
                .sort({ playCount: -1 })
                .limit(10)
                .populate('release')
                .populate('artists')
            ,

            albumSchema.find({
                artists: artistId,
                type: 'single'
            })
                .limit(10).populate('artists')
            ,

            albumSchema.find({
                artists: artistId,
                type: 'album'
            })
                .limit(10).populate('artists')
            ,
            albumSchema.find({
                artists: artistId,
                type: "ep"
            }).limit(10).populate('artists')

        ])


        res.status(200).json({
            success: true,
            ArtistInfo,
            Songs: ArtistSongs,
            sections: [

                {
                    title: 'Latest Singles',
                    type: 'album',
                    data: AlbumSingles
                },
                {
                    title: 'Latest album',
                    type: 'album',
                    data: Albums
                },
                {
                    title: 'Latest Eps',
                    type: 'album',
                    data: EPs
                }
            ]

        })


    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


async function homeArtistClick(req, res, next) {
    try {

        const { artistId } = req.params;


        if (!mongoose.isValidObjectId(artistId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Artist ID"
            });
        };
        const ArtistInfo = await ArtistSchema.findById(artistId);

        if (!ArtistInfo) {
            return res.status(404).json({
                success: false,
                message: "Artist not found"
            });
        }

        const songs = await SongSchema.find({
            artists: artistId
        })
            .sort({ playCount: -1 })
            .limit(10)
            .populate('release')
            .populate('artists')

        res.status(200).json({
            success: true,
            ArtistInfo,
            songs: songs,
            

        })



    } catch (err) {
        next(err)
    }
}





// Admin Only Apis



async function getArtists_Songs_Albums_Counts(req, res) {

    try {

        const artists = await ArtistSchema.find();

        const data = [];


        for (const artist of artists) {

            const [albumCount, songCount, epsCounts, singleCounts] = await Promise.all([
                albumSchema.countDocuments({
                    artists: artist._id,
                    type: 'album'
                }),

                SongSchema.countDocuments({
                    artists: artist._id
                }),

                albumSchema.countDocuments({
                    artists: artist._id,
                    type: "ep"
                }),

                albumSchema.countDocuments({
                    artists: artist._id,
                    type: "single"
                })


            ])



            data.push({
                ...artist.toObject(),
                albumCount,
                songCount,
                epsCounts,
                singleCounts
            });
        }

        res.status(201).json({
            success: true,
            message: "Successfully fetch",
            data
        })

    } catch (err) {
        res.status(500).json({
            success: true,
            message: err.message
        })
    }
}

async function GiveArtistName(req, res) {
    try {

        const artists = await ArtistSchema.find()
            .select(' -followers -monthlyListeners -themeColor -bio -createdAt -updatedAt');


        res.status(201).json({
            success: true,
            message: "successfully Artist Name fetch",
            artists
        })

    }
    catch (err) {
        res.status(500)
            .json({
                success: false,
                message: err.message
            })
    }
}


function rgbToHex(rgb) {
    return (
        "#" +
        rgb
            .map(v => Math.round(v).toString(16).padStart(2, "0"))
            .join("")
    );
}


module.exports = { homeArtistClick, CreateArtist, artistPageData, getArtists_Songs_Albums_Counts, GiveArtistName }