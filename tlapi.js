const { Api, TelegramClient } = require("telegram")
const { StoreSession } = require("telegram/sessions")
const input = require("input")
const fs = require('fs');

class tlapi {
    constructor(appId, hash) {
        this.session = new StoreSession('session')
        console.log("Loading...")
        this.client = new TelegramClient(this.session, appId, hash, {
            connectionRetries: 5
        })

        this.diff
        this.result
        this.lpts
    }

    async login() {
        await this.client.start({
            phoneNumber: async() => await input.text("Please enter your number: "),
            phoneCode: async() => await input.text("Please enter the code you received: "),
            onError: (err) => console.log(err),
        })
        this.client.connect()
        console.log("connected.")
    }

    async load() {
        await this.client.connect()
        console.log("connected.")
    }

    async logInit() {
        this.result = await this.client.invoke(new Api.updates.GetState({}))
        this.diff = await this.client.invoke(new Api.updates.GetDifference({
            pts: this.result.pts - 2,
            date: this.result.date,
            qts: this.result.qts,
            ptsTotalLimit: 30
        }))
        this.lpts = this.result.pts - 2
    }

    async log() {
        while (true) {
            this.result = await this.client.invoke(new Api.updates.GetState({}))

            if (this.lpts !== this.result.pts - 2) {
                let json = await this.diff.toJSON()

                fs.writeFile('./users.json', JSON.stringify(json.users), err => {
                    if (err) {
                        console.error(err)
                        return
                    }
                })

                fs.writeFile('./delete.json', JSON.stringify(json.otherUpdates), err => {
                    if (err) {
                        console.error(err)
                        return
                    }
                })

                let history = []
                let messages = ''

                fs.readFile('./history.json', 'utf-8', async(err, data) => {
                    if (err) {
                        console.log(err)
                        fs.writeFileSync('./history.json', '')
                        return
                    }
                    try {
                        history = JSON.parse(data)
                        history.push(json.otherUpdates)
                    } catch {
                        history = json.otherUpdates
                    }

                    fs.writeFile('./history.json', JSON.stringify(history), err => {
                        if (err) {
                            console.error(err)
                            return
                        }
                    })

                    history.forEach(struct => {
                        try {
                            messages += struct.message.message + '\n'
                        } catch {
                            console.log(struct)
                        }
                    });
                    fs.writeFile('./messages', messages, err => {
                        if (err)
                            return
                    })
                })


                this.diff = await this.client.invoke(new Api.updates.GetDifference({
                    pts: this.lpts,
                    date: this.result.date,
                    qts: this.result.qts,
                    ptsTotalLimit: 30
                }))
                this.lpts += 1
                console.log("Updated")
            }
        }
    }
}

module.exports = {
    tlapi
}