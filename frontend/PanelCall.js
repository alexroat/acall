import {Box, Html, Icon, FloatingAction, App, ColoredBox} from "wdg";
import Peer from "simple-peer"

        const closeStream = (s) => s && s.getTracks().forEach(t => t.stop())


export class PanelVideo extends Html.Div
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

    setMuted(muted)
    {
        this.video.attr({muted})
        return this;
    }

    play(stream)
    {
        this.stream = stream;
        return this;
    }

    stop()
    {
        this.stream = null;
        return this;
    }

    get stream()
    {
        return this.video.el.srcObject;
    }
    
    set stream(s)
    {
        this.video.el.srcObject=s;
        return s;
    }

    close()
    {
        const p = this.parent();
        p && (this.remove(), p.doLayout())
        return this;
    }

}


class PanelVideoLocal extends PanelVideo
{
    set stream(s)
    {
        this._s=s
        this.video.el.srcObject=s&&new MediaStream(s.getVideoTracks())
        return s;
    }
    get stream()
    {
        return this._s;
    }
}

export class FloatingButton extends Icon
{
    constructor(props)
    {
        super(props)
    }
}

export class PanelCall extends Box
{
    constructor(props)
    {
        super(props)
        this.peers = {}
        this.streams={}
        new FloatingButton({icon: "phone", ignore: true}).toggleClass("calldrop").appendTo(this).on("click", ev => this.drop())
        //new ColoredBox().appendTo(this,{p:1});
    }

    async toggleLocalVideo(enable)
    {
        const lv = this.getVideo();
        if (enable)
        {
            const ls = await this.getLocalStream();
            const s = new MediaStream(ls.getVideoTracks())
            lv.play(s)
        } else
            this.stopLocalStream(), lv.stop();
    }

    async showCallAnswerDialog(msg)
    {
        this.answer(msg);
        //new Html.Div().appendTo(this, {w: 50}, true).on("click", ev => this.answer(msg)).css({background: "lightgreen"})
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

    async getLocalStream()
    {
        if (!this.localstream)
            this.localstream = await this.getUserMedia()
        return this.localstream;
    }

    async stopLocalStream()
    {
        closeStream(this.localstream)
        this.localstream = null;
    }

    createPeer(id, dest, opt)
    {
        const pc = new Peer(opt)
        pc.on("signal", signal => App.get().sendMessage({type: "call", id, dest, signal}))
        pc.on("connect", async _ =>
        {
            this.toggle(true)
            const localstream = await this.getUserMedia();
            new PanelVideoLocal().prependTo(this,{p:1},true).play(localstream)
            pc.addStream(localstream)
        })
        pc.on('stream', stream =>
            this.addStream(stream, pc, id, dest)
        )
        const close = _ => {
            Object.values(this.streams).filter(s => s.pc == pc).forEach(s => this.removeStream(s))
            delete this.peers[id];
            if (!Object.entries(this.peers).length)
            {
                this.toggle(false)
                this.find(PanelVideoLocal).forEach(pv=>pv.stop().remove(true))
            }
        };
        pc.on('close', close)
        pc.on('error', close)
        this.peers[id] = pc;
        return pc;
    }
    addStream(stream, pc, id, dest)
    {
        stream.pc = pc;
        stream.addEventListener('removetrack', t => stream.getTracks().length == 0 && this.removeStream(stream));
        const pv = new PanelVideo({pc, id, user: dest}).appendTo(this, {p: 1}, true);
        pv.play(stream)
        this.streams[stream.id] = stream;
    }
    removeStream(stream)
    {    
        this.find(PanelVideo).filter(pv => pv.stream == stream).forEach(pv => pv.remove(true))
        delete this.streams[stream.id];
    }

    getVideoByPc(pc)
    {
        return this.find(VideoPanel).filter(p => p.props.pc == pc)
    }

    getVideoByStream(stream)
    {
        return this.find(VideoPanel).filter(p => p.stream == stream)
    }

    getVideoById(id)
    {
        return this.find(VideoPanel).filter(p => p.props.id == id)
    }

    async call(dest)
    {

        const pc = this.createPeer(Math.random(), dest, {configuration, initiator: true})

    }

    signal(msg)
    {
        const {id, signal, from} = msg;
        if (!this.peers[id])
            this.createPeer(id, from, {configuration})
        if (signal)
            setTimeout(() => this.peers[id].signal(signal), 0);
    }

    async answer(msg)
    {

    }

    async drop(id)
    {
        if (this.peers[id])
            this.peers[id].destroy();
        if (!id)
            for (var id in this.peers)
                this.drop(id)
    }

}



const configuration = {iceServers: [

//        {url: 'stun:stun01.sipphone.com'},
//        {url: 'stun:stun.ekiga.net'},
//        {url: 'stun:stun.fwdnet.net'},
//        {url: 'stun:stun.ideasip.com'},
//        {url: 'stun:stun.iptel.org'},
//        {url: 'stun:stun.rixtelecom.se'},
//        {url: 'stun:stun.schlund.de'},
        {
            url: `turn:${window.location.hostname}:3478`,
            credential: 'password',
            username: 'username'
        },
//        {
//            url: `turn:${window.location.hostname}:3477`,
//            credential: 'password',
//            username: 'username'
//        },
        {url: 'stun:stun.l.google.com:19302'},
        {url: 'stun:stun1.l.google.com:19302'},
        {url: 'stun:stun2.l.google.com:19302'},
        {url: 'stun:stun3.l.google.com:19302'},
        {url: 'stun:stun4.l.google.com:19302'},
//        {url: 'stun:stunserver.org'},
//        {url: 'stun:stun.softjoys.com'},
//        {url: 'stun:stun.voiparound.com'},
//        {url: 'stun:stun.voipbuster.com'},
//        {url: 'stun:stun.voipstunt.com'},
//        {url: 'stun:stun.voxgratia.org'},
//        {url: 'stun:stun.xten.com'},
//        {
//            url: 'turn:numb.viagenie.ca',
//            credential: 'muazkh',
//            username: 'webrtc@live.com'
//        },
//        {
//            url: 'turn:192.158.29.39:3478?transport=udp',
//            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
//            username: '28224511:1379330808'
//        },
//        {
//            url: 'turn:192.158.29.39:3478?transport=tcp',
//            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
//            username: '28224511:1379330808'
//        }
    ]}