import { HttpRequestData } from "./http-request-data";
import { HttpResponseData } from "./http-response-data";

/**
 * Handler to execute on HTTP request
 */
export type HttpRequestHandler = (data: HttpRequestData) => Promise<HttpResponseData>;