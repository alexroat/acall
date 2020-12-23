import fs from "fs"
import https from "https"
import express from "express"
import expressWs from "express-ws"
import session from "express-session"
import { User, Room, MessageHandler} from "./all"

import Turn from 'node-turn'
        var turn = new Turn({
            listeningPort: 3477,
            authMech: 'long-term',
            credentials: {
                username: "password"
            }
        });
turn.start();

export  class App extends MessageHandler
{
    constructor()
    {
        super()
        this.port = 9123;
        this.user = {};
    }

    async startServer()
    {
        this.app = express()

        this.app.use(session({
            secret: 'supersegreto',
            resave: false,
            saveUninitialized: true,
            cookie: {secure: true}
        }))
        var privateKey = fs.readFileSync('./certs/server.key');
        var certificate = fs.readFileSync('./certs/server.cert');

        this.server = https.createServer({
            key: privateKey,
            cert: certificate
        }, this.app).listen(this.port, () =>
            console.log(`Example app listening at http://localhost:${this.port}`)
        )


        this.wsapp = expressWs(this.app, this.server)
        this.app.ws('/', (ws, req) => {
            const user = User.getUser(req.session.uid);
            req.session.uid = user.id;
            user.postMessage({type: "new_connection", ws, req});
        });


        this.app.use(express.static(__dirname + '/public'));
        this.app.get("/:id", (req, res, next) => {
            const u = User.getUser(req.session.uid)
            req.session.uid = u.id;
            res.sendFile(__dirname + "/public/index.html")
        })



    }

    static instance()
    {
        if (!App._instance)
            App._instance = new App()
        return App._instance;
    }
}

