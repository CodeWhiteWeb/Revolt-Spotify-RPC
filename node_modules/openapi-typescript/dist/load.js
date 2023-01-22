import fs from "fs";
import yaml from "js-yaml";
import mime from "mime";
import path from "path";
import { Readable } from "stream";
import { request } from "undici";
import { URL } from "url";
import { parseRef } from "./utils.js";
const RED = "\u001b[31m";
const RESET = "\u001b[0m";
export const VIRTUAL_JSON_URL = `file:///_json`;
function parseSchema(schema, type) {
    if (type === "YAML") {
        try {
            return yaml.load(schema);
        }
        catch (err) {
            throw new Error(`YAML: ${err.toString()}`);
        }
    }
    else {
        try {
            return JSON.parse(schema);
        }
        catch (err) {
            throw new Error(`JSON: ${err.toString()}`);
        }
    }
}
function isFile(url) {
    return url.protocol === "file:";
}
export function resolveSchema(url) {
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return new URL(url);
    }
    const localPath = path.isAbsolute(url) ? new URL("", `file://${url}`) : new URL(url, `file://${process.cwd()}/`);
    if (!fs.existsSync(localPath)) {
        throw new Error(`Could not locate ${url}`);
    }
    else if (fs.statSync(localPath).isDirectory()) {
        throw new Error(`${localPath} is a directory not a file`);
    }
    return localPath;
}
function parseHttpHeaders(httpHeaders) {
    const finalHeaders = {};
    for (const [k, v] of Object.entries(httpHeaders)) {
        if (typeof v === "string") {
            finalHeaders[k] = v;
        }
        else {
            try {
                const stringVal = JSON.stringify(v);
                finalHeaders[k] = stringVal;
            }
            catch (err) {
                console.error(`${RED}Cannot parse key: ${k} into JSON format. Continuing with the next HTTP header that is specified${RESET}`);
            }
        }
    }
    return finalHeaders;
}
export default async function load(schema, options) {
    const urlCache = options.urlCache || new Set();
    const isJSON = schema instanceof URL == false && schema instanceof Readable == false;
    let schemaID = isJSON || schema instanceof Readable ? new URL(VIRTUAL_JSON_URL).href : schema.href;
    const schemas = options.schemas;
    if (isJSON) {
        schemas[schemaID] = schema;
    }
    else {
        if (urlCache.has(schemaID))
            return options.schemas;
        urlCache.add(schemaID);
        let contents = "";
        let contentType = "";
        const schemaURL = schema instanceof Readable ? new URL(VIRTUAL_JSON_URL) : schema;
        if (schema instanceof Readable) {
            const readable = schema;
            contents = await new Promise((resolve) => {
                readable.resume();
                readable.setEncoding("utf8");
                let content = "";
                readable.on("data", (chunk) => {
                    content += chunk;
                });
                readable.on("end", () => {
                    resolve(content);
                });
            });
            contentType = "text/yaml";
        }
        else if (isFile(schemaURL)) {
            contents = fs.readFileSync(schemaURL, "utf8");
            contentType = mime.getType(schemaID) || "";
        }
        else {
            const headers = {
                "User-Agent": "openapi-typescript",
            };
            if (options.auth)
                headers.Authorization = options.auth;
            if (options.httpHeaders) {
                const parsedHeaders = parseHttpHeaders(options.httpHeaders);
                for (const [k, v] of Object.entries(parsedHeaders)) {
                    headers[k] = v;
                }
            }
            const res = await request(schemaID, { method: options.httpMethod || "GET", headers });
            if (Array.isArray(res.headers["Content-Type"]))
                contentType = res.headers["Content-Type"][0];
            else if (res.headers["Content-Type"])
                contentType = res.headers["Content-Type"];
            contents = await res.body.text();
        }
        const isYAML = contentType === "application/openapi+yaml" || contentType === "text/yaml";
        const isJSON = contentType === "application/json" ||
            contentType === "application/json5" ||
            contentType === "application/openapi+json";
        if (isYAML) {
            schemas[schemaID] = parseSchema(contents, "YAML");
        }
        else if (isJSON) {
            schemas[schemaID] = parseSchema(contents, "JSON");
        }
        else {
            try {
                schemas[schemaID] = parseSchema(contents, "JSON");
            }
            catch (err1) {
                try {
                    schemas[schemaID] = parseSchema(contents, "YAML");
                }
                catch (err2) {
                    throw new Error(`Unknown format${contentType ? `: "${contentType}"` : ""}. Only YAML or JSON supported.`);
                }
            }
        }
    }
    const refPromises = [];
    schemas[schemaID] = JSON.parse(JSON.stringify(schemas[schemaID]), (k, v) => {
        if (k !== "$ref" || typeof v !== "string")
            return v;
        const { url: refURL } = parseRef(v);
        if (refURL) {
            const isRemoteURL = refURL.startsWith("http://") || refURL.startsWith("https://");
            if (isJSON && !isRemoteURL) {
                throw new Error(`Can’t load URL "${refURL}" from dynamic JSON. Load this schema from a URL instead.`);
            }
            const nextURL = isRemoteURL ? new URL(refURL) : new URL(refURL, schema);
            refPromises.push(load(nextURL, { ...options, urlCache }).then((subschemas) => {
                for (const subschemaURL of Object.keys(subschemas)) {
                    schemas[subschemaURL] = subschemas[subschemaURL];
                }
            }));
            return v.replace(refURL, nextURL.href);
        }
        return v;
    });
    await Promise.all(refPromises);
    if (schemaID === options.rootURL.href) {
        for (const subschemaURL of Object.keys(schemas)) {
            schemas[subschemaURL] = JSON.parse(JSON.stringify(schemas[subschemaURL]), (k, v) => {
                if (k !== "$ref" || typeof v !== "string")
                    return v;
                if (!v.includes("#"))
                    return v;
                const { url, parts } = parseRef(v);
                if (url && new URL(url).href !== options.rootURL.href) {
                    const relativeURL = isFile(new URL(url)) && isFile(options.rootURL)
                        ? path.posix.relative(path.posix.dirname(options.rootURL.href), url)
                        : url;
                    return `external["${relativeURL}"]["${parts.join('"]["')}"]`;
                }
                if (!url && subschemaURL !== options.rootURL.href) {
                    const relativeURL = isFile(new URL(subschemaURL)) && isFile(options.rootURL)
                        ? path.posix.relative(path.posix.dirname(options.rootURL.href), subschemaURL)
                        : subschemaURL;
                    return `external["${relativeURL}"]["${parts.join('"]["')}"]`;
                }
                if (parts[parts.length - 2] === "properties") {
                    parts.splice(parts.length - 2, 1);
                }
                const [base, ...rest] = parts;
                return `${base}["${rest.join('"]["')}"]`;
            });
            if (subschemaURL !== options.rootURL.href) {
                const relativeURL = isFile(new URL(subschemaURL)) && isFile(options.rootURL)
                    ? path.posix.relative(path.posix.dirname(options.rootURL.href), subschemaURL)
                    : subschemaURL;
                if (relativeURL !== subschemaURL) {
                    schemas[relativeURL] = schemas[subschemaURL];
                    delete schemas[subschemaURL];
                }
            }
        }
    }
    return schemas;
}
//# sourceMappingURL=load.js.map