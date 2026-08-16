const express = require('express');
const {  createAlbum,  GetSongsByAlbumIdPage, AlbumsName, homeClick } = require('./album.controller');
const albumRouter = express.Router();
const upload = require('../../middlewares/uploadAlbum');
const verifyAccessToken = require('../../middlewares/VerifyAccesstoken')

const AdminAuth= require('../../middlewares/authAdmin')

albumRouter.get('/admin/names', verifyAccessToken,AdminAuth,AlbumsName);
albumRouter.post('/create',verifyAccessToken,AdminAuth,upload.single('image'),createAlbum)  // album create ke liye 

albumRouter.get('/home/:releaseId',verifyAccessToken,homeClick)
albumRouter.get('/:releaseId',verifyAccessToken,GetSongsByAlbumIdPage)  //giving album and songs array 
    



module.exports = albumRouter