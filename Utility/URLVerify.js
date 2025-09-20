/**
 * @param {youtubeURL} youtubeURLVerificaion
 * @returns {Object}
 */

function isValidURL(url = '') {
    try {
        const parsedURL = new URL(url)
        // Case 1: www.youtube.com/watch?v=VIDEO_ID
        if(parsedURL.hostname === 'www.youtube.com' || parsedURL.hostname === 'youtube.com')
        {
            const videoId = parsedURL.searchParams.get('v')
            if(videoId && videoId.length === 11)
                return {status:true , message:"Valid Youtube URL" , videoId}

            throw new Error("Invalid Youtube URL")
        }
        
        // Case 2: https://youtu.be/VIDEO_ID
        if(parsedURL.hostname === 'youtu.be')
        {
            const videoId = parsedURL.pathname.slice(1)
            if(videoId && videoId.length === 11)
                return {status:true , message:"Valid Youtube URL" , videoId}
            throw new Error("Invalid Youtube URL")
        }
    }
    catch (error) {
        return {
            status:false,
            message:error.message
        }
    }
}

// isValidURL("https://youtu.be/dQw4w9WgXcQ")
module.exports = isValidURL