import {Box} from "wdg"

import RowContact from "./RowContact"

export default class PanelContacts extends Box
{
    constructor(props)
    {
        super(props)
        
        this.refresh()
    }
    
    refresh()
    {
        this.removeAll();
        for (var i=0;i<10;i++)
            new RowContact().appendTo(this,{w:50})
    }
    
}
