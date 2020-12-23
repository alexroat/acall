import {Box, Html, Icon} from "wdg"
import ACallApp from "./ACallApp";

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

export default class PanelVideo extends Html.Div
{
    constructor(props)
    {
        super(props)
        this.video = new Html.Video().attr({autoplay: 1}).appendTo(this).toggleClass("chat-video")
    }


    async getUserMedia(constraints = {audio: false, video: true})
    {
        return new Promise(function (resolve, reject) {

            navigator.getUserMedia(constraints, resolve, reject);
        })

    }
    
    async play(stream)
    {
        this.video.el.srcObject = stream;
    }

    async playLocal()
    {
        this.play(await this.getUserMedia());
    }
    
    close()
    {
        const p = this.parent();
        p && (this.remove(),p.doLayout())
        return this;
    }

}

