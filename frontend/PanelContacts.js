import {Box, Html, Icon} from "wdg"
import ACallApp from "./ACallApp"
import RowContact from "./RowContact"

export default class PanelContacts extends Box
{
    constructor(props)
    {
        super(props)
        this.header = new Html.Div().appendTo(this, {w: 40});
        this.contacts = new Box().appendTo(this, {p: 1}).css({oveflow: "auto"})
        new Icon({icon: "person-booth"}).appendTo(this.header, {w: 40}).toggleClass("chat-btn-call").on("click", () => ACallApp.get().createRoom())
        this.refresh()

        this.connect((ev) => this.refresh())
    }

    refresh()
    {
        this.contacts.removeAll();

        for (var id in Wdg.state.contacts)
            new RowContact({...Wdg.state.contacts[id]}).appendTo(this.contacts, {w: 50})
    }

    doLayout()
    {
        Wdg.setUrl(`/contact`)
        return super.doLayout()
    }

}
