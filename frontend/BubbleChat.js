import {Box, Html, Icon} from "wdg"
import ACallApp from "./ACallApp"
import PanelCall from "./PanelCall"

export default class BubbleChat extends Html.Div
{
    constructor(props)
    {
        super(props);
        this.text(this.props.msg.text)
    }
}

