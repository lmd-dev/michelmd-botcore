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

        this.addListener("tw_message", (data: TwitchTchatMessage) => {
            if(this.enabled && data.reward === process.env.GG_REWARD)
            {
                this.emit("ws_send_on_stream", {
                    streamName: "obs",
                    message: JSON.stringify({
                        module: "gg",
                        data: {
                            username: data.user,
                            message: data.message
                        }
                    })
                })
            }
        })
    }
}