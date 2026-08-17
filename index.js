
const express = require('express');
const app = express();
const DBJoin = require('./configs/db.config');
const cors = require('cors')
const cookies_parse = require("cookie-parser")

const ArtistRouter = require('./src/Artist/router.artist');
const SongRouter = require('./src/Song/router.song');
const playlistRouter = require('./src/Playlist/router.playlist');
const userRouter = require('./src/user/router.user');
const albumRouter = require('./src/album/router.album');

const  Verify_JWT_TOKEN  = require('./middlewares/verifyJWT');


app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))
app.use(cookies_parse())
app.use(express.json())


app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

app.use('/album', albumRouter);
app.use('/artist', ArtistRouter);
app.use('/song', SongRouter);
app.use('/playlist', playlistRouter);
app.use('/user', userRouter)
app.get('/refresh-token',Verify_JWT_TOKEN);

app.get('/',(req,res)=>{
    res.status(200).json({
        success:true,
        message:'welcome my music player'
    })
})



app.use((err,req,res,next)=>{

    // console.log(err)
    res.status(err.statusCode || 500).json({
        success:false,
        message:err.message ||`Internal Server Error`
    })
})



DBJoin().then(() => {


    console.log("DB conneted succussfully")
    app.listen(process.env.PORT || 3000 , () => {
        console.log("server is starting ")
    })
})


