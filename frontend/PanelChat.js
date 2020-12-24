import {Box, Html, Icon} from "wdg"
import ACallApp from "./ACallApp"
import BubbleChat from "./BubbleChat"

export default class PanelChat extends Box
{
    constructor(props)
    {
        super(props)
        this.header = new Box({horizontal: 1}).appendTo(this, {w: 40}).toggleClass("chat-header")
        this.messages = new Html.Div().appendTo(this, {p: 1}).toggleClass("chat-message").css({overflow: "auto"})
        this.footer = new Box({horizontal: 1}).appendTo(this, {w: 40}).toggleClass("chat-footer")
        new Icon({icon: "smile"}).appendTo(this.footer, {w: 40}).toggleClass("chat-btn-emoji")
        this.input = new Html.TextArea().appendTo(this.footer, {p: 1}).toggleClass("chat-input");
        new Icon({icon: "paper-plane"}).appendTo(this.footer, {w: 40}).toggleClass("chat-btn-send").on("click", () => this.send())
        new Html.Div().text(this.props.name).appendTo(this.header, {p: 1}).toggleClass("chat-title");
        new Icon({icon: "phone"}).appendTo(this.header, {w: 40}).toggleClass("chat-btn-call").on("click", () => this.call())
        this.connect((ev) => this.refresh())

    }
    send()
    {
        const {id} = this.props;
        ACallApp.get().sendMessage({type: "chat", dest:id, text: this.input.val()})
        this.input.val("").el.focus();
    }
    call()
    {
        ACallApp.get().call(this.props.id)
    }
    scrollBottom()
    {
        this.messages.el.scrollTop = this.messages.el.scrollHeight;
        return this;
    }
    refresh()
    {
        const {id} = this.props;
        const msgs = Object.values(Wdg.state.messages).filter((m)=>m.from==id || m.dest==id)
        if (msgs.length != this.messages.children().length)
        {
            this.messages.removeAll();
            for (var msg of msgs)
                new BubbleChat({msg}).appendTo(this.messages);
        }
    }

}
