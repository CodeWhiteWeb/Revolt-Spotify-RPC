import { comment, tsReadonly, nodeType } from "../utils.js";
import { transformOperationObj } from "./operation.js";
import { transformParametersArray } from "./parameters.js";
const httpMethods = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];
function replacePathParamsWithTypes(url, params) {
    let result = url;
    params.forEach((param) => {
        if ("in" in param && param.in === "path") {
            if (param.schema && "type" in param.schema) {
                result = result.replace(`{${param.name}}`, `\${${nodeType(param.schema)}}`);
            }
            else if (param.type) {
                result = result.replace(`{${param.name}}`, `\${${nodeType({ type: param.type })}}`);
            }
        }
    });
    return result;
}
export function transformPathsObj(paths, options) {
    const { globalParameters, operations, ...ctx } = options;
    const readonly = tsReadonly(ctx.immutableTypes);
    let output = "";
    for (const [url, pathItem] of Object.entries(paths)) {
        if (pathItem.description)
            output += comment(pathItem.description);
        if (pathItem.$ref) {
            output += `  ${readonly}"${url}": ${pathItem.$ref};\n`;
            continue;
        }
        let key = `"${url}"`;
        if (url.includes("{") && url.includes("}") && ctx.pathParamsAsTypes) {
            let params;
            if (pathItem.parameters) {
                params = pathItem.parameters;
            }
            else {
                const firstMethodParams = Object.values(pathItem)
                    .map((props) => typeof props === "object" && props.parameters)
                    .filter(Boolean)[0];
                if (firstMethodParams) {
                    params = firstMethodParams;
                }
            }
            key = `[key: \`${replacePathParamsWithTypes(url, params)}\`]`;
        }
        output += ` ${readonly}${key}: {\n`;
        for (const method of httpMethods) {
            const operation = pathItem[method];
            if (!operation)
                continue;
            if (operation.description)
                output += comment(operation.description);
            if (operation.operationId) {
                operations[operation.operationId] = { operation, pathItem };
                const namespace = ctx.namespace ? `external["${ctx.namespace}"]["operations"]` : `operations`;
                output += `    ${readonly}"${method}": ${namespace}["${operation.operationId}"];\n`;
            }
            else {
                output += `    ${readonly}"${method}": {\n      ${transformOperationObj(operation, {
                    ...ctx,
                    globalParameters,
                    pathItem,
                })}\n    }\n`;
            }
        }
        if (pathItem.parameters) {
            output += `   ${readonly}parameters: {\n      ${transformParametersArray(pathItem.parameters, {
                ...ctx,
                globalParameters,
            })}\n    }\n`;
        }
        output += `  }\n`;
    }
    return output;
}
export function makeApiPathsEnum(paths) {
    let output = "export enum ApiPaths {\n";
    for (const [url, pathItem] of Object.entries(paths)) {
        for (const [method, operation] of Object.entries(pathItem)) {
            if (!["get", "put", "post", "delete", "options", "head", "patch", "trace"].includes(method))
                continue;
            let pathName;
            if (operation.operationId)
                pathName = operation.operationId;
            else {
                pathName = (method + url)
                    .split("/")
                    .map((part) => {
                    const capitalised = part.charAt(0).toUpperCase() + part.slice(1);
                    return capitalised.replace(/{.*}|:.*|[^a-zA-Z\d_]+/, "");
                })
                    .join("");
            }
            const adaptedUrl = url.replace(/{(\w+)}/g, ":$1");
            output += `  ${pathName} = "${adaptedUrl}",\n`;
        }
    }
    output += "\n}";
    return output;
}
//# sourceMappingURL=paths.js.map