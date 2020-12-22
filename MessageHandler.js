export class MessageHandler
{
    postMessage(msg, global)
    {
        if (global)
            for (var s of this.listeners)
                s.postMessage(msg)
        const h = this[`handle_${msg.type}`]
        if (h)
            h.call(this, msg);
    }

    listeners = new Set();

}



