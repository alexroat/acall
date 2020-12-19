import App from "./app"

export default class Connection
{
    constructor(app, ws, req)
    {
        this.app = app;
        this.ws = ws;
        this.reqq = req;
        this.id = Math.random();
        Connection.pool[this.id] = this;
        this.ws.on('message', (msg) =>
            this.app.onMessage({...JSON.parse(msg), id: this.id}, this.id)
        );
        this.ws.on('close', (msg) =>
            delete Connection.pool[this.id]
        );
    }
    static pool = {};

    send(msg)
    {
        this.ws.send(JSON.stringify(msg))
    }
    static sendToAll(msg)
    {
        for (var id in Connection.pool)
            Connection.pool[id].send(msg)
    }

}


