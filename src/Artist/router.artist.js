
const express = require('express');
const ArtistRouter = express.Router();
const {CreateArtist,  artistPageData, getArtists_Songs_Albums_Counts, GiveArtistName, homeArtistClick} = require('./artist.controller')
const upload = require('../../middlewares/multer')
const verifyAccessToken = require('../../middlewares/VerifyAccesstoken')
const authMD = require('../../middlewares/authAdmin')


ArtistRouter.get('/:artistId',verifyAccessToken,artistPageData) // get artist page  Album and Info and Songs
ArtistRouter.get('/home/:artistId',verifyAccessToken,homeArtistClick)
ArtistRouter.get("/admin/get-all",getArtists_Songs_Albums_Counts);

ArtistRouter.get('/admin/names',verifyAccessToken,authMD,GiveArtistName);
ArtistRouter.post('/create',verifyAccessToken,authMD,upload.single('image') ,CreateArtist);  // Create Artist







module.exports = ArtistRouter;