export enum MessageType {
    RESTART,            // Restart the bot server
    
    WS_ADD_ROUTE,       // Message to add route to the web server
    WS_INFO,            // Send information about web server (URI, Listening port)

    TW_REQUIRE_SCOPE,   // Adds a scope to the required one on the Twitch Authentication 
    TW_TOKEN,           // Send the last Twitch Auth Token
    TW_MESSAGE          // Send the last messag ereceived on the Twitch tchat
}