const PlaylistSchema = require('./song.model');
const mongoose = require('mongoose')
const fs = require('fs/promises');

const getPreviewAudio = require('../helper/getPreviewAudio');
const getMediaInfo = require('../helper/getMediaInfo')
const CustomError = require('../helper/customError')

const ArtistSchema = require('../Artist/artist.model');
const SongSchema = require('./song.model');
const albumSchema = require('../album/album.model');
const cloudinary = require('../../configs/cloudinary');
const ffmpeg = require('fluent-ffmpeg')
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobeInstaller = require("@ffprobe-installer/ffprobe")
const Vibrant = require("node-vibrant");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);






//  optimze karna hai bad mein


async function SongCreate(req, res, next) {

    let audio;


    let previewpublicId;
    let audiopulicId;

    let canvas;
    let canvasPublicId

    const previewPath = `temp/preview-${Date.now()}.mp3` // handle upload preview audio


    try {

        audio = req.files?.audio[0];
        canvas = req.files?.canvas?.[0];

        console.log(canvas);

        if (!audio) return next(new CustomError("Audio is required", 401));


        const {
            name,
            language,
            explicit,
            artists,
            genres,
            album,
            credits
        } = req.body;





        //  check name is valid or not
        if (!name?.trim()) return next(new CustomError('Name is required', 401));

        //  check language is valid or not
        if (!language?.trim()) return next(new CustomError('language is Required', 401));

        // check explicit is boolean or not
        const isExplicit = JSON.parse(explicit)
        if (typeof isExplicit !== 'boolean') return next(CustomError('invalid explicit value', 401));

        // check album is valid or not
        const isAlbum = JSON.parse(album);
        if (Object.keys(isAlbum).length < 1) return next(new CustomError('select the album(Required)', 401));

        const findAlbum = await albumSchema.findById(isAlbum._id);
        if (!findAlbum) return next(new CustomError('select the vaild album any', 401));

        // find the count of songs in the album
        const count = await SongSchema.countDocuments({
            release: isAlbum._id
        });


        // check genres is valid or not
        const genreList = JSON.parse(genres);
        if (!Array.isArray(genreList) || genreList.length === 0) return next(new CustomError('Select at least one genre', 401));

        // check artists is valid or not
        const artistId = JSON.parse(artists);
        if (!Array.isArray(artistId) || artistId.length === 0) return next(new CustomError('Select at least one artist', 401));

        const findArtists = await ArtistSchema.find({
            _id: { $in: artistId }
        });

        if (findArtists.length !== artistId.length) {
            return next(new CustomError('One or more Artist not found', 401));
        }


        //check credits is valid or not

        const creditData = JSON.parse(credits || "{}");
        if (
            !creditData ||
            !Array.isArray(creditData?.singers || []) ||
            !Array.isArray(creditData?.writers || []) ||
            !Array.isArray(creditData?.composers || []) ||
            !Array.isArray(creditData?.producers || [])
        ) {
            return next(new CustomError('invalid credits', 401));
        };


        const [findSingerIds, findWritersIds, findComposersIds, findProducersIds] = await Promise.all([
            ArtistSchema.find({ _id: { $in: creditData.singers || [] } }),
            ArtistSchema.find({ _id: { $in: creditData.writers || [] } }),
            ArtistSchema.find({ _id: { $in: creditData.composers || [] } }),
            ArtistSchema.find({ _id: { $in: creditData.producers || [] } })
        ])


        const [metaData, previewAudio] = await Promise.all([
            getMediaInfo(audio.path),
            getPreviewAudio(audio.path, previewPath)
        ]);

        if (!metaData || !previewAudio) {
            return next(new CustomError('Failed to process audio file', 500));
        };


        const hasVideo = metaData.streams.some(stream => stream.codec_type === "video");
        const hasAudio = metaData.streams.some(stream => stream.codec_type === "audio");

        if (hasAudio && hasVideo) return next(new CustomError('Not Valid format Audio', 400));

        const stream = metaData.streams.find(
            stream => stream.codec_type === "audio"
        );


        const [AudioUpload, previewUpload, CanvasUpload] = await Promise.all([
            cloudinary.uploader.upload(
                audio.path,
                {
                    folder: 'spotify-clone/song/audio',
                    resource_type: 'video'
                }
            ),
            cloudinary.uploader.upload(
                previewPath,
                {
                    folder: 'spotify-clone/song/previewAudio',
                    resource_type: "video"
                }
            ),
            canvas
                ? cloudinary.uploader.upload(
                    canvas.path,
                    {
                        folder: 'spotify-clone/song/canvas',
                        resource_type: 'video'
                    }
                )
                : Promise.resolve(null)
        ]);

        const previewSU = previewUpload.secure_url;
        previewpublicId = previewUpload.public_id;

        const audioSU = AudioUpload.secure_url;
        audiopulicId = AudioUpload.public_id;

        const canvasSU = CanvasUpload?.secure_url || "";
        canvasPublicId = CanvasUpload?.public_id || "";

        // audio meta data
        const duration = metaData.format.duration;
        const size = metaData.format.size;
        const codec = stream.codec_name;
        const bitrate = metaData.format.bit_rate;

        const createsong = await SongSchema.create({
            name: name,
            type: "song",
            audioUrl: {
                url: audioSU,
                publicId: audiopulicId
            },
            artists: findArtists.map(val => val._id),
            release: findAlbum._id,
            codec: codec,
            size: size,
            bitrate: bitrate,
            duration: duration,
            explicit: isExplicit,
            genres: [...genreList],
            language: language,
            credits: {
                singers: [...findSingerIds.map(val => val._id)],
                writers: [...findWritersIds.map(val => val._id)],
                composers: [...findComposersIds.map(val => val._id)],
                producers: [...findProducersIds.map(val => val._id)]
            },
            previewAudio: {
                url: previewSU,
                publicId: previewpublicId
            },
            trackNumber: count + 1,
            canvasVideo:canvasSU
            ? {
            url: canvasSU,
            publicId: canvasPublicId
        }
    : {
            url: "",
                publicId: ""
        },
    });


    await Promise.all([
        createsong.save(),
        albumSchema.findByIdAndUpdate(
            findAlbum._id,
            {
                $inc: {
                    countSongs: 1,
                    fullDuration: duration
                }
            }
        )
    ]);


    res.status(200).json({
        success: true,
        message: 'song is created',
        song: createsong
    })

} catch (err) {

    await Promise.all([
        audiopulicId
            ? cloudinary.uploader.destroy(audiopulicId, {
                resource_type: "video"
            })
            : Promise.resolve(),
        previewpublicId ?
            cloudinary.uploader.destroy(previewpublicId, {
                resource_type: "video"
            })
            : Promise.resolve(),
        canvasPublicId
            ? cloudinary.uploader.destroy(canvasPublicId, {
                resource_type: "video"
            })
            : Promise.resolve()
    ]);

    next(err)
} finally {
    try {
        if (audio?.path) await fs.unlink(audio.path);

        if (previewPath) await fs.unlink(previewPath).catch(() => console.log('preview is deleted'));

        if (canvas?.path) {
            await fs.unlink(canvas.path).catch(() => { });
        }

    }
    catch (err) {
        console.log(err.message, 'failed temp delete')
    }

}

}





async function Track(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            throw new Error('Not vaild Id')
        }

        const findSong = await SongSchema.findById(id).populate('artists').populate('release');

        const sections = [];
        const usedAlbums = new Set();

        for (const artist of findSong.artists) {

            const albums = await albumSchema
                .find({
                    artists: artist._id
                })
                .sort({
                    createdAt: -1
                })
                .limit(10)
                .populate("artists");

            const uniqueAlbums = albums.filter(album => {

                const albumId = album._id.toString();

                if (usedAlbums.has(albumId)) {
                    return false;
                }

                usedAlbums.add(albumId);

                return true;
            });

            sections.push({
                title: `Trending ${artist.name}`,
                type: "album",
                data: uniqueAlbums
            });
        }



        res.status(200).json({
            success: true,
            message: "song fetch successfully",
            song: findSong,
            sections

        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}




module.exports = { SongCreate,  Track };




function rgbToHex(rgb) {
    return (
        "#" +
        rgb
            .map(v => Math.round(v).toString(16).padStart(2, "0"))
            .join("")
    );
}