const TelegramBot = require('node-telegram-bot-api')
const path = require('path')
const dotenv = require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const fs = require('fs')
const downloadAudio = require('../Utility/AudioDownload')
const downloadVideo = require('../Utility/VideoDownload')
const URLVeirfy = require('../Utility/URLVerify')

const bot = new TelegramBot(process.env.TELEGRAM_API, { polling: true })

/**
 * @param {userId , Text} 
 * @return {Object}
 */

async function sendMessage(chatId = '', text = '' , extraOptions = {}) {
    try {
        text = text.trim()
        const result = await bot.sendMessage(chatId, text , extraOptions)

        if (!result)
            throw new Error("Error While Sending Message Via Telegram Bot")

        return {
            status: true,
            message: "Message Sent Successfuly"
        }
    }
    catch (err) {
        return {
            status: false,
            message: err.message
        }
    }
}

/**
 * @param {chatId , filePath}
 * @returns {Object}
 */

async function sendAudio(chatId = '', filePath = '') {
    try {
        const res = await bot.sendAudio(chatId, filePath, {}, {
            contentType: 'audio/mpeg',
            filename: path.basename(filePath)
        })

        fs.unlink(filePath, () => { })
        return {
            status: true,
            message: `Audio Sent Successfuly To ${chatId}`
        }
    }
    catch (err) {
        return {
            status: false,
            message: `Error While Sending The Audio File To ${chatId}`
        }
    }
}

/**
 * @param {chatId , filePath}
 * @returns {Object}
 */

async function sendVideo(chatId = '', filePath = '') {
    try {
        const res = await bot.sendVideo(chatId, filePath, {}, {
            contentType: 'video/mp4',
            filename: path.basename(filePath)
        })

        fs.unlink(filePath, () => { })
        return {
            status: true,
            message: `Video Sent Successfuly To ${chatId}`
        }
    }
    catch (err) {
        return {
            status: false,
            message: `Error While Sending The Video File To ${chatId}`
        }
    }
}

bot.on('message', async (msg) => {
    const chatId = msg.chat.id
    const youtubeURL = msg.text.trim()

    let isValidURL = URLVeirfy(youtubeURL)
    if (isValidURL.status === false) {
        await sendMessage(chatId, "Invalid Youtube URL")
        return
    }
    const videoId = isValidURL.videoId;

    const opts = {
        reply_markup: {
            inline_keyboard: [[
                { text: '🎧 Audio', callback_data: `audio|${youtubeURL}|${videoId}` },
                { text: '📹 Video', callback_data: `video|${youtubeURL}|${videoId}` }
            ]]
        }
    }

    await sendMessage(chatId, 'Choose:', opts)
})

bot.on('callback_query', async (q) => {
    const [type, url, videoId] = q.data.split('|')
    const chatId = q.message.chat.id
    await bot.answerCallbackQuery(q.id)

    try {
        if (type === 'audio') {
            const { status, outputFilePath } = await downloadAudio(url, videoId)
            if (status === false) {
                await sendMessage(chatId, "Internal Server Error 500 Unable To Download File Try Again Later Issue May Be Due to Extra Load On Server")
            }

            await sendMessage(chatId , "Wait Server is Preparing Your File")
            const response = await sendAudio(chatId, outputFilePath)
            if (response.status === true) {
                await sendMessage(chatId, "Your File Download Successfuly")
            }
            return
        }

        if (type === 'video') {
            const keyboard = {
                reply_markup: {
                    inline_keyboard: [[
                        { text: 'Low Quality', callback_data: `vid|0|${url}|${videoId}` },
                        { text: 'High Quality', callback_data: `vid|1|${url}|${videoId}` }
                    ]]
                }
            };
            await sendMessage(chatId, 'Select video quality:', keyboard);
            return;
        }

        if (type === 'vid') {
            const [, qualityNo, url, videoId] = q.data.split('|');
            const { status, outputFilePath } = await downloadVideo(url, videoId, Number(qualityNo));
            if (!status) {
                return await sendMessage(chatId, "Internal Server Error 500 – Unable To Download Video. Try Again Later.");
            }
            await sendMessage(chatId , "Wait Server is Preparing Your File")
            const response = await sendVideo(chatId, outputFilePath);
            if (response.status) {
                await sendMessage(chatId, "Your video downloaded successfully");
            }
        }
    }
    catch(err)
    {
        await sendMessage(chatId , "Server is Striclty Busy Due to Heavy Load Wait Developers Are Working On !!!!")
    }
})