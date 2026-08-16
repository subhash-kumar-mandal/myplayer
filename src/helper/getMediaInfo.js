

const ffmpeg = require('fluent-ffmpeg')
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobeInstaller = require("@ffprobe-installer/ffprobe")
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);



function getMediaInfo(filepath) {

    return new Promise((resolve, reject) => {

        ffmpeg.ffprobe(filepath, (err, metadata) => {
            if (err) {
                return reject(err)
            };

            resolve(metadata);
        });
    });
}

module.exports = getMediaInfo;;