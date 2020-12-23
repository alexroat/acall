import {Box, Html, Icon} from "wdg"
import ACallApp from "./ACallApp"
import PanelVideo from "./PanelVideo"

export default class PanelCall extends Box
{
    constructor(props)
    {
        super(props)
        this.getVideo().playLocal();
    }

    getVideo(id)
    {
        var pv = this.find(PanelVideo).filter(p => p.props.id == id)[0]
        if (!pv)
            pv = new PanelVideo({id}).appendTo(this, {p: 1}, true);
        return pv;
    }
    

    async getUserMedia(constraints = {audio: true, video: true})
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


