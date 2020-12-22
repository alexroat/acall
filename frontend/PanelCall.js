import {Box, Html, Icon} from "wdg"
import ACallApp from "./ACallApp"
import PanelVideo from "./PanelVideo"

export default class PanelCall extends Box
{
    constructor(props)
    {
        super(props)
        this.video = new PanelVideo().appendTo(this, {p: 1}).toggleClass("chat-video")
        this.video.playLocal();

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

    getVideo(id)
    {
        var pv = this.find(PanelVideo).filter(p => p.props.id == id)[0]
        if (!pv)
            pv = new PanelVideo({id}).appendTo(this)
        return pv;
    }

    async getUserMedia(constraints = {audio: false, video: true})
    {
        return new Promise(function (resolve, reject) {

            navigator.getUserMedia(constraints, resolve, reject);
        })

    }

    async call(id)
    {
        const pc = await ACallApp.get().call(id)

    }


}


