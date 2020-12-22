import {Wdg, App, Box, ColoredBox} from "wdg"
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

    async call(id)
    {
        const pc = await this.getPeer(id);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.sendMessage({type: "call", dest: id, offer});
        return pc
    }

    async getPeer(id)
    {
        if (this.peers[id])
            return this.peers[id];
        var vp;
        const pc = new RTCPeerConnection(configuration);
        this.peers[id] = pc
        pc.addEventListener('icecandidate', ice => {
            this.sendMessage({type: "call", dest: id, ice: ice.candidate});
        });
        pc.addEventListener('connectionstatechange', event => {
            console.log(event)
            console.log(pc.connectionState)
            if (vp && pc.connectionState == "disconnected")
                vp.remove(), vp = null, delete this.peers[id];
        });
        pc.addEventListener("addstream", e => {
            console.log(e)
            vp = new PanelVideo({id}).appendTo(this.getPanelCall(), {p: 1}, true)
            vp.video.el.srcObject = e.stream;
        }, false);
        const localStream = await this.getUserMedia();
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        localStream.addEventListener("removestream", e => {
            console.log(e)
        })
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
        const pc = await this.getPeer(msg.from);
        if (msg.offer)
        {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.sendMessage({type: "call", dest: msg.from, answer});
        }
        if (msg.answer)
        {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
        }
        if (msg.ice)
        {
            try {
                await pc.addIceCandidate(msg.ice);
            } catch (e) {
                console.error('Error adding received ice candidate', e);
            }
        }
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
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        },
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