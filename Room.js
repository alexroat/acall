import {User} from "./all"

export class Room extends User
{
    constructor()
    {
        super()
        this.name = `Room ${this.id}`

    }

    handle_chat(msg)
    {
        for (var i in this.contacts)
            if (msg.from != i)
                this.contacts[i].postMessage(msg)
    }

    handle_offer(msg)
    {
        for (var i in this.contacts)
            if (msg.from != i)
                this.contacts[i].postMessage(msg)
    }

}



