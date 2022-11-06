import { MessageType } from "./message-type";

/**
 * Class responsible for exchange messages between all the part of the application
 */
class Messenger
{
    //Map of event managers
    private _events: Map<string, CallableFunction[]>;
    public get events(): Map<string, CallableFunction[]> { return this._events; };

    /**
     * Constructor
     */
    constructor()
    {
        this._events = new Map<string, CallableFunction[]>();
    }

    /**
     * Adds a new listener on a message
     * @param {string} messageType Type of message to listen 
     * @param {CallableFuction} callback Event manager to call 
     */
    addListener<T extends keyof MessageType>(messageType: T, callback: MessageType[T])
    {
        if (this.events.has(messageType) === false)
            this.events.set(messageType, []);

        this.events.get(messageType)?.push(callback);
    }

    /**
     * Emits a message
     * @param {string} messageType Type of message to emit 
     * @param {CallableFuction} data Data to send with the message 
     */
    emit<T extends keyof MessageType>(messageType: T, data: Parameters<MessageType[T]>[0] | null = null)
    {
        this.events.get(messageType)?.forEach((callback) =>
        {
            callback(data);
        })
    }
}

//Messenger service
export const messenger = new Messenger();