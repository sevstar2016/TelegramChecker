const { Api, TelegramClient } = require("telegram")
const { StoreSession } = require("telegram/sessions")
const input = require("input")
const fs = require('fs')

const appId = 7104260;
const hash = '5168d523b6957d158b6b6928221b10c6'
const session = new StoreSession('session')

async function start() {
    console.log("Loading...")
    const client = new TelegramClient(session, appId, hash, {
      connectionRetries: 5,
    })
    // await client.start({
    //   phoneNumber: async () => await input.text("Please enter your number: "),
    //   phoneCode: async () => await input.text("Please enter the code you received: "),
    //   onError: (err) => console.log(err),
    // })
    await client.session.load()
    await client.connect()
    console.log("connected.")
    const result = await client.invoke(new Api.updates.GetState({}))
    const q = await result
    const r = await client.invoke(new Api.updates.GetDifference({
        pts: 109900,
        date: q.date,
        qts: q.qts
    }))

    const json = await r.toJSON()

    fs.writeFile('./users.json', JSON.stringify(json.users), err => {
        if(err){
            console.error(err)
            return
        }
    })
    fs.writeFile('./chats.json', JSON.stringify(json.newMessages), err => {
        if(err){
            console.error(err)
            return
        }
    })

    fs.writeFile('./delete.json', JSON.stringify(json.otherUpdates), err => {
        if(err){
            console.error(err)
            return
        }
    })

    console.log(await client.invoke(new Api.messages.GetMessages({
        id: [51288,
            51290,
            51289]
    })))
}

start()