import { daoModule } from "../../dao/dao-module";
import { MessageType } from "../../messenger/message-type";
import { Module, ModuleData } from "../module";
import { ModuleSetting } from "../module-setting";
import { HttpMethod } from "../web-server/http-method";
import { HttpRequestData } from "../web-server/http-request-data";
import { HttpResponseData } from "../web-server/http-response-data";
import { WebServerInfo } from "../web-server/web-server-info";

export type TwitchAuthData = ModuleData & {
    token: string,
    availableScopes: string[]
}

/**
 * Module responsible for the auhtentication on twitch services
 */
export class TwitchAuth extends Module
{
    // List of requires Twitch scopes
    private _requiredScopes: string[];
    private get requiredScopes(): string[] { return this._requiredScopes; };

    // List of available Twitch scopes (validated with the current token)
    private _availableScopes: string[];
    private get availableScopes(): string[] { return this._availableScopes; };

    // Web server information required for the redirect uri requested by the Twitch API
    private _webServerInfo: WebServerInfo | null;
    private get webServerInfo(): WebServerInfo | null { return this._webServerInfo; };
    private set webServerInfo(value: WebServerInfo | null) { this._webServerInfo = value; }

    // Current Twitch token
    private _twitchToken: string;
    public get twitchToken(): string { return this._twitchToken; };

    /**
     * Constructor
     */
    constructor()
    {
        super("Twitch Authentication", true);

        this._requiredScopes = [];
        this._availableScopes = [];
        this._webServerInfo = null;
        this._twitchToken = "";

        this.addListener("tw_require_scope", (scope: string) =>
        {
            if (this.requiredScopes.indexOf(scope) === -1)
                this.requiredScopes.push(scope);
        })

        this.addListener("ws_info", (webServerInfo: WebServerInfo) =>
        {
            this._webServerInfo = webServerInfo;
        })
    }

    /**
     * Imports data from JS object
     * @param {TwitchAuthData} data 
     */
    fromData(data: TwitchAuthData)
    {
        super.fromData(data);

        this._twitchToken = data.token ?? this._twitchToken;
        this._availableScopes = [...(data.availableScopes ?? this._availableScopes)];
    }

    /**
     * Exports data to JS object
     * @returns {TwitchAuthData}
     */
    toData(): TwitchAuthData
    {
        const data = super.toData() as TwitchAuthData;

        data.token = this._twitchToken;
        data.availableScopes = [...this._availableScopes]; 

        return data;
    }

    /**
     * returns available settings for the module
     * @returns {ModuleSetting[]} 
     */
     public getSettings(): ModuleSetting[]
     {
         const settings = super.getSettings();
 
         settings.push(ModuleSetting.linkSetting("Link", this.getLink()));
         settings.push(ModuleSetting.tagsSetting("Required scopes", this.requiredScopes));
         settings.push(ModuleSetting.tagsSetting("Available scopes", this.availableScopes));
 
         return settings;
     }
 
     /**
      * Updates settings of the module
      * @param {ModuleSetting[]} settings 
      */
     public setSettings(settings: ModuleSetting[])
     {
        super.setSettings(settings);
     }

     /**
      * Starts the module
      */
    async start(): Promise<void>
    {
        this.emit("ws_add_route", {
            url: "/twitch/auth",
            method: HttpMethod.GET,
            callback: async (data: HttpRequestData) =>
            {
                await this.getToken(data.queryString.code);

                return {
                    statusCode: 200,
                    body: `<script>window.close()</script>`,
                    contentType: "text/html"
                }
            }
        });

        this.sendToken();
    }

    /**
     * Builds the redirect URI from web server information
     * @returns {string}
     */
    private getRedirectURI(): string
    {
        if (this.webServerInfo)
            return `${ this.webServerInfo.uri }:${ this.webServerInfo.port.toString() }/twitch/auth`;

        return "";
    }

    /**
     * Builds the complete link to get the authentication code (required to get the authentication token)
     * @returns { string }
     */
    private getLink(): string
    {
        const clientId = process.env.TWITCH_CLIENT_ID ?? "";

        if (this.webServerInfo)
        {
            return `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${ clientId }&redirect_uri=${ this.getRedirectURI() }&scope=${ encodeURIComponent(this.requiredScopes.join(',')) }`;
        }

        return "";
    }

    /**
     * Gets Twitch Authentication Token from the given authentication code
     * @param {string} code 
     */
    private async getToken(code: string)
    {
        const clientId = process.env.TWITCH_CLIENT_ID ?? "";
        const clientSecret = process.env.TWITCH_CLIENT_SECRET ?? "";

        const response = await fetch(
            `https://id.twitch.tv/oauth2/token`,
            {
                method: 'post',
                body: `grant_type=authorization_code&client_id=${ clientId }&client_secret=${ clientSecret }&code=${ code }&redirect_uri=${ this.getRedirectURI() }`,
                headers: { "Content-Type": "application/x-www-form-urlencoded"}
            }
        )

        if(response.status === 200)
        {
            const data = await response.json();

            this._twitchToken = data.access_token;
            this.validateScopes();
            this.sendToken();

            daoModule.save(this);
        }
        else
        {
            const error = await response.text();
            console.log(error);
        }
    }

    /**
     * Validates required scopes
     */
    private validateScopes()
    {
        this._availableScopes = [...this.requiredScopes];
    }

    /**
     * Emits the current token
     */
    private sendToken()
    {
        this.emit("tw_token", this.twitchToken);
    }
}