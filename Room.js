import {User} from "./all"
        const {RTCPeerConnection, RTCIceCandidate, RTCSessionDescription} = require('wrtc');
export class Room extends User
{
    constructor()
    {
        super()
        this.name = `Room ${this.id}`
        this.peers = {};
        this._evl = {};


        this.on("call-answered", ev => console.log("CALL ANSWERED"));
        this.on("call-track", ev => console.log("NEW TRACK"));
//        this.on("call-terminate", ev => this.terminate(ev.detail.from))
        this.on("call-state", ev => {
            switch (ev.detail.state)
            {
                case "disconnected":
                case "closed":
                    const id = ev.detail.id;
                    delete this.peers[id];
                    break;
            }
        });
    }

    handle_chat(msg)
    {
        for (var i in this.contacts)
            if (msg.from != i && i != this.id)
                this.contacts[i].postMessage(msg)
    }

    async handle_call(msg)
    {
        if (msg.offer)
        {
            this.answer(msg)
        }
        if (msg.answer)
        {
            //console.log("ANSWER", msg)
            this.trigger("call-answer", msg)
        }
        if (msg.ice)
        {
            const pc = this.getPeer(msg.from);
            try {
                await pc.addIceCandidate(new RTCIceCandidate(msg.ice));
            } catch (e) {
                console.error('Error adding received ice candidate', e, msg.ice);
            }
        }
        if (msg.terminate)
        {
            //console.log("TERMINATE", msg)
            this.trigger("call-terminate", msg)
        }
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

    sendSignal(msg)
    {
        msg.from = this.id;
        this.postMessage(msg)
        return this;
    }

    getPeer(id)
    {
        if (this.peers[id])
            return this.peers[id];
//        const pc = new RTCPeerConnection(configuration);
        const pc = new RTCPeerConnection({
            portRange: {
                min: 10000, // defaults to 0
                max: 20000  // defaults to 65535
            }
        });
        pc.addEventListener("connectionstatechange", ev =>
            this.trigger("call-state", {id, state: pc.connectionState})
        )
        pc.addEventListener("track", ev =>
            this.trigger("call-track", {id, track: ev.track, streams: ev.streams})
        )
        pc.addEventListener('icecandidate', ice =>
            this.sendSignal({type: "call", dest: id, ice: ice.candidate})
        );
        this.peers[id] = pc
        return pc;
    }

    async call(id)
    {
        const pc = this.getPeer(id);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        this.sendSignal({type: "call", dest: id, offer});
        const answer = await new Promise((resolve, reject) => {
            this.on("call-answer", ev => {
                if (ev.detail.from == id)
                    resolve(ev.detail.answer);
            })
        });
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        return pc;
    }

    async answer(msg)
    {
        const id = msg.from;
        const pc = this.getPeer(id);
        await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.sendSignal({type: "call", dest: id, answer});
        this.trigger("call-answered", {id})
        return pc;
    }

    async drop()
    {
        for (var id in this.peers)
            this.terminate(id);
    }

    async terminate(id)
    {
        if (!this.peers[id])
            return;
        this.peers[id].close();
        this.trigger("call-state", {id, state: this.peers[id].connectionState})
        this.sendSignal({type: "call", dest: id, terminate: 1});
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