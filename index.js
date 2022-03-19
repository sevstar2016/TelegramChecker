const { tlapi } = require('./tlapi')
require('dotenv').config()

const appId = process.env.appId;
const hash = process.env.hash
const tlApi = new tlapi(appId, hash)

async function start() {
    tlApi.load()
}

start().then(() => {
    console.log("DONE!")
})