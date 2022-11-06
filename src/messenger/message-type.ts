import { TwitchTchatMessage } from "../modules/twitch-tchat/twitch-tchat-message";
import { HttpRouteOptions } from "../modules/web-server/http-route-options";
import { HttpStreamOptions } from "../modules/web-server/http-stream-options";
import { StreamMessageOptions } from "../modules/web-server/stream-message-options";
import { WebServerInfo } from "../modules/web-server/web-server-info";

/**
 * Available message types and assciated handler
 */
export interface MessageType 
{
    restart(): void;                                                    // Restart the bot server

    ws_add_route(routeOptions: HttpRouteOptions): void;                 // Message to add route to the web server
    ws_add_stream(streamOptions: HttpStreamOptions): void;              // Message to add stream to the web server
    ws_send_on_stream(messageOptions: StreamMessageOptions): void;      // Sends message on a stream
    ws_info(webServerInfo: WebServerInfo): void;                        // Sends information about web server (URI, Listening port)

    tw_require_scope(scope: string): void;                              // Adds a scope to the required one on the Twitch Authentication 
    tw_token(token: string): void;                                      // Sends the last Twitch Auth Token
    tw_message(data: TwitchTchatMessage): void;                         // Sends the last messag ereceived on the Twitch tchat
}