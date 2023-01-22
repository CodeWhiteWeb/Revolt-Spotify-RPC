import { comment, tsReadonly } from "../utils.js";
import { transformSchemaObj } from "./schema.js";
export function transformRequestBodies(requestBodies, ctx) {
    let output = "";
    for (const [name, requestBody] of Object.entries(requestBodies)) {
        if (requestBody && requestBody.description)
            output += `  ${comment(requestBody.description)}`;
        output += `  "${name}": {\n    ${transformRequestBodyObj(requestBody, ctx)}\n  }\n`;
    }
    return output;
}
export function transformRequestBodyObj(requestBody, ctx) {
    const readonly = tsReadonly(ctx.immutableTypes);
    let output = "";
    if (requestBody.content && Object.keys(requestBody.content).length) {
        output += `  ${readonly}content: {\n`;
        for (const [k, v] of Object.entries(requestBody.content)) {
            output += `      ${readonly}"${k}": ${transformSchemaObj(v.schema, { ...ctx, required: new Set() })};\n`;
        }
        output += `    }\n`;
    }
    else {
        output += `  unknown;\n`;
    }
    return output;
}
//# sourceMappingURL=request.js.map