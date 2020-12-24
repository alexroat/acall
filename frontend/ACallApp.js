import {Wdg, App, Box, ColoredBox, Html} from "wdg"
import PanelContacts from "./PanelContacts"
import PanelChat from "./PanelChat"
import {PanelCall} from "./PanelCall"

export default class ACallApp extends App
{
    constructor(props)
    {
        super(props)
        ACallApp.state = {name: "user", contacts: {}, messages: {}}
        this.header = new ColoredBox().appendTo(this, {w: "auto"}).text("A Call")
        this.main = new Box().appendTo(this, {p: 1})
        this.footer = new ColoredBox().appendTo(this, {w: 30})
        this.panelCall = new PanelCall().appendTo(this,{ignore:1}).toggle(false).expand();

        this.setContent(new PanelContacts())

        this.connect((ev) => this.header.text(Wdg.state.name), true)
        this.connectWS()


        this.panelCall.on("call-txsignal",ev=>this.sendMessage(ev.detail))
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

    async handleremote_call(msg)
    {
       if (msg.offer)
           this.panelCall.toggle(true).doLayout()
       this.panelCall.trigger("call-rxsignal",msg)
    }

    createRoom()
    {
        this.sendMessage({type: "room_create"})
    }
    
    call(id)
    {        
        this.panelCall.toggle(true).doLayout().call(id)
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