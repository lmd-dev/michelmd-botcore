import { daoModule } from "../dao/dao-module";
import { MessageType } from "../messenger/message-type";
import { messenger } from "../messenger/messenger";
import { GG } from "./gg/gg";
import { Module } from "./module";
import { ModuleSetting, ModuleSettingData } from "./module-setting";
import { TwitchAuth } from "./twitch-auth/twitch-auth";
import { TwitchTchat } from "./twitch-tchat/twitch-tchat";
import { HTTPMethod } from "./web-server/http-method";
import { WebServer } from "./web-server/web-server";

/**
 * Class responsible to manage Michel's modules
 */
export class ModulesManager
{
    //List of the available modules
    private readonly _availableModules: Map<string, Module>;
    public get availableModules(): Map<string, Module> { return this._availableModules; };
    
    /**
     * Constructor
     */
    public constructor()
    {
        this._availableModules = new Map<string, Module>();

        this.initializeModules();

        this.createWebServerRoutes();
    }

    /**
     * Initialize available modules
     */
    private async initializeModules()
    {
        await this.registerModules();
        await this.startModules();
    }

    /**
     * Registers all the avaiable modules
     */
    private async registerModules()
    {
        await this.addModule(new WebServer());
        await this.addModule(new TwitchAuth());
        await this.addModule(new TwitchTchat());
        await this.addModule(new GG());
    }

    /**
     * Adds a module to the list of available modules
     * @param {Module} module 
     */
    private async addModule(module: Module)
    {
        await daoModule.load(module);

        this._availableModules.set(module.name, module);
    }

    /**
     * Starts all the modules
     * @returns {Promise<any[]>} Promise resolved when all modules are started
     */
    private startModules(): Promise<any[]>
    {
        return Promise.all(Array.from(this.availableModules.values()).map((module) => { return module.start(); }));
    }

    /**
     * Creates modules management routes
     */
    private createWebServerRoutes()
    {
        //Gets the list of all available modules
        messenger.emit(MessageType.WS_ADD_ROUTE, {
            url :"/modules",
            method: HTTPMethod.GET,
            callback: (data: any) => {
                return {
                    satusCode: 200,
                    body: this.getModulesSettings(),
                    contentType: "application/json"
                };
            }
        });

        //Updates settings of a module
        messenger.emit(MessageType.WS_ADD_ROUTE, {
            url: "/modules/:moduleName",
            method: HTTPMethod.POST,
            callback: async (data: any) => {
                
                const module = this._availableModules.get(data.params.moduleName);

                if(module)
                {
                    const settings = (data.body as ModuleSettingData[] ?? []).map((settingData) => { 
                        return ModuleSetting.fromData(settingData);
                    })

                    module.setSettings(settings);
                    await daoModule.save(module);

                    await module.restart();
                }

                return {
                    status: 200,
                    body: "{}",
                }
            }
        })
    }

    /**
     * Gets the list of available module as an array of JS objects
     * @returns 
     */
    private getModulesSettings(): Object
    {
        const modulesSettings = new Map<string, ModuleSettingData[]>();

        this.availableModules.forEach((module: Module) => {
            const settings = module.getSettings();

            if(settings.length)
                modulesSettings.set(module.name, settings.map((setting) => { return setting.toData() }));
        })
        
        return Object.fromEntries(modulesSettings.entries());
    }
}