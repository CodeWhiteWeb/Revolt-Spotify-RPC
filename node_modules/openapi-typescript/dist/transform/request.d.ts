import type { GlobalContext, RequestBody } from "../types.js";
export declare function transformRequestBodies(requestBodies: Record<string, RequestBody>, ctx: GlobalContext): string;
export declare function transformRequestBodyObj(requestBody: RequestBody, ctx: GlobalContext): string;
