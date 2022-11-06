import { HttpMethod } from "./http-method";
import { HttpRequestHandler } from "./http-request-handler";

/**
 * Available options to create an HTTP route
 */
export type HttpRouteOptions = {
    url: string,
    method: HttpMethod,
    callback: HttpRequestHandler
}