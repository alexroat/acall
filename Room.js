import {User} from "./all";
//const wrtc = {RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, MediaStream} = require('wrtc');
import wrtc, {RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, MediaStream} from "wrtc"
import Peer from 'simple-peer'

export class Room extends User
{
    constructor()
    {
        super()
        this.name = `Room ${this.id}`
        this.peers = {};
        this._evl = {};
        this.streams = {};
    }

    handle_chat(msg)
    {
        for (var i in this.contacts)
            if (msg.from != i && i != this.id)
                this.contacts[i].postMessage(msg)
    }

    handle_call(msg)
    {
        const {from, dest, id} = msg;
        if (msg.signal)
            this.signal(msg)
    }

    trigger(event, detail)
    {
        for (var l of this._evl[event] || [])
            l.call(this, {event, detail})
        return this
    }
    on(event, fn)
    {
        if (!this._evl[event])
            this._evl[event] = new Set()
        this._evl[event].add(fn);
        return this;
    }

    sendChat(text)
    {
        this.postMessage({type: "chat", from: this.id, dest: this.id, text})
    }

    //  see this https://stackoverflow.com/questions/59546739/using-simple-peer-to-broadcast-live-webcam-video-nodejs



    createPeer(id, dest, opt)
    {
        console.log("CREATING PEER", id, dest)
        const pc = new Peer({wrtc, ...opt})
        pc.id = id
        pc.on("signal", signal => User.getUser(dest).postMessage({type: "call", id, dest, signal}))
        pc.on("connect", async _ =>
        {
            for (var i in this.streams)
                pc.addStream(this.streams[i])
        })
        pc.on('stream', stream => {
            stream.pc = pc;
            this.streams[stream.id] = stream
            stream.addEventListener("removetrack", t => console.log("TRACK REMOVED", t))
            //cast stream to all the conenctions
            for (var i in this.peers)
                this.peers[i].addStream(stream)
        })
        const close = _ => {
            console.log(`closing ${id}`)
            Object.values(this.streams).filter(s => s.pc == pc).forEach(s => {
                Object.values(this.peers).filter(p => p != pc).forEach(p => p.removeStream(s));
                delete this.streams[s.id];
            })
            delete this.peers[id];
        };
        pc.on('close', close)
        pc.on('error', close)
        this.peers[id] = pc;
        return pc;
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
            url: `turn:localhost:3478`,
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