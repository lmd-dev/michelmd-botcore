import { Module, ModuleData } from "../module";
import tmi from "tmi.js";
import { TwitchTchatMessage } from "./twitch-tchat-message";
import { MessageType } from "../../messenger/message-type";

export type TwitchTchatData = ModuleData & {

}

/**
 * Modules responsible for managment of the Twitch Tchat
 */
export class TwitchTchat extends Module
{
    //Connection to the Twitch Tchat using TMI library
    private _tmiClient: tmi.Client | null;
    public get tmiClient(): tmi.Client | null { return this._tmiClient; };

    /**
     * Constructor
     */
    constructor()
    {
        super("Twitch Tchat", true);

        this._tmiClient = null;

        this.addListener(MessageType.TW_TOKEN, (token: string) =>
        {
            this.connect(token);
        })
    }

    /**
     * Imports module data from Js object
     * @param {TwitchModuleData} data 
     */
    fromData(data: TwitchTchatData)
    {
        super.fromData(data);
    }

    /**
     * Exports data to JS Object
     * @returns {TwitchTchatData}
     */
    toData(): TwitchTchatData
    {
        return super.toData();
    }

    /**
     * Starts the module
     */
    async start(): Promise<void>
    {
        this.emit(MessageType.TW_REQUIRE_SCOPE, "chat:read");
    }

    /**
     * Opens a connection to the Twitch Tchat
     * @param {string} token Authentication token to use to identify the user on the tchat
     */
    connect(token: string)
    {
        this._tmiClient = new tmi.Client({
            identity: {
                username: `MicheLMD`,
                password: `oauth:${token}`
            },
            channels: ['lesmoulinsdudev']
        })

        this._tmiClient.connect();

        this._tmiClient.on("message", (channel: string, userstate: tmi.ChatUserstate, message: string, self: boolean) => {

            const m: TwitchTchatMessage = {
                message: message,
                user: userstate.username ?? "",
                reward: userstate["custom-reward-id"] ?? "",
                self: self
            };

            this.emit(MessageType.TW_MESSAGE, m)
        })
    }
}