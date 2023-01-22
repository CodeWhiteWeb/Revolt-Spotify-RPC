import { comment, tsReadonly } from "../utils.js";
import { transformSchemaObj } from "./schema.js";
const PARAM_END_RE = /"\]$/;
export function transformParametersArray(parameters, options) {
    const { globalParameters = {}, ...ctx } = options;
    const readonly = tsReadonly(ctx.immutableTypes);
    let output = "";
    let mappedParams = {};
    for (const paramObj of parameters) {
        if (paramObj.$ref && globalParameters) {
            const paramName = paramObj.$ref.split('["').pop().replace(PARAM_END_RE, "");
            if (globalParameters[paramName]) {
                const reference = globalParameters[paramName];
                if (!mappedParams[reference.in])
                    mappedParams[reference.in] = {};
                switch (ctx.version) {
                    case 3: {
                        mappedParams[reference.in][reference.name || paramName] = {
                            ...reference,
                            schema: { $ref: paramObj.$ref },
                        };
                        break;
                    }
                    case 2: {
                        mappedParams[reference.in][reference.name || paramName] = {
                            ...reference,
                            $ref: paramObj.$ref,
                        };
                        break;
                    }
                }
            }
            continue;
        }
        if (!paramObj.in || !paramObj.name)
            continue;
        if (!mappedParams[paramObj.in])
            mappedParams[paramObj.in] = {};
        mappedParams[paramObj.in][paramObj.name] = paramObj;
    }
    for (const [paramIn, paramGroup] of Object.entries(mappedParams)) {
        output += `  ${readonly}${paramIn}: {\n`;
        for (const [paramName, paramObj] of Object.entries(paramGroup)) {
            let paramComment = "";
            if (paramObj.deprecated)
                paramComment += `@deprecated `;
            if (paramObj.description)
                paramComment += paramObj.description;
            if (paramComment)
                output += comment(paramComment);
            const required = paramObj.required ? `` : `?`;
            let paramType = ``;
            switch (ctx.version) {
                case 3: {
                    paramType = paramObj.schema
                        ? transformSchemaObj(paramObj.schema, { ...ctx, required: new Set() })
                        : "unknown";
                    break;
                }
                case 2: {
                    if (paramObj.in === "body" && paramObj.schema) {
                        paramType = transformSchemaObj(paramObj.schema, { ...ctx, required: new Set() });
                    }
                    else if (paramObj.type) {
                        paramType = transformSchemaObj(paramObj, { ...ctx, required: new Set() });
                    }
                    else {
                        paramType = "unknown";
                    }
                    break;
                }
            }
            output += `    ${readonly}"${paramName}"${required}: ${paramType};\n`;
        }
        output += `  }\n`;
    }
    return output;
}
//# sourceMappingURL=parameters.js.map