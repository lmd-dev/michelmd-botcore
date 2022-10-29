import { HTTPMethod } from "./http-method";
import { HTTPRequestHandler } from "./http-request-handler";

export type HTTPRouteOptions = {
    url: string,
    method: HTTPMethod,
    callback: HTTPRequestHandler
}