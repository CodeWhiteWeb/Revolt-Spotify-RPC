import { comment, tsReadonly } from "../utils.js";
import { transformHeaderObjMap } from "./headers.js";
import { transformOperationObj } from "./operation.js";
import { transformPathsObj } from "./paths.js";
import { transformRequestBodies } from "./request.js";
import { transformResponsesObj } from "./responses.js";
import { transformSchemaObjMap } from "./schema.js";
export function transformAll(schema, ctx) {
    const readonly = tsReadonly(ctx.immutableTypes);
    let output = {};
    let operations = {};
    if (ctx.rawSchema) {
        const required = new Set(Object.keys(schema));
        switch (ctx.version) {
            case 2: {
                output.definitions = transformSchemaObjMap(schema, { ...ctx, required });
                return output;
            }
            case 3: {
                output.schemas = transformSchemaObjMap(schema, { ...ctx, required });
                return output;
            }
        }
    }
    output.paths = "";
    if (schema.paths) {
        output.paths += transformPathsObj(schema.paths, {
            ...ctx,
            globalParameters: (schema.components && schema.components.parameters) || schema.parameters,
            operations,
        });
    }
    switch (ctx.version) {
        case 2: {
            if (schema.definitions) {
                output.definitions = transformSchemaObjMap(schema.definitions, {
                    ...ctx,
                    required: new Set(Object.keys(schema.definitions)),
                });
            }
            if (schema.parameters) {
                output.parameters = transformSchemaObjMap(schema.parameters, {
                    ...ctx,
                    required: new Set(Object.keys(schema.parameters)),
                });
            }
            if (schema.responses) {
                output.responses = transformResponsesObj(schema.responses, ctx);
            }
            break;
        }
        case 3: {
            output.components = "";
            if (schema.components) {
                if (schema.components.schemas) {
                    output.components += `  ${readonly}schemas: {\n    ${transformSchemaObjMap(schema.components.schemas, {
                        ...ctx,
                        required: new Set(Object.keys(schema.components.schemas)),
                    })}\n  }\n`;
                }
                if (schema.components.responses) {
                    output.components += `  ${readonly}responses: {\n    ${transformResponsesObj(schema.components.responses, ctx)}\n  }\n`;
                }
                if (schema.components.parameters) {
                    output.components += `  ${readonly}parameters: {\n    ${transformSchemaObjMap(schema.components.parameters, {
                        ...ctx,
                        required: new Set(Object.keys(schema.components.parameters)),
                    })}\n  }\n`;
                }
                if (schema.components.requestBodies) {
                    output.components += `  ${readonly}requestBodies: {\n    ${transformRequestBodies(schema.components.requestBodies, ctx)}\n  }\n`;
                }
                if (schema.components.headers) {
                    output.components += `  ${readonly}headers: {\n    ${transformHeaderObjMap(schema.components.headers, {
                        ...ctx,
                        required: new Set(),
                    })}\n  }\n`;
                }
            }
            break;
        }
    }
    output.operations = "";
    if (Object.keys(operations).length) {
        for (const id of Object.keys(operations)) {
            const { operation, pathItem } = operations[id];
            if (operation.description)
                output.operations += comment(operation.description);
            output.operations += `  ${readonly}"${id}": {\n    ${transformOperationObj(operation, {
                ...ctx,
                pathItem,
                globalParameters: (schema.components && schema.components.parameters) || schema.parameters,
            })}\n  }\n`;
        }
    }
    for (const k of Object.keys(output)) {
        if (typeof output[k] === "string") {
            output[k] = output[k].trim();
        }
    }
    return output;
}
//# sourceMappingURL=index.js.map