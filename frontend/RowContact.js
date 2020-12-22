/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import {Html, Box,ColoredBox,randomText,randomImg} from "wdg"
import ACallApp from "./ACallApp"
import PanelChat from "./PanelChat"

export default class RowContact extends Html.Div
{
    constructor(props)
    {
        super(props)
        const {id,name} = this.props;
        this.image=new Html.Span().css({"background-image":randomImg()}).appendTo(this)
        this.name=new Html.Span().text(name).appendTo(this)
        this.on("click",()=>ACallApp.get().setContent(new PanelChat({id,name})))
    }
    
}
