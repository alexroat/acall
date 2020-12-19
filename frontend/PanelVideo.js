import {Box, Html, Icon} from "wdg"
import ACallApp from "./ACallApp"

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

export default class PanelVideo extends Box
{
    constructor(props)
    {
        super(props)
        this.video = new Html.Video().attr({autoplay: 1}).appendTo(this, {p: 1}).toggleClass("chat-video")
    }

    async getUserMedia(constraints = {audio: false, video: true})
    {
        return new Promise(function (resolve, reject) {

            navigator.getUserMedia(constraints, resolve, reject);
        })

    }
    
    async playLocal()
    {
        const stream= await this.getUserMedia();
        this.video.el.srcObject = stream;

    }

}