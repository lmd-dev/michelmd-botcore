import { MessageType } from "../messenger/message-type";
import { messenger } from "../messenger/messenger";
import { ModulesManager } from "../modules/modules-manager";

/**
 * Bot core application
 */
export class BotCore
{
    //Manages the modules of the bot
    private _modulesManager: ModulesManager;
    public get modulesManager(): ModulesManager { return this._modulesManager; };
    
    /**
     * Constructor
     */
    public constructor()
    {
        this._modulesManager = new ModulesManager();

        messenger.addListener("restart", () => {
            process.exit(0);
        })

        this.initialize();
    }

    /**
     * Initializes modules
     */
    async initialize()
    {
        await this._modulesManager.initialize();

        this.openStreams();        
    }

    /**
     * Opens streams for server-sent events
     */
    openStreams()
    {
        messenger.emit("ws_add_stream", {
            name: "obs",
            uri: "/obs"
        })
    }
}