
const express = require('express');
const { SongCreate,  Track } = require('./song.controller');
const SongRouter = express.Router();
const upload = require('../../middlewares/uploadsong');
const verifyAccessToken  = require('../../middlewares/VerifyAccesstoken')
const authAdminMD  = require('../../middlewares/authAdmin');


// create song by album and artist By Id 
SongRouter.post('/create-album',verifyAccessToken,authAdminMD, upload.fields([
    {
        name: "audio",
        maxCount: 1
    },
    {
        name: "canvas",
        maxCount: 1
    }
]), SongCreate);   // create song by album and artist By Id 

SongRouter.get("/track/:id",verifyAccessToken, Track);
 

module.exports = SongRouter;