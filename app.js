const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const cors = require('cors')
const AudioVideo = require('./Routes/AudioVideo')
const Telegram = require('./Telegram/Telegram')

const app = express()
app.use(cors({
    origin:"*"
}))

dotenv.config({
    path:path.join(__dirname , '.env')
})

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/AudioVideo' , AudioVideo)

app.listen(process.env.PORT || 3000 , ()=>{
    console.log(`Server is Running ${process.env.PORT || 3000}`)
})