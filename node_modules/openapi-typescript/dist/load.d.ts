/// <reference types="node" />
/// <reference types="node" />
import type { GlobalContext, Headers } from "./types.js";
import { Readable } from "stream";
import { URL } from "url";
declare type PartialSchema = Record<string, any>;
declare type SchemaMap = {
    [url: string]: PartialSchema;
};
export declare const VIRTUAL_JSON_URL = "file:///_json";
export declare function resolveSchema(url: string): URL;
interface LoadOptions extends GlobalContext {
    rootURL: URL;
    schemas: SchemaMap;
    urlCache?: Set<string>;
    httpHeaders?: Headers;
    httpMethod?: string;
}
export default function load(schema: URL | PartialSchema | Readable, options: LoadOptions): Promise<{
    [url: string]: PartialSchema;
}>;
export {};
