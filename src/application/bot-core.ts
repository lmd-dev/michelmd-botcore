import { MessageType } from "../messenger/message-type";
import { messenger } from "../messenger/messenger";
import { ModulesManager } from "../modules/modules-manager";

/**
 * Bot core application
 */
export class BotCore
{
    private _modulesManager: ModulesManager;
    public get modulesManager(): ModulesManager { return this._modulesManager; };
    
    /**
     * Constructor
     */
    public constructor()
    {
        this._modulesManager = new ModulesManager();

        messenger.addListener(MessageType.RESTART, () => {
            process.exit(0);
        })
    }
}