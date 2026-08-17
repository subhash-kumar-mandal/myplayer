require('dotenv/config');


const ArtistSchema = require('../Artist/artist.model');
const SongSchema = require('../Song/song.model');
const userSchema = require('./user.model');
const AlbumSchema = require('../album/album.model')
const HistorySchema = require('../History/history.model')
const customError = require('../helper/customError')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const followAlbumModel = require('../follow/albumfollow/followAlbum.model');
const followArtistModel = require('../follow/artistfollow/followArtist.model');

export const options = {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const letters = new Set(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
);

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

const genders = ['Male',
    'Female',
    'Other',
    "Non-binary",
    "Something else",
    "Prefer not to say"
]

async function SignUp(req, res, next) {


    try {
        const {
            email,
            password,
            name,
            gender,
            DOB
        } = req.body;



        //   email check
        if (!email?.trim()) return next(new customError('Email is Required', 422))
        if (!password?.trim()) return next(new customError('password is Required', 422));
        if (!emailRegex.test(email)) return next(new customError('Invalid email', 422));

        // Password Flags
        const hasLetter = [...password].some(char => letters.has(char));
        const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
        const hasLength = password.length >= 10;

        if (!hasLength) return next(new customError('password at minimum length 10 ', 422));
        if (!hasSpecialChar) return next(new customError('password at least ', 422));
        if (!hasLetter) return next(new customError('password at least one character', 422));



        // Name check
        if (!name?.trim()) return next(new customError('name is Required', 500));
        if (name.trim().length < 3 || name.trim().length > 35) return next(new customError('name minimum 3 and maximum 35', 422));

        // gender check 
        if (!gender?.trim() || !genders.some(val => val === gender)) return next(new customError('Invalid gender', 422));


        if (!DOB) {
            return next(new customError("Date of birth is required", 422));
        }
        // const parseobjectDOB  = JSON.parse(DOB);
        const DOBlength = Object.keys(DOB).length
        const currentYear = new Date().getFullYear();

        if (!DOB || Object.prototype.toString.call(DOB) !== "[object Object]" || DOBlength < 1 || DOBlength > 3) {
            return next(new customError("Date of birth is required", 422));
        }

        const {
            yyyy,
            dd,
            month
        } = DOB
        const year = Number(yyyy);
        const day = Number(dd);

        if (!yyyy?.trim() || yyyy.length !== 4 || year < 1900 || year > currentYear) return next(new customError(`Invalid year must be 1900 as ${currentYear}`, 422));

        if (!dd?.trim() || dd.length !== 2 || day < 1 || day > 31) return next(new customError(`Invalid DD must be 1 as 31`, 422))

        if (!month?.trim() || !months.some(val => val === month)) return next(new customError(`Invalid month `, 422))


        const date = new Date(`${month} ${day}, ${year}`);

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== months.indexOf(month) ||
            date.getDate() !== day
        ) {
            return next(
                new customError("Invalid date of birth", 422)
            );
        }

        const user = await userSchema.findOne({ email });

        if (user) {
            return next(
                new customError("Email already exists", 409)
            );
        }

        const hashpassword = await bcrypt.hash(password, 10);




        const createNewUser = await userSchema.create({
            email,
            password: hashpassword,
            gender,
            name,
            DOB,


        });

        const user_sent = createNewUser.toObject();
        delete user_sent.password;


        const accessToken = jwt.sign(
            {
                _id: createNewUser._id,
                role: createNewUser.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        );
        const refreshToken = jwt.sign(
            {
                _id: createNewUser._id,
                role: createNewUser.role
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        );


        createNewUser.refreshToken = refreshToken

        //  console.log(createNewUser.refreshToken);

        await createNewUser.save({ validateBeforeSave: false });


        res
            .cookie("refreshToken", refreshToken, options)
            .status(201)
            .json({
                success: true,
                message: "Sign up succussfully",
                user: user_sent,
                accessToken
            });




    } catch (err) {
        next(err)
    }
};




async function refreshPage(req, res, next) {
    try {
        const refresh_Token = req.cookies.refreshToken;

        if (!refresh_Token) {
            return next(new customError("Refresh token not found", 401));
        }



        const flagVerify = jwt.verify(refresh_Token, process.env.REFRESH_TOKEN_SECRET);




        const user = await userSchema.findById(flagVerify._id).select("+refreshToken");

        if (!user) {
            return next(new customError("Unauthorized", 401));
        };



        // if (user.refreshToken !== refresh_Token) {
        //     return next(new customError("Unauthorized", 401));
        // }


        // const newrefreshToken = jwt.sign(
        //     {
        //         _id: flagVerify._id,
        //         role: flagVerify.role
        //     },
        //     process.env.REFRESH_TOKEN_SECRET,
        //     {
        //         expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        //     }
        // );

        const newaccessToken = jwt.sign(
            {
                _id: flagVerify._id,
                role: flagVerify.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        );



        // user.refreshToken = newrefreshToken;
        // await user.save({ validateBeforeSave: false });


        const userSend = user.toObject();

        delete userSend.password;
        delete userSend.refreshToken;



        res.cookie("refreshToken", user.refreshToken, options).status(200).json({
            success: true,
            message: "genreate refresh token",
            accessToken: newaccessToken,
            user: userSend
        })

    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return next(new customError("Refresh Token Expired", 401));
        }

        if (err.name === "JsonWebTokenError") {
            return next(new customError("Invalid Refresh Token", 401));
        }

        next(err)
    }
}









//  optmize this function  bad mein karte hai

async function likeSong(req, res) {

    try {

        const { songId, userId } = req.params;

        const userfind = await userSchema.findById(userId);

        if (!userfind) return res.status(404).json({
            success: false,
            message: "like is feilds",

        })



        const likeFlag = userfind.likedSong.songs.includes(songId);
        let senduser;

        if (likeFlag) {

            senduser = await userSchema.findByIdAndUpdate(
                userId,
                {
                    $pull: {
                        "likedSong.songs": songId
                    }

                },
                {
                    new: true
                }
            );


            const incrementLike = await SongSchema.findByIdAndUpdate(
                songId,
                {
                    $inc: {
                        likeCount: -1
                    }
                },
                {
                    new: true
                }
            );


        }
        else {

            senduser = await userSchema.findByIdAndUpdate(
                userId,
                {
                    $addToSet: {
                        "likedSong.songs": songId
                    }

                },
                {
                    new: true
                }
            );


            const incrementLike = await SongSchema.findByIdAndUpdate(
                songId,
                {
                    $inc: {
                        likeCount: 1
                    }
                },
                {
                    new: true
                }
            );

        }






        return res.status(200).json({
            success: true,
            message: "like song  successfully",
            user: senduser
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message,
            success: true
        })
    }
};
















async function Check_Email_Give(req, res) {

    try {
        const { email } = req.params;

        const find_Email = await userSchema.findOne({
            email: email
        })


        if (find_Email) {
            return res.status(401).json({
                success: false,
                message: "Already exists"
            })
        }

        res.status(200).json({
            success: true,
            message: "success not match",

        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }

}







async function UserCardsTops(req, res) {
    try {


        const user = req.user;

        // --------------------------------------------------
        // Initial user data
        // Used to determine:
        // - Is this a new user?
        // - What artists/albums does the user follow?
        // - What has the user listened to?
        // - General fallback content
        // --------------------------------------------------

        const [
            history,
            populateHistory,
            followAlbums,
            followArtists,
            singles,
            albums,
            eps,
            jumps,
            topCard
        ] = await Promise.all([

            // Check whether the user has listening history
            HistorySchema.countDocuments({
                userId: user._id
            }),

            // Get user's complete listening history
            // Song -> Artists is populated because we use
            // history to find artists the user listens to.
            HistorySchema.find({
                userId: user._id
            }).populate({
                path: "songId",
                populate: {
                    path: "artists"
                }
            }),

            // Get albums followed by the user
            // Album -> Artists is also populated.
            followAlbumModel.findOne({
                userId: user._id
            }).populate({
                path: "albumsFollow",
                populate: {
                    path: "artists"
                }
            }),

            // Get artists followed by the user
            followArtistModel.findOne({
                userId: user._id
            }).populate("artistsFollow"),

            // Latest singles used as fallback content
            AlbumSchema.find({
                type: "single",
                genres: {
                    $in: ['Punjabi', 'Dance Pop', 'Indian Pop']
                }
            })
                .sort({
                    createdAt: -1
                })
                .limit(10)
                .populate("artists")

            ,

            // Latest albums used as fallback content
            AlbumSchema.find({
                type: "album"
            })
                .sort({
                    createdAt: -1
                })
                .limit(10)
                .populate("artists"),

            // Latest EPs used as fallback content
            AlbumSchema.find({
                type: "ep"
            })
                .sort({
                    createdAt: -1
                })
                .limit(10)
                .populate("artists"),

            // Additional songs used by Jump Back
            SongSchema.find({
                genres: {
                    $in: ['Dance Pop']
                }
            })

                .limit(10)
                .populate("artists")
                .populate("release"),

            SongSchema.find()
                .sort({
                    playCount: -1
                })
                .limit(8)
                .populate("artists")
                .populate("release")
        ]);


        // --------------------------------------------------
        // Follow collections
        // If the user has not followed anything yet,
        // use an empty array instead of null.
        // --------------------------------------------------

        const followedArtistIds = followArtists?.artistsFollow || [];
        const followedAlbumIds = followAlbums?.albumsFollow || [];

        // --------------------------------------------------
        // NEW USER
        // User has no listening history.
        // Therefore recommendations cannot be personalized.
        // --------------------------------------------------

        if (history === 0) {

            const [
                trendingSongs,
                popularArtists,
                newAlbums,
                newSingles
            ] = await Promise.all([

                // Most played songs
                SongSchema.find()
                    .sort({
                        playCount: -1
                    })
                    .limit(10)
                    .populate("artists")
                    .populate("release"),

                // Artists with the highest listeners
                ArtistSchema.find()
                    .sort({
                        monthlyListeners: -1
                    })
                    .limit(10),

                // Recently created albums
                AlbumSchema.find()
                    .sort({
                        createdAt: -1
                    })
                    .limit(10)
                    .populate("artists"),

                // Recently created singles
                AlbumSchema.find({
                    type: "single"
                })
                    .sort({
                        createdAt: -1
                    })
                    .limit(10)
                    .populate('artists')
            ]);

            return res.status(200).json({
                success: true,

                JumpBack: {
                    title: 'jump to Back',
                    type: 'tracks',
                    data: jumps
                },
                topsCard: topCard,

                sections: [

                    {
                        title: "Trending Song",
                        type: "tracks",
                        data: trendingSongs
                    },

                    {
                        title: "New Releases",
                        type: "albums",
                        data: newAlbums
                    },

                    {
                        title: "Singles ",
                        type: "albums",
                        data: newSingles
                    },

                    {
                        title: "Popular Artists",
                        type: "artists",
                        data: popularArtists
                    }
                ],

                follows: {
                    albums: followedAlbumIds,
                    artists: followedArtistIds
                }
            });
        }

        // --------------------------------------------------
        // Get followed artists
        // If there are no followed artists, we will build
        // artist IDs from the user's listening history.
        // --------------------------------------------------

        const follow = await followArtistModel.findOne({
            userId: user._id
        });

        const artistIds = follow?.artistsFollow || [];

        // --------------------------------------------------
        // USER HAS HISTORY BUT FOLLOWS NO ARTIST
        // --------------------------------------------------

        if (artistIds.length === 0) {

            // Extract artists from listening history
            const historyArtistIds = [];

            populateHistory.forEach(item => {

                if (!item.songId?.artists) return;

                item.songId.artists.forEach(artist => {
                    historyArtistIds.push(
                        artist._id.toString()
                    );
                });
            });

            // Remove duplicate artist IDs
            const uniqueArtistIds = [
                ...new Set(historyArtistIds)
            ];

            // --------------------------------------------------
            // Personalized data based on listening history
            // --------------------------------------------------

            const [
                JumpBack,
                youFollowArtists,
                latestAlbums,
                latestEps,
                latestSingles,
                topsCards
            ] = await Promise.all([

                // Recently played songs
                HistorySchema.find({
                    userId: user._id
                })
                    .sort({
                        playAt: -1
                    })
                    .limit(10)
                    .populate({
                        path: "songId",
                        populate: [
                            {
                                path: "artists"
                            },
                            {
                                path: "release"
                            }
                        ]
                    }),

                // Artists found from listening history
                ArtistSchema.find({
                    _id: {
                        $in: uniqueArtistIds
                    }
                })
                    .sort({
                        createdAt: -1
                    })
                    .limit(10),

                // Albums from artists found in history
                AlbumSchema.find({
                    artists: {
                        $in: uniqueArtistIds
                    }
                })
                    .sort({
                        createdAt: -1
                    })
                    .limit(10)
                    .populate("artists"),

                // EPs from artists found in history
                AlbumSchema.find({
                    artists: {
                        $in: uniqueArtistIds
                    },
                    type: "ep"
                })
                    .sort({
                        createdAt: -1
                    })
                    .limit(10)
                    .populate("artists"),

                // Singles from artists found in history
                AlbumSchema.find({
                    artists: {
                        $in: uniqueArtistIds
                    },
                    type: "single"
                })
                    .limit(10)
                    .populate('artists'),

                HistorySchema.find({
                    userId: user._id
                })
                    .sort({
                        playCount: -1
                    })
                    .limit(8)
                    .populate({
                        path: "songId",
                        populate: [
                            {
                                path: "artists"
                            },
                            {
                                path: "release"
                            }
                        ]
                    })
            ]);

            return res.status(200).json({
                success: true,

                // Recently played songs
                JumpBack: {
                    title: "Jump Back to",
                    type: "tracks",
                    data: JumpBack.map(item => item.songId)
                },
                topsCard: topsCards.map(item => item.songId).length<6?topCard:topsCards.map(item => item.songId),
                sections: [

                    {
                        title: "New Releases",
                        type: "albums",

                        // If personalized albums are insufficient,
                        // fill the remaining content with general albums.
                        data:
                            latestAlbums.length <= 6
                                ? [...albums]
                                : latestAlbums
                    },

                    {
                        title: "Latests Eps",
                        type: "albums",

                        // If personalized EPs are insufficient,
                        // use general EPs as fallback.
                        data:
                            latestEps.length <= 6
                                ? [...eps]
                                : latestEps
                    },

                    {
                        title: "latests Singles",
                        type: "albums",

                        // If personalized singles are insufficient,
                        // use general singles as fallback.
                        data:
                            latestSingles.length <= 6
                                ? [...singles]
                                : latestSingles
                    },

                    {
                        title: "You Also Like",
                        type: "artists",
                        data: youFollowArtists
                    }
                ],

                follows: {
                    albums: followedAlbumIds,
                    artists: followedArtistIds
                }
            });
        }

        // --------------------------------------------------
        // USER HAS HISTORY + FOLLOWS ARTISTS
        // --------------------------------------------------

        const [
            JumpBack,
            youFollowArtists,
            latestAlbums,
            latestEps,
            latestSingles,
            topCards
        ] = await Promise.all([

            // Recently played songs
            HistorySchema.find({
                userId: user._id
            })
                .sort({
                    playAt: -1
                })
                .limit(10)
                .populate({
                    path: "songId",
                    populate: [
                        {
                            path: "artists"
                        },
                        {
                            path: "release"
                        }
                    ]
                }),

            // Artists followed by the user
            ArtistSchema.find({
                _id: {
                    $in: artistIds
                }
            })
                .limit(10),

            // Albums released by followed artists
            AlbumSchema.find({
                artists: {
                    $in: artistIds
                }
            })
                .sort({
                    createdAt: -1
                })
                .limit(10)
                .populate("artists"),

            // EPs released by followed artists
            AlbumSchema.find({
                artists: {
                    $in: artistIds
                },
                type: "ep"
            })
                .sort({
                    createdAt: -1
                })
                .limit(10)
                .populate("artists"),

            // Singles released by followed artists
            AlbumSchema.find({
                artists: {
                    $in: artistIds
                },
                type: "single"
            })
                .limit(10)
                .populate("artists"),

            HistorySchema.find({
                userId: user._id
            })
                .sort({
                    playCount: -1
                })
                .limit(8)
                .populate({
                    path: "songId",
                    populate: [
                        {
                            path: "artists"
                        },
                        {
                            path: "release"
                        }
                    ]
                })
        ]);

        // --------------------------------------------------
        // Personalized Home response
        // --------------------------------------------------


        return res.status(200).json({
            success: true,

            JumpBack: {
                title: "Jump Back to",
                type: "tracks",
                data: JumpBack.map(item => item.songId)
            },
            topsCard: topCards.map(item => item.songId).length<6?topCard:topCards.map(item => item.songId),
            sections: [

                {
                    title: "New Releases",
                    type: "albums",

                    // Personalized releases first.
                    // General albums are used when personalized
                    // results are less than or equal to 5.
                    data:
                        latestAlbums.length <= 8
                            ? [...albums]
                            : latestAlbums
                },

                {
                    title: "Latests Eps",
                    type: "albums",

                    // Fallback to general EPs if personalized
                    // EP results are insufficient.
                    data:
                        latestEps.length <= 8
                            ? [...eps]
                            : latestEps
                },

                {
                    title: "latests Singles",
                    type: "albums",

                    // Personalized singles first.
                    // General singles are used as fallback.
                    data:
                        latestSingles.length <= 8
                            ? [...singles]
                            : latestSingles
                },

                {
                    title: "You Also Like",
                    type: "artists",
                    data: youFollowArtists
                }
            ],

            follows: {
                albums: followedAlbumIds,
                artists: followedArtistIds
            }
        });

    } catch (err) {


        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}



async function historyTrack(req, res, next) {
    try {

        const { id } = req.params;
        const user = req.user;

        if (!mongoose.isValidObjectId(id)) {
            return next(new customError('Invaild mongo ObjectID', 400));
        };


        const [find_song, history_song_find] = await Promise.all([

            SongSchema.findById(id), // song kya hai 
            HistorySchema.findOne({
                songId: id,
                userId: user._id
            }) // old histoy dekho

        ]);

        if (!find_song) return next(new customError('song is not found', 400));



        if (history_song_find) {


            await HistorySchema.updateOne(
                {
                    userId: user._id,
                    songId: id
                },
                {
                    $inc: { playCount: 1 },
                    $set: { playAt: new Date() }
                })


            await SongSchema.updateOne(
                { _id: id },
                {
                    $inc: {
                        playCount: 1
                    }
                }
            );


            await ArtistSchema.updateMany(
                {
                    _id: { $in: find_song.artists }
                },
                {
                    $inc: {
                        playCount: 1
                    }
                }
            );

            return res.status(200).json({
                success: true,
                message: 'successfully history track'
            })


        }


        const createHistory = await HistorySchema.create({
            userId: user._id,
            songId: find_song._id,
            playAt: new Date(),
            playCount: 1
        });

        await SongSchema.updateOne(
            { _id: id },
            {
                $inc: {
                    playCount: 1
                }
            }
        );


        await ArtistSchema.updateMany(
            {
                _id: { $in: find_song.artists }
            },
            {
                $inc: {
                    playCount: 1
                }
            }
        );




        return res.status(200).json({
            success: true,
            message: 'successfully history track'
        })




    } catch (err) {
        next(err)
    }
}







module.exports = { historyTrack, refreshPage, SignUp, Check_Email_Give, UserCardsTops, likeSong };