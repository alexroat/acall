import {Box, Html, Icon} from "wdg"
import ACallApp from "./ACallApp"
import PanelCall from "./PanelCall"
import BubbleChat from "./BubbleChat"

export default class PanelChat extends Box
{
    constructor(props)
    {
        super(props)
        this.header = new Box({horizontal: 1}).appendTo(this, {w: 40}).toggleClass("chat-header")
        this.messages = new Html.Div().appendTo(this, {p: 1}).toggleClass("chat-message").css({overflow:"auto"})
        this.footer = new Box({horizontal: 1}).appendTo(this, {w: 40}).toggleClass("chat-footer")
        new Icon({icon: "smile"}).appendTo(this.footer, {w: 40}).toggleClass("chat-btn-emoji")
        this.input = new Html.TextArea().appendTo(this.footer, {p: 1}).toggleClass("chat-input");
        new Icon({icon: "paper-plane"}).appendTo(this.footer, {w: 40}).toggleClass("chat-btn-send").on("click", () => this.send())
        new Html.Div().text("Chat").appendTo(this.header, {p: 1}).toggleClass("chat-title");
        new Icon({icon: "phone"}).appendTo(this.header, {w: 40}).toggleClass("chat-btn-call").on("click", () => this.call())
        this.on("chat", (ev) => {this.messages.append(new BubbleChat({msg: ev.detail}));this.scrollBottom()})

    }
    send()
    {
        ACallApp.get().sendMessage({type: "chat", text: this.input.val()})
        this.input.val("").el.focus();
    }
    call()
    {
        const pc = new PanelCall();
        ACallApp.get().setContent(pc)
        pc.playLocal();
    }
    scrollBottom()
    {
        this.messages.el.scrollTop = this.messages.el.scrollHeight;
        return this;
    }

}
