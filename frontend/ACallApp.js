import {Wdg, App, Box, ColoredBox, Html} from "wdg"
import PanelContacts from "./PanelContacts"
import PanelChat from "./PanelChat"
import PanelCall from "./PanelCall"
import PanelVideo from "./PanelVideo"

export default class ACallApp extends App
{
    constructor(props)
    {
        super(props)
        ACallApp.state = {name: "user", contacts: {}, messages: {}}
        this.header = new ColoredBox().appendTo(this, {w: "auto"}).text("A Call")
        this.main = new Box().appendTo(this, {p: 1})
        this.footer = new ColoredBox().appendTo(this, {w: 30})
        this.peers = {}

        this.setContent(new PanelContacts())

        this.connect((ev) => this.header.text(Wdg.state.name), true)
        this.connectWS()


        this.on("call-offer", ev => this.showCallAnswerDialog(ev.detail))
        this.on("call-answered", ev => this.getPanelCall().getVideo(ev.detail.id));
        this.on("call-track", ev => this.getPanelCall().getVideo(ev.detail.id).play(ev.detail.streams[0]));
    }

    async showCallAnswerDialog(msg)
    {
        this.answer(msg);
        //new Html.Div().appendTo(this, {w: 50}, true).on("click", ev => this.answer(msg)).css({background: "lightgreen"})
    }

    setContent(x)
    {
        this.main.removeAll().append(x, {p: 1}).doLayout();
    }
    connectWS()
    {
        this.conn = new WebSocket(((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host);
        this.conn.addEventListener('message', (event) => {
            const msg = JSON.parse(event.data)
            const act = this[`handleremote_${msg.type}`]
            if (act)
                act.call(this, msg)
        });
    }
    sendMessage(msg)
    {
        this.conn.send(JSON.stringify(msg))
    }
    handleremote_chat(msg)
    {
        const {id, contacts, messages} = ACallApp.state
        messages[msg.id] = msg
        ACallApp.state = {...ACallApp.state}
    }
    handleremote_state(msg)
    {
        ACallApp.state = {...ACallApp.state, ...msg}
    }

    getPanelCall()
    {
        var pc = this.find(PanelCall)[0]
        if (!pc)
        {
            pc = new PanelCall()
            this.setContent(pc)
        }
        return pc;
    }

    getPeer(id)
    {
        if (this.peers[id])
            return this.peers[id];
        const pc = new RTCPeerConnection(configuration);
        pc.addEventListener("connectionstatechange", ev => {
            console.log(ev);
            this.trigger("call-state",{id,state:pc.connectionState})
        })
        pc.addEventListener("track", ev => {
            console.log("TRACK",ev)
            this.trigger("call-track",{id,track:ev.track,streams:ev.streams})
        })
        pc.addEventListener('icecandidate', ice => {
            console.log("ice candidate", ice)
            this.sendMessage({type: "call", dest: id, ice: ice.candidate});
        });
        this.peers[id] = pc
        return pc;
    }

    async getUserMedia(constraints = {audio: true, video: true})
    {
        return new Promise(function (resolve, reject) {

            navigator.getUserMedia(constraints, resolve, reject);
        })

    }

    async handleremote_call(msg)
    {
        const id = msg.from
        const pc = this.getPeer(id);
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
            try {
                console.log(id)
                await pc.addIceCandidate(new RTCIceCandidate(msg.ice));
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        }
    }

    async call(id, localStream)
    {
        const pc = this.getPeer(id);
        localStream = localStream || await this.getUserMedia();
        localStream.getTracks().forEach(track => {
            console.log("sending track");
            pc.addTrack(track, localStream)
        });
        
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.sendMessage({type: "call", dest: id, offer});
        const answer = await new Promise((resolve, reject) => {
            this.on("call-answer", ev => {
                if (ev.detail.from == id)
                    resolve(ev.detail.answer);
            })
        });
        console.log("got answer")
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        
        //add new video Panel
//        this.getPanelCall().addRemoteVideo(id, pc);
        return pc;
    }

    async answer(msg, localStream)
    {
        const id = msg.from;
        const pc = this.getPeer(id);
        await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
        localStream = localStream || await this.getUserMedia();
        localStream.getTracks().forEach(track => {
            console.log("sending track");
            pc.addTrack(track, localStream)
        });
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.sendMessage({type: "call", dest: id, answer});
        this.trigger("call-answered",{id})
        return pc;
    }

    createRoom()
    {
        this.sendMessage({type: "room_create"})
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