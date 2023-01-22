import { comment, tsReadonly } from "../utils.js";
import { transformHeaderObjMap } from "./headers.js";
import { transformSchemaObj } from "./schema.js";
export function transformResponsesObj(responsesObj, ctx) {
    const readonly = tsReadonly(ctx.immutableTypes);
    const resType = (res) => {
        if (tsReadonly(ctx.contentNever)) {
            return "never";
        }
        else {
            return res === 204 || (res >= 300 && res < 400) ? "never" : "unknown";
        }
    };
    let output = "";
    for (const httpStatusCode of Object.keys(responsesObj)) {
        const statusCode = Number(httpStatusCode) || `"${httpStatusCode}"`;
        const response = responsesObj[httpStatusCode];
        if (response.description)
            output += comment(response.description);
        if (response.$ref) {
            output += `  ${readonly}${statusCode}: ${response.$ref};\n`;
            continue;
        }
        if ((!response.content && !response.schema) || (response.content && !Object.keys(response.content).length)) {
            output += `  ${readonly}${statusCode}: ${resType(statusCode)};\n`;
            continue;
        }
        output += `  ${readonly}${statusCode}: {\n`;
        if (response.headers && Object.keys(response.headers).length) {
            if (response.headers.$ref) {
                output += `    ${readonly}headers: ${response.headers.$ref};\n`;
            }
            else {
                output += `    ${readonly}headers: {\n      ${transformHeaderObjMap(response.headers, {
                    ...ctx,
                    required: new Set(),
                })}\n    }\n`;
            }
        }
        switch (ctx.version) {
            case 3: {
                output += `    ${readonly}content: {\n`;
                for (const contentType of Object.keys(response.content)) {
                    const contentResponse = response.content[contentType];
                    const responseType = contentResponse && (contentResponse === null || contentResponse === void 0 ? void 0 : contentResponse.schema)
                        ? transformSchemaObj(contentResponse.schema, { ...ctx, required: new Set() })
                        : "unknown";
                    output += `      ${readonly}"${contentType}": ${responseType};\n`;
                }
                output += ` }\n`;
                break;
            }
            case 2: {
                output += `  ${readonly} schema: ${transformSchemaObj(response.schema, {
                    ...ctx,
                    required: new Set(),
                })};\n`;
                break;
            }
        }
        output += `  }\n`;
    }
    return output;
}
//# sourceMappingURL=responses.js.map