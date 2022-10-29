import { MessageCallback } from "./message-callback";
import { MessageType } from "./message-type";

/**
 * Class responsible for exchange messages between all the part of the application
 */
class Messenger
{
    //Map of event managers
    private _events: Map<MessageType, MessageCallback[]>;
    public get events(): Map<MessageType, MessageCallback[]> { return this._events; };
    
    /**
     * Constructor
     */
    constructor()
    {
        this._events = new Map<MessageType, MessageCallback[]>();
    }

    /**
     * Adds a new listener on a message
     * @param {MessageType} messageType Type of message to listen 
     * @param {MessageCallback} callback Event manager to call 
     */
    addListener(messageType: MessageType, callback: MessageCallback)
    {
        if(this.events.has(messageType) === false)
            this.events.set(messageType, []);

        this.events.get(messageType)?.push(callback);
    }

    /**
     * Emits a message
     * @param {MessageType} messageType Type of message to emit 
     * @param {any} data Data to send with the message 
     */
    emit(messageType: MessageType, data: any)
    {
        this.events.get(messageType)?.forEach((callback) => {
            callback(data);
        })
    }
}

//Messenger service
export const messenger = new Messenger();