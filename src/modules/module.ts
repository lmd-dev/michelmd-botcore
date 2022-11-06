import { MessageType } from "../messenger/message-type";
import { messenger } from "../messenger/messenger";
import { ModuleSetting } from "./module-setting";

/**
 * Base structure of a module data
 */
export type ModuleData = {
    enabled: boolean;
}

/**
 * Base class of all the modules of the application
 */
export abstract class Module
{
    //Name of the module
    private readonly _name: string;
    public get name(): string { return this._name; }

    //Is the module enabled
    private _enabled: boolean;
    public get enabled(): boolean { return this._enabled; };

    //The module is required and can't be disabled
    private _required: boolean;
    public get required(): boolean { return this._required; };

    /**
     * Constructor
     * @param {string}name 
     */
    public constructor(name: string, required: boolean = false)
    {
        this._name = name;
        this._required = required;

        this._enabled = required;
    }

    /**
     * Imports data from a JS object
     * @param {ModuleData} data 
     */
     fromData(data: ModuleData)
     {
        this._enabled = this._required ||data.enabled;
     }

    /**
     * Exports data to a JS boejct
     * @returns {ModuleData}
     */
    public toData(): ModuleData
    {        
        return {
            enabled: this._required || this._enabled
        };
    }

    /**
     * What to do on module starting
     */
    async start(): Promise<void>
    {

    }

    /**
     * Restarts the module
     */
    async restart(): Promise<void>
    {
        
    }

    /**
     * Adds a listener on a message type
     * @param {string} message Message to listen
     * @param {MessageCallback} callback Event manager to call when listening the message 
     */
    addListener<T extends keyof MessageType>(message: T, callback: MessageType[T]) { messenger.addListener(message, callback); }

    /**
     * Emits a message
     * @param {string} message Message to emit
     * @param {any} data Data to send with the message
     */
    emit<T extends keyof MessageType>(message: T, data: Parameters<MessageType[T]>[0] | null = null) { messenger.emit(message, data); }

    /**
     * returns available settings for the module
     * @returns {ModuleSetting[]} 
     */
    public getSettings(): ModuleSetting[]
    {
        const settings: ModuleSetting[] = [];

        if(!this._required)
            settings.push(ModuleSetting.booleanSetting("Enabled", this.enabled))

        return settings;
    }

    /**
     * Updates settings of the module
     * @param {ModuleSetting[]} settings 
     */
    public setSettings(settings: ModuleSetting[])
    {
        settings.forEach((setting) => {
            switch(setting.name)
            {
                case "Enabled": this._enabled = this._required || setting.asBoolean(); break;
            }
        })
    }
}