


const ffmpeg = require('fluent-ffmpeg')
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobeInstaller = require("@ffprobe-installer/ffprobe")
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);



function getPreviewAudio(inputPath, outputPath, duration = 30) {

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .setStartTime(0)
            .setDuration(duration)
            .audioCodec("libmp3lame")
            .on('end', () => resolve(outputPath))
            .on('error', reject)
            .save(outputPath);
    })
};


module.exports = getPreviewAudio;