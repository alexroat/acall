import {Box, Html, Icon, FloatingAction} from "wdg"


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

    async play(stream)
    {
        this.video.el.srcObject = stream;
    }

    async stop()
    {
        this.video.el.srcObject && this.video.el.srcObject.getTracks().forEach(t => t.stop())
        this.video.el.srcObject=null;
    }

    getStream()
    {
        return this.video.el.srcObject;
    }

    close()
    {
        const p = this.parent();
        p && (this.remove(), p.doLayout())
        return this;
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
        this.on("call-offer", ev => this.showCallAnswerDialog(ev.detail))
        this.on("call-answered", ev => this.getVideo(ev.detail.id));
        this.on("call-track", ev => this.getVideo(ev.detail.id).play(ev.detail.streams[0]));
        this.on("call-state", ev => {
            switch (ev.detail.state)
            {
                case "disconnected":
                case "closed":
                    const id = ev.detail.id;
                    this.getVideo(id).close()
                    delete this.peers[id];
                    if (!Object.entries(this.peers).length)
                        this.toggle(false).toggleLocalVideo(false)
                    break;
            }
            console.log(ev.detail.state, this.peers)

        });
        this.on("call-ice", async ev => {
            const msg = ev.detail;
            const id = msg.from;
            const pc = this.getPeer(id);
            try {
                await pc.addIceCandidate(new RTCIceCandidate(msg.ice));
            } catch (e) {
                console.error('Error adding received ice candidate', e, msg.ice);
            }
        });

        this.on("call-rxsignal", ev =>
            this.recvSignal(ev.detail)
        );

        new FloatingButton({icon: "phone", ignore: true}).toggleClass("calldrop").appendTo(this).on("click", ev => this.drop())

    }

    async toggleLocalVideo(enable)
    {
        const lv = this.getVideo();
        if (enable)
            lv.play(await this.getUserMedia());
        else
            lv.stop();
    }

    recvSignal(msg)
    {
        if (msg.offer)
        {
            console.log("OFFER", msg.offer)
            this.trigger("call-offer", msg)
        }
        if (msg.answer)
        {
            console.log("ANSWER", msg.answer)
            this.trigger("call-answer", msg)
        }
        if (msg.ice)
        {
            console.log("ICE", msg.ice)
            this.trigger("call-ice", msg)
        }
    }

    sendSignal(msg)
    {
        this.trigger("call-txsignal", msg);
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

    async call(id)
    {
        const pc = this.getPeer(id);
        await this.toggleLocalVideo(true)
        const localStream = this.getVideo().getStream()
        localStream.getTracks().forEach(track => {
            console.log("sending track");
            pc.addTrack(track, localStream)
        });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.sendSignal({type: "call", dest: id, offer});
        const answer = await new Promise((resolve, reject) => {
            this.on("call-answer", ev => {
                if (ev.detail.from == id)
                    resolve(ev.detail.answer);
            })
        });
        console.log("got answer")
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        return pc;
    }

    async answer(msg)
    {
        const id = msg.from;
        const pc = this.getPeer(id);
        await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
         await this.toggleLocalVideo(true)
        const localStream = this.getVideo().getStream()
        localStream.getTracks().forEach(track => {
            console.log("sending track");
            pc.addTrack(track, localStream)
        });

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.sendSignal({type: "call", dest: id, answer});
        this.trigger("call-answered", {id})
        return pc;
    }

    async drop()
    {
        for (var id in this.peers)
        {
            this.peers[id].close();
            this.trigger("call-state", {id, state: this.peers[id].connectionState})
        }
    }

    getPeer(id)
    {
        if (this.peers[id])
            return this.peers[id];
        const pc = new RTCPeerConnection(configuration);
        pc.addEventListener("connectionstatechange", ev => {
            console.log(ev);
            this.trigger("call-state", {id, state: pc.connectionState})
        })
        pc.addEventListener("track", ev => {
            console.log("TRACK", ev)
            this.trigger("call-track", {id, track: ev.track, streams: ev.streams})
        })
        pc.addEventListener('icecandidate', ice => {
            console.log("ice candidate", ice)
            this.sendSignal({type: "call", dest: id, ice: ice.candidate});
        });
        this.peers[id] = pc
        return pc;
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