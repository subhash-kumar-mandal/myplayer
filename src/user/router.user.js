
const express = require('express');
const { refreshPage,  likeSong, UserCardsTops, Check_Email_Give, SignUp, historyTrack, Logout } = require('./user.controller');
const userRouter = express.Router();
const verifyAccessToken = require('../../middlewares/VerifyAccesstoken')
const { sendOTP, verifyOtp } = require('../Otp/otp.controller');
const { Artist_Follow_toggle } = require('../follow/artistfollow/followArtist.controller');
const { Album_Follow_toggle } = require('../follow/albumfollow/followAlbum.controller');




userRouter.post('/signup', SignUp);  // signup karna
userRouter.get('/email/:email', Check_Email_Give); // fronted check for signup email validation

userRouter.post('/email/otp-sent', sendOTP);  // otp sent karna
userRouter.post('/email/otp-verify', verifyOtp);  // otp verify karna
userRouter.get('/refresh', refreshPage);  // refresh page karna
userRouter.post('/logout',Logout)


userRouter.post("/track/history/:id",verifyAccessToken,historyTrack)
userRouter.get('/randoms', verifyAccessToken, UserCardsTops)
userRouter.post('/artist-follow/:artistId',verifyAccessToken,Artist_Follow_toggle);
userRouter.post('/album-follow/:albumId',verifyAccessToken,Album_Follow_toggle)
userRouter.patch('/like/:userId/:songId', likeSong)  // likeSongs toggle ke liye 
 











module.exports = userRouter