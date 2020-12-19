

import {App, Box, ColoredBox} from "wdg"
import PanelContacts from "./PanelContacts"
import PanelChat from "./PanelChat"

export default class ACallApp extends App
{
    constructor(props)
    {
        super(props)

        this.header = new ColoredBox().appendTo(this, {w: "auto"}).text("A Call")
        this.main = new Box().appendTo(this, {p: 1})
        this.footer = new ColoredBox().appendTo(this, {w: 30})

        this.setContent(new PanelContacts())
        this.connect()
    }
    setContent(x)
    {
        this.main.removeAll().append(x, {p: 1}).doLayout();
    }
    connect()
    {

        this.conn = new WebSocket(((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host);
        this.conn.addEventListener('message', (event) =>
            this.onMessage(JSON.parse(event.data))
        );
    }
    sendMessage(msg)
    {
        this.conn.send(JSON.stringify(msg))
    }
    onMessage(msg)
    {
        console.log(msg)
        for (var pc of this.find(PanelChat))
            pc.trigger("chat",msg)
    }
}

