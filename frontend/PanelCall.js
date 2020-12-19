import {Box, Html, Icon} from "wdg"
import ACallApp from "./ACallApp"
import PanelVideo from "./PanelVideo"

export default class PanelCall extends Box
{
    constructor(props)
    {
        super(props)
        this.video = new PanelVideo().appendTo(this, {p: 1}).toggleClass("chat-video")
    }
    send()
    {
        ACallApp.get().send({type: "msg", text: this.input.val()})
        this.input.val("").el.focus();
    }
    async playLocal()
    {
        return this.video.playLocal();

    }

}