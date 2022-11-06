import { Module, ModuleData } from "../module";
import { fastify, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import cors from "@fastify/cors";
import { MessageType } from "../../messenger/message-type";
import { ModuleSetting } from "../module-setting";
import { FastifySSEPlugin } from "fastify-sse-v2";
import { HttpStreamOptions } from "./http-stream-options";
import { Stream } from "./stream";
import { StreamMessageOptions } from "./stream-message-options";
import { HttpRouteOptions } from "./http-route-options";
import { HttpRequestData } from "./http-request-data";

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

    private _streams: Map<string, Stream>;
    public get streams(): Map<string, Stream> { return this._streams; };

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
        this._streams = new Map<string, Stream>();

        this._fastify = fastify();
        this._fastify.register(cors, {});
        this._fastify.register(FastifySSEPlugin);

        this.addListener("ws_add_route", (routeOptions: HttpRouteOptions) =>
        {
            this.addRoute(routeOptions);
        });

        this.addListener("ws_add_stream", (streamOptions: HttpStreamOptions) => {
            this.addStream(streamOptions);
        })

        this.addListener("ws_send_on_stream", (messageOptions: StreamMessageOptions) => {
            this.sendOnStream(messageOptions.streamName, messageOptions.message);    
        })
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
        this.emit("restart");
    }

    /**
     * Adds route to the web server
     * @param {HttpRouteOptions} routeOptions 
     */
    private addRoute(routeOptions: HttpRouteOptions)
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
     * @returns { HttpRequestData }
     */
    private extractDataFromRequest(request: FastifyRequest): HttpRequestData
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
        this.emit("ws_info", { uri: this.uri, port: this.port });
    }

    private addStream(streamOptions: HttpStreamOptions)
    {
        const stream = new Stream(streamOptions.name)
        this.streams.set(stream.name, stream);

        this._fastify.get(streamOptions.uri, (request, reply) =>
        {
            stream.addClient(reply);

            request.socket.on("close", () => {
                stream.removeClient(reply);
            })
        })
    }

    private sendOnStream(streamId: string, message: string)
    {
        this.streams.get(streamId)?.emit(message);
    }
}
