const { tlapi } = require('./tlapi')
require('dotenv').config()

const appId = Number(process.env.appId)
const hash = process.env.hash
const tlApi = new tlapi(appId, hash)

async function start() {
    await tlApi.load()
    await tlApi.logInit()
    await tlApi.log()
}

start()