import { daoModule } from "../dao/dao-module";
import { MessageType } from "../messenger/message-type";
import { messenger } from "../messenger/messenger";
import { GG } from "./gg/gg";
import { Module } from "./module";
import { ModuleSetting, ModuleSettingData } from "./module-setting";
import { TwitchAuth } from "./twitch-auth/twitch-auth";
import { TwitchTchat } from "./twitch-tchat/twitch-tchat";
import { HttpMethod } from "./web-server/http-method";
import { HttpRequestData } from "./web-server/http-request-data";
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
    }

    async initialize()
    {
        await this.initializeModules();
        await this.createWebServerRoutes();
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
    private async createWebServerRoutes()
    {
        //Gets the list of all available modules
        messenger.emit("ws_add_route", {
            url :"/modules",
            method: HttpMethod.GET,
            callback: async (data: HttpRequestData) => {
                return {
                    statusCode: 200,
                    body: this.getModulesSettings(),
                    contentType: "application/json"
                };
            }
        });

        //Updates settings of a module
        messenger.emit("ws_add_route", {
            url: "/modules/:moduleName",
            method: HttpMethod.POST,
            callback: async (data: HttpRequestData) => {
                
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
                    statusCode: 200,
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