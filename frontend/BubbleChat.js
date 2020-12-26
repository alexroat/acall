import {Box, Html, Icon} from "wdg"
import ACallApp from "./ACallApp"
import PanelCall from "./PanelCall"

export default class BubbleChat extends Html.Div
{
    constructor(props)
    {
        super(props);
        
        new Html.Span().text(this.props.msg.text).appendTo(this);
        this.toggleClass("ownmessage",this.props.msg.from==Wdg.state.id);
    }
}

