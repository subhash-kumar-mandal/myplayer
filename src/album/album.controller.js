
const albumSchema = require('./album.model');
const SongSchema = require('../Song/song.model');
const ArtistSchema = require('../Artist/artist.model');
const Vibrant = require("node-vibrant");
const cloudinary = require('../../configs/cloudinary')

const CustomError = require('../helper/customError');
const rgbToHex = require('../helper/rgbTOHex');
const { default: mongoose } = require('mongoose');




const createAlbum = async (req, res) => {

    let file



    try {

        file = req?.file

        if (!file) {
            throw new Error('Album image is required')
        }
        const types = ['ep', 'single', 'album'];




        const { name, type, artists, genres, description, label, genreMoods, releaseDate } = req.body;


        const artistsIds = JSON.parse(artists);
        const genresList = JSON.parse(genres);
        const genreMoodsList = JSON.parse(genreMoods);



        if (!name?.trim()) {
            throw new Error("name is required")
        }

        const flagType = !types.includes(type);

        if (flagType) {
            throw new Error('invalid type')
        };

        if (!releaseDate) {
            throw new Error('invalid releaseDate')
        }



        if (!label?.trim()) {
            throw new Error('copyright patner missing')
        }




        if (!Array.isArray(genresList) || genresList.length === 0) {
            throw new Error('Select at least one genre');
        };

        if (!Array.isArray(genreMoodsList) || genreMoodsList.length === 0) {
            throw new Error('Select at least one mood');
        }

        if (!Array.isArray(artistsIds)
            || artistsIds.length === 0
        ) {
            throw new Error('One or more Artist not found');
        }


        const verifyIdsArtits = await ArtistSchema.find({
            _id: { $in: artistsIds }
        })




        if (artistsIds.length !== verifyIdsArtits.length) {
            throw new Error('One or more Artist not found');
        }





        const url = file.path;
        const publicId = file.filename
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

        const copyright = `© ${new Date().getFullYear()} ${label}`;

        const create = await albumSchema.create({
            name: name,
            image: {
                url: url,
                publicId: publicId
            },
            artists: artistsIds,
            themeColor: {
                primary: primaryHex,
                secondary: secondaryHex
            },
            type: type,
            genres: genresList,
            moods: genreMoodsList,
            label: label,
            copyright: copyright,
            releaseDate: new Date(releaseDate)
        });

        await create.save();

        res.status(200).json({
            success: true,
            message: `Album create Successfully`,

        })


    }
    catch (err) {
        console.log(err)
        if (req.file?.filename) {
            cloudinary.uploader.destroy(req.file.filename); // delete photo throw any error
        }

        res.status(500)
            .json({
                success: false,
                message: err.message
            })
    }
};



async function GetSongsByAlbumIdPage(req, res) {
    try {

        const { releaseId } = req.params;

        if (!mongoose.isValidObjectId(releaseId)) throw new Error('Not vaild Id')


        // album se or song dene ke liye     
        const albumSongFind = await albumSchema.findById(releaseId).populate('artists');
        const SongsAlbum = await SongSchema.find({
            release: releaseId
        })
            .populate('release')
            .populate('artists').sort({ trackNumber: 1 });

        const randomIndex = Math.floor(Math.random() * albumSongFind.artists.length);


        //suggestion ke liye 
        const SuggeationAlbum = await albumSchema.find({
            artists: albumSongFind.artists[randomIndex]._id
        }).populate([
            { path: "artists" }
        ])

            .limit(8);



        if (!albumSongFind) return res.status(400).json({
            success: false,
            message: "Album are not found",

        });


        res.status(200).json({
            success: true,
            message: `songs find  Successfully`,
            songs: SongsAlbum,
            Album: albumSongFind,
            SuggeationAlbum
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




const AlbumsName = async (req, res) => {
    try {
        const albums = await albumSchema.find()
            .select('-themeColor -artists -createdAt -updatedAt');


        res.status(201).json({
            success: true,
            message: "successfully Artist Name fetch",
            albums
        })

    } catch (err) {
        res.status(500)
            .json({
                success: false,
                message: err.message
            })
    }
}



async function homeClick(req, res, next) {
    try {

        const { releaseId } = req.params;

        if (!mongoose.isValidObjectId(releaseId)) throw new Error('Not vaild Id')


        // album se or song dene ke liye     
        const albumSongFind = await albumSchema.findById(releaseId).populate('artists');
        const SongsAlbum = await SongSchema.find({
            release: releaseId
        })
            .populate('release')
            .populate('artists').sort({ trackNumber: 1 });


        res.status(200).json({
            success: true,
            message: `songs find  Successfully`,
            songs: SongsAlbum,
            Album: albumSongFind,
        
        })

    } catch (err) {
        next(err)
    }
}






module.exports = { homeClick, createAlbum, GetSongsByAlbumIdPage, AlbumsName }
