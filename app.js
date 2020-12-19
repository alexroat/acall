import fs from "fs"
import https from "https"
import express from "express"
import expressWs from "express-ws"

import Connection from "./connection"

export default class App
{
    constructor()
    {
        this.port = 9000;

    }

    async startServer()
    {
        this.app = express()
        var privateKey = fs.readFileSync('./certs/server.key');
        var certificate = fs.readFileSync('./certs/server.cert');

        this.server = https.createServer({
            key: privateKey,
            cert: certificate
        }, this.app).listen(this.port, () =>
            console.log(`Example app listening at http://localhost:${this.port}`)
        )

        
        this.wsapp = expressWs(this.app, this.server)
        this.app.use(express.static('public'));

        this.app.ws('/', (ws, req) =>
            new Connection(this, ws, req)
        );
    }

    sendMessage(id, data)
    {
        this.conn[id].send(data)
    }

    onMessage(msg, id)
    {
        console.log(id, msg)
        Connection.sendToAll(msg)
    }

    static instance()
    {
        if (!App._instance)
            App._instance = new App()
        return App._instance;
    }
}

