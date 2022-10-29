import { Module, ModuleData } from "../module";
import { fastify, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import cors from "@fastify/cors";
import { HTTPRouteOptions } from "./http-route-options";
import { HTTPRequestData } from "./http-request-data";
import { MessageType } from "../../messenger/message-type";
import { ModuleSetting } from "../module-setting";

export type WebServerData = ModuleData & {
    uri: string,
    port: number
}

/**
 * Web server module
 */
export class WebServer extends Module
{
    //Accessing url of the web server
    private _uri: string;
    public get uri(): string { return this._uri; }

    //Listening port of the web server
    private _port: number;
    public get port(): number { return this._port; }

    //Fastify instance used by the web server
    private _fastify: FastifyInstance;
    public get fastify(): FastifyInstance { return this._fastify; };

    /**
     * Constructor
     */
    public constructor()
    {
        super("Web Server", true);

        this._uri = "http://localhost";
        this._port = 4000;

        this._fastify = fastify();
        this._fastify.register(cors, {});

        this.addListener(MessageType.WS_ADD_ROUTE, (routeOptions: HTTPRouteOptions) =>
        {
            this.addRoute(routeOptions);
        });
    }

    /**
     * Returns the available settings of the module
     * @returns {ModuleSetting[]}
     */
    public getSettings(): ModuleSetting[]
    {
        const settings = super.getSettings();

        settings.push(ModuleSetting.textSetting("URI", this._uri));
        settings.push(ModuleSetting.textSetting("Port", this._port.toString()));

        return settings;
    }

    /**
     * Updates the settings of the module
     * @param {ModuleSetting[]} settings Settings to update 
     */
    public setSettings(settings: ModuleSetting[])
    {
        super.setSettings(settings);

        settings.forEach((setting) =>
        {
            switch (setting.name)
            {
                case "URI": this._uri = setting.asText(); break;
                case "Port": this._port = setting.asNumber(); break;
            }
        });
    }

    /**
     * Import data from JS object
     * @param data 
     */
    fromData(data: WebServerData)
    {
        super.fromData(data);

        this._uri = data.uri ?? this._uri;
        this._port = data.port ?? this._port;
    }

    /**
     * Export data to JS object
     * @returns {WebServerSettings}
     * @see ModuleData
     */
    toData(): WebServerData
    {
        const data = super.toData() as WebServerData;

        data.uri = this.uri;
        data.port = this.port;

        return data;
    }

    /**
     * Starts the web server
     */
    public async start(): Promise<void>
    {
        this.fastify.listen({ port: this._port });

        this.sendServerInfo();
    }

    /**
     * Restarts the module (and here the application)
     */
    public async restart(): Promise<void>
    {
        this.emit(MessageType.RESTART);
    }

    /**
     * Adds route to the web server
     * @param {HTTPRouteOptions} routeOptions 
     */
    private addRoute(routeOptions: HTTPRouteOptions)
    {
        this.fastify.route(
            {
                url: routeOptions.url,
                method: routeOptions.method,
                handler: async (request: FastifyRequest, reply: FastifyReply) =>
                {
                    const data = await routeOptions.callback(this.extractDataFromRequest(request));

                    reply.code(data.statusCode ?? 200);
                    reply.headers({ "Content-Type": data.contentType ?? "text/plain" });
                    reply.send(data.body ?? "");
                }
            })
    }

    /**
     * Extracts data (QueryString data, body data and URL data - params) from the client request
     * @param {FastifyRequest} request 
     * @returns { HTTPRequestData }
     */
    private extractDataFromRequest(request: FastifyRequest): HTTPRequestData
    {
        return {
            queryString: request.query,
            hash: {},
            body: request.body,
            params: request.params ?? {}
        }
    }

    /**
     * Emits a message containing Web Server information (uri, listening port)
     */
    private sendServerInfo()
    {
        this.emit(MessageType.WS_INFO, { uri: this.uri, port: this.port });
    }
}