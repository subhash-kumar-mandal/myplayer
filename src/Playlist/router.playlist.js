

const express = require('express');
const { playlistCreate, playlist_Add_Song, getPlaylist_songs } = require('./playlist.controller');
const playlistRouter = express.Router();



playlistRouter.post('/create',playlistCreate); // create new playlist
playlistRouter.patch('/add-playlist/:songId/:playlistId',playlist_Add_Song) // add songs by songId and playlist Id 

playlistRouter.get('/:playlistId/songs',getPlaylist_songs) // giving playlist songs by playlistI


module.exports =playlistRouter