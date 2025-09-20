const fs = require('fs')
const ytdl = require('@distube/ytdl-core')
const path = require('path')

// If Folder is Not Created on the Server

const downloadDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'AudioDownload');
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

/**
 * @param {youtubeURL} takeYoutubeURLthenDownloadSong
 * @returns {Promise<Object>} ObjectofFilepath
 */

async function downloadAudio(youtubeURL = '', videoId = '') {
    return new Promise((resolve, reject) => {

        const outputFilePath = path.join(downloadDir, `${Date.now()}_${videoId}.mp3`)
        const cleanURL = youtubeURL.trim()

        const audioStream = ytdl(cleanURL, {
            filter: "audioonly", quality: "highestaudio", requestOptions: {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114 Safari/537.36",
                    "Accept-Language": "en-US,en;q=0.9"
                }
            }
        })
        const writeStream = fs.createWriteStream(outputFilePath)

        audioStream.pipe(writeStream)
        writeStream.on('finish', () => {
            resolve({
                status: true,
                outputFilePath,
                message: 'Download successful'
            })
        })

        audioStream.on('error', (err) => {
            writeStream.destroy()
            fs.unlink(outputFilePath, () => { })
            reject({
                status: false,
                outputFilePath: null,
                message: 'Write error: ' + err.message
            })
        })

        writeStream.on('error', (err) => {
            fs.unlink(outputFilePath, () => { });
            reject({
                status: false,
                outputFilePath: null,
                message: 'Write error: ' + err.message
            });
        });
    })
}

// (async () => {
//     try {
//         const result = await downloadVideo(
//             "https://www.youtube.com/watch?v=8_IjOqoJ5ZE",
//             "345",
//         )
//         console.log(result)
//     } catch (err) {
//         console.error(err)
//     }
// })()


module.exports = downloadAudio