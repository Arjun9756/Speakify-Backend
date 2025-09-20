const fs = require('fs')
const ytdl = require('@distube/ytdl-core')
const path = require('path')

// If Folder is Not Created on the Server

const downloadDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'VideoDownload');
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

/**
 * 
 * @param {YoutubeURL} youtubeURL 
 * @param {uniqueVideoID} videoId 
 * @param {QualityOfVideo} qualityNo 
 * @returns {Object}
 */

async function downloadVideo(youtubeURL = '' , videoId = '' , qualityNo = 1){
    return new Promise((resolve , reject)=>{

        const cleanURL = youtubeURL.trim()
        const outputFilePath = path.join(downloadDir, `${Date.now()}_${videoId}.webm`)

        const videoStream = ytdl(cleanURL , {filter:"audioandvideo" , quality:(qualityNo === 1 ? "highestvideo" : "lowestvideo")})
        const writeStream = fs.createWriteStream(outputFilePath)
        
        videoStream.pipe(writeStream)
        writeStream.on('finish' , ()=>{
            resolve({
                status:true,
                outputFilePath,
                message:"Download Successful"
            })
        })

        videoStream.on('error' , (err)=>{
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
//             1
//         )
//         console.log(result)
//     } catch (err) {
//         console.error(err)
//     }
// })()

module.exports = downloadVideo