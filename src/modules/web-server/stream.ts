import { FastifyReply } from "fastify";

/**
 * Manages a stream for server-sent events
 */
export class Stream
{
    // Name of the stream
    private readonly _name: string;
    public get name(): string { return this._name; };

    // Clients connected to the stream
    private readonly _clients: FastifyReply[];
    public get clients(): FastifyReply[] { return this._clients; };

    /**
     * Constructor
     * @param { string }name Name of the stream 
     */
    constructor(name: string)
    {
        this._name = name;
        this._clients = [];
    }

    /**
     * Adds a client to the stream
     */
    addClient(client: FastifyReply)
    {
        this.clients.push(client);
    }

    /**
     * Remove client from the stream
     * @param client 
     */
    removeClient(client: FastifyReply)
    {
        const index = this.clients.indexOf(client);
        this.clients.splice(index, 1);
    }

    /**
     * Emits a message to the connected clients
     * @param {string} message Message to send 
     */
    emit(message: string)
    {
        this.clients.forEach((client) => {
            client.sse({data: message});
        })
    }
}