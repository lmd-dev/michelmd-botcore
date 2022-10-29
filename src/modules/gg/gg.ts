import { MessageType } from "../../messenger/message-type";
import { Module, ModuleData } from "../module";
import { TwitchTchatMessage } from "../twitch-tchat/twitch-tchat-message";

export type GGData = ModuleData & {

}

/**
 * Module responsible for the GG reward
 */
export class GG extends Module
{
    /**
     * Constructor
     */
    constructor()
    {
        super("GG");

        this.addListener(MessageType.TW_MESSAGE, (data: TwitchTchatMessage) => {
            if(this.enabled && data.reward === process.env.GG_REWARD)
                console.log("GG !!!!!!");
        })
    }
}