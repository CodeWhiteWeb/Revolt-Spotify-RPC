import { prepareComment, nodeType, tsArrayOf, tsIntersectionOf, tsPartial, tsReadonly, tsTupleOf, tsUnionOf, parseSingleSimpleValue, } from "../utils.js";
const EOF_RE = /\n+$/;
function hasDefaultValue(node) {
    if (node.hasOwnProperty("default"))
        return true;
    return false;
}
export function transformSchemaObjMap(obj, options) {
    let output = "";
    for (const k of Object.keys(obj)) {
        const v = obj[k];
        const comment = prepareComment(v);
        if (comment)
            output += comment;
        const readonly = tsReadonly(options.immutableTypes);
        const required = options.required.has(k) || (options.defaultNonNullable && hasDefaultValue(v.schema || v)) ? "" : "?";
        output += `${readonly}"${k}"${required}: `;
        output += transformSchemaObj(v.schema || v, options);
        output += `;\n`;
    }
    return output.replace(EOF_RE, "\n");
}
export function addRequiredProps(properties, required) {
    const missingRequired = [...required].filter((r) => !(r in properties));
    if (missingRequired.length == 0) {
        return [];
    }
    let output = "";
    for (const r of missingRequired) {
        output += `${r}: unknown;\n`;
    }
    return [`{\n${output}}`];
}
export function transformAnyOf(anyOf, options) {
    const schemas = anyOf.filter((s) => {
        if (Object.keys(s).length > 1)
            return true;
        if (s.required)
            return false;
        return true;
    });
    if (schemas.length === 0) {
        return "";
    }
    return tsIntersectionOf(schemas.map((s) => tsPartial(transformSchemaObj(s, options))));
}
export function transformOneOf(oneOf, options) {
    return tsUnionOf(oneOf.map((value) => transformSchemaObj(value, options)));
}
export function transformSchemaObj(node, options) {
    var _a;
    const readonly = tsReadonly(options.immutableTypes);
    let output = "";
    const overriddenType = options.formatter && options.formatter(node);
    if (node.nullable) {
        output += "(";
    }
    if (overriddenType) {
        output += overriddenType;
    }
    else {
        switch (nodeType(node)) {
            case "ref": {
                output += node.$ref;
                break;
            }
            case "string":
            case "number":
            case "boolean":
            case "unknown": {
                output += nodeType(node);
                break;
            }
            case "const": {
                output += parseSingleSimpleValue(node.const, node.nullable);
                break;
            }
            case "enum": {
                const items = [];
                node.enum.forEach((item) => {
                    const value = parseSingleSimpleValue(item, node.nullable);
                    items.push(value);
                });
                output += tsUnionOf(items);
                break;
            }
            case "object": {
                const isAnyOfOrOneOfOrAllOf = "anyOf" in node || "oneOf" in node || "allOf" in node;
                const missingRequired = addRequiredProps(node.properties || {}, node.required || []);
                if (!isAnyOfOrOneOfOrAllOf &&
                    (!node.properties || !Object.keys(node.properties).length) &&
                    !node.additionalProperties) {
                    const emptyObj = `{ ${readonly}[key: string]: unknown }`;
                    output += tsIntersectionOf([emptyObj, ...missingRequired]);
                    break;
                }
                let properties = transformSchemaObjMap(node.properties || {}, {
                    ...options,
                    required: new Set(node.required || []),
                });
                let additionalProperties;
                if (node.additionalProperties ||
                    (node.additionalProperties === undefined && options.additionalProperties && options.version === 3)) {
                    if (((_a = node.additionalProperties) !== null && _a !== void 0 ? _a : true) === true || Object.keys(node.additionalProperties).length === 0) {
                        additionalProperties = `{ ${readonly}[key: string]: unknown }`;
                    }
                    else if (typeof node.additionalProperties === "object") {
                        const oneOf = node.additionalProperties.oneOf || undefined;
                        const anyOf = node.additionalProperties.anyOf || undefined;
                        if (oneOf) {
                            additionalProperties = `{ ${readonly}[key: string]: ${transformOneOf(oneOf, options)}; }`;
                        }
                        else if (anyOf) {
                            additionalProperties = `{ ${readonly}[key: string]: ${transformAnyOf(anyOf, options)}; }`;
                        }
                        else {
                            additionalProperties = `{ ${readonly}[key: string]: ${transformSchemaObj(node.additionalProperties, options) || "unknown"}; }`;
                        }
                    }
                }
                output += tsIntersectionOf([
                    ...(node.allOf ? node.allOf.map((node) => transformSchemaObj(node, options)) : []),
                    ...(node.anyOf ? [transformAnyOf(node.anyOf, options)] : []),
                    ...(node.oneOf ? [transformOneOf(node.oneOf, options)] : []),
                    ...(properties ? [`{\n${properties}\n}`] : []),
                    ...missingRequired,
                    ...(additionalProperties ? [additionalProperties] : []),
                ]);
                break;
            }
            case "array": {
                if (Array.isArray(node.items)) {
                    output += `${readonly}${tsTupleOf(node.items.map((node) => transformSchemaObj(node, options)))}`;
                }
                else {
                    const minItems = Number.isInteger(node.minItems) && node.minItems >= 0 ? node.minItems : 0;
                    const maxItems = Number.isInteger(node.maxItems) && node.maxItems >= 0 && minItems <= node.maxItems
                        ? node.maxItems
                        : undefined;
                    const estimateCodeSize = maxItems === undefined ? minItems : (maxItems * (maxItems + 1) - minItems * (minItems - 1)) / 2;
                    const items = node.items ? transformSchemaObj(node.items, options) : "unknown";
                    if ((minItems !== 0 || maxItems !== undefined) && options.supportArrayLength && estimateCodeSize < 30) {
                        if (maxItems === undefined) {
                            output += `${readonly}${tsTupleOf([
                                ...Array.from({ length: minItems }).map(() => items),
                                `...${tsArrayOf(items)}`,
                            ])}`;
                        }
                        else {
                            output += tsUnionOf(Array.from({ length: maxItems - minItems + 1 })
                                .map((_, i) => i + minItems)
                                .map((n) => `${readonly}${tsTupleOf(Array.from({ length: n }).map(() => items))}`));
                        }
                    }
                    else {
                        output += `${readonly}${tsArrayOf(items)}`;
                    }
                }
                break;
            }
        }
    }
    if (node.nullable) {
        output += ") | null";
    }
    return output;
}
//# sourceMappingURL=schema.js.map