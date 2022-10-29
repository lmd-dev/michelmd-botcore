import { HTTPRequestData } from "./http-request-data";
import { HTTPResponseData } from "./http-response-data";

export type HTTPRequestHandler = (data: HTTPRequestData) => Promise<HTTPResponseData>;