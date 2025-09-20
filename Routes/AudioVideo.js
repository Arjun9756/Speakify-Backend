const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const router = express.Router()
const checkYoutubeURL = require('../Utility/URLVerify')
const downloadAudio = require('../Utility/AudioDownload')
const downloadVideo = require('../Utility/VideoDownload')
const fs = require('fs')

router.use(express.json())
router.use(express.urlencoded({extended:true}))

router.post('/downloadAudio' , async (req,res)=>{

    const {youtubeURL} = req.body
    if(!youtubeURL){
        return res.status(401).json({
            status:false,
            message:"No Youtube Video URL is Provided"
        })
    }   

    // Youtube URL Validity
    const isValidURL = checkYoutubeURL(youtubeURL)
    if(isValidURL.status === false){
        return res.status(401).json({
            status:false,
            message:"Invalid URL Youtube Format"
        })
    }
    const videoId = isValidURL.videoId
    // Download song from Youtube
    try {
        const {status, outputFilePath} = await downloadAudio(youtubeURL, videoId)
        if(status && outputFilePath && fs.existsSync(outputFilePath)){
            res.sendFile(outputFilePath, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                }
                fs.unlink(outputFilePath, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                });
            });
        } else {
            return res.status(501).json({
                status: false,
                message: "Failed to download audio"
            });
        }
    } catch (error) {
        console.error('Download error:', error);
        return res.status(501).json({
            status: false,
            message: error.message || "Internal Server Error"
        });
    }
})

router.post('/downloadVideo' , async (req,res)=>{
    const {youtubeURL , quality} = req.body
    if(!youtubeURL){
        return res.status(401).json({
            status:false,
            message:"Invalid Youtube URL"
        })
    }

    const isValidURL = checkYoutubeURL(youtubeURL)
    if(isValidURL.status === false){
        return res.status(401).json({
            status:false,
            message:"Invalid URL Youtube Format"
        })
    }
    const videoId = isValidURL.videoId
    try {
        const {status, outputFilePath} = await downloadVideo(youtubeURL, videoId, quality)
        if(status && outputFilePath && fs.existsSync(outputFilePath)){
            res.sendFile(outputFilePath, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                }
                fs.unlink(outputFilePath, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                });
            });
        } else {
            return res.status(501).json({
                status: false,
                message: "Failed to download video"
            });
        }
    } catch (error) {
        console.error('Download error:', error);
        return res.status(501).json({
            status: false,
            message: error.message || "Internal Server Error"
        });
    }
})

module.exports = router