import { comment, tsReadonly } from "../utils.js";
import { transformSchemaObj } from "./schema.js";
export function transformHeaderObjMap(headerMap, options) {
    let output = "";
    for (const k of Object.keys(headerMap)) {
        const v = headerMap[k];
        if (!v.schema)
            continue;
        if (v.description)
            output += comment(v.description);
        const readonly = tsReadonly(options.immutableTypes);
        const required = v.required ? "" : "?";
        output += `  ${readonly}"${k}"${required}: ${transformSchemaObj(v.schema, options)}\n`;
    }
    return output;
}
//# sourceMappingURL=headers.js.map