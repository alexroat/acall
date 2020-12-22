import { Room, MessageHandler} from "./all"


export class User extends MessageHandler
{
constructor()
{
    super();
    this.id = Math.random();
    this.name = `user ${this.id}`;
    User.pool[this.id] = this;
    this.contacts = {};
    this.conn = {};
    this.messages = {};


    for (var u of Object.values(User.pool))
        u.addContact(this), this.addContact(u);
}
static pool = {}
static getUser(uid)
{
    if (User.pool[uid])
        return User.pool[uid];
    return new User();
}

getProfile()
{
    const {id, name, img} = this;
    return {id, name, img};
}

getState()
{
    const contacts = {}
    for (var id in this.contacts)
    {
        const u = User.getUser(id);
        contacts[u.id] = {...u.getProfile()};
        }
        return {...this.getProfile(), contacts, messages: this.messages};
    }
    handleremote_chat(msg)
    {
        var msg = {...msg, type: "chat", id: Math.random(), from: this.id}
        User.getUser(msg.dest).postMessage(msg)
        this.postMessage(msg)
    }
    handle_chat(msg)
    {
        this.messages[msg.id] = msg;
        this.postMessageRemote(msg)
    }

    handle_offer_remote()
    {
        this.postMessage(msg, )
    }

    addContact(user)
    {
        this.contacts[user.id] = user;
        user.listeners.add(this);
        this.sendState()
    }

    sendState()
    {
        this.postMessageRemote({...this.getState(), type: "state"})
    }

    handle_new_connection(msg)
    {
        const {ws, req} = msg
        const id = Math.random();
        const connection = {ws, req, id};
        this.conn[id] = connection;

        ws.on('message', (msg) => {
            const id = Math.random()
            var msg = {...JSON.parse(msg), id, from: this.id};
            console.log(msg)
            const h = this[`handleremote_${msg.type}`]
            if (h)
                h.call(this, msg);
        });
        ws.on('close', (msg) => {
            delete this.conn[connection.id]
            this.postMessage({type: "connection_closed", connection})
        });
        this.postMessage({type: "connection_opened", connection})
        this.sendState();
    }

    postMessageRemote(msg)
    {
        for (var cid in this.conn)
            this.conn[cid].ws.send(JSON.stringify(msg))
    }

    handleremote_room_create(msg)
    {
        const room = new Room();
        room.addContact(this)
        this.addContact(room)
    }

    handleremote_call(msg)
    {
        User.getUser(msg.dest).postMessage(msg)
    }

    handle_call(msg)
    {
        this.postMessageRemote(msg)
    }

}

