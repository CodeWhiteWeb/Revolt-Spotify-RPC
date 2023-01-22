const COMMENT_RE = /\*\//g;
const LB_RE = /\r?\n/g;
const DOUBLE_QUOTE_RE = /"/g;
const SINGLE_QUOTE_RE = /'/g;
const ESC_0_RE = /\~0/g;
const ESC_1_RE = /\~1/g;
const TILDE_RE = /\~/g;
const FS_RE = /\//g;
export function prepareComment(v) {
    const commentsArray = [];
    if (v.title)
        commentsArray.push(`${v.title} `);
    if (v.format)
        commentsArray.push(`Format: ${v.format} `);
    if (v.deprecated)
        commentsArray.push(`@deprecated `);
    const supportedJsDocTags = ["description", "default", "example"];
    for (let index = 0; index < supportedJsDocTags.length; index++) {
        const field = supportedJsDocTags[index];
        const allowEmptyString = field === "default" || field === "example";
        if (v[field] === undefined) {
            continue;
        }
        if (v[field] === "" && !allowEmptyString) {
            continue;
        }
        const serialized = typeof v[field] === "object" ? JSON.stringify(v[field], null, 2) : v[field];
        commentsArray.push(`@${field} ${serialized} `);
    }
    if (v.const)
        commentsArray.push(`@constant `);
    if (v.enum) {
        const canBeNull = v.nullable ? `|${null}` : "";
        commentsArray.push(`@enum {${v.type}${canBeNull}}`);
    }
    if (!commentsArray.length)
        return;
    return comment(commentsArray.join("\n"));
}
export function comment(text) {
    const commentText = text.trim().replace(COMMENT_RE, "*\\/");
    if (commentText.indexOf("\n") === -1) {
        return `/** ${commentText} */\n`;
    }
    return `/**
  * ${commentText.replace(LB_RE, "\n  * ")}
  */\n`;
}
export function parseRef(ref) {
    if (typeof ref !== "string" || !ref.includes("#"))
        return { parts: [] };
    const [url, parts] = ref.split("#");
    return {
        url: url || undefined,
        parts: parts
            .split("/")
            .filter((p) => !!p)
            .map(decodeRef),
    };
}
export function isRef(obj) {
    return !!obj.$ref;
}
export function parseSingleSimpleValue(value, isNodeNullable = false) {
    if (typeof value === "string")
        return `'${value.replace(SINGLE_QUOTE_RE, "\\'")}'`;
    if (typeof value === "number" || typeof value === "boolean")
        return value;
    if (typeof value === "object")
        return JSON.stringify(value);
    if (value === null && !isNodeNullable)
        return "null";
    return `${value}`;
}
export function nodeType(obj) {
    if (!obj || typeof obj !== "object") {
        return "unknown";
    }
    if (obj.$ref) {
        return "ref";
    }
    if (obj.const) {
        return "const";
    }
    if (Array.isArray(obj.enum) && obj.enum.length) {
        return "enum";
    }
    if (obj.type === "boolean") {
        return "boolean";
    }
    if (obj.type === "string" ||
        obj.type === "binary" ||
        obj.type === "byte" ||
        obj.type === "date" ||
        obj.type === "dateTime" ||
        obj.type === "password") {
        return "string";
    }
    if (obj.type === "integer" || obj.type === "number" || obj.type === "float" || obj.type === "double") {
        return "number";
    }
    if (obj.type === "array" || obj.items) {
        return "array";
    }
    if (obj.type === "object" ||
        obj.hasOwnProperty("allOf") ||
        obj.hasOwnProperty("anyOf") ||
        obj.hasOwnProperty("oneOf") ||
        obj.hasOwnProperty("properties") ||
        obj.hasOwnProperty("additionalProperties")) {
        return "object";
    }
    return "unknown";
}
export function swaggerVersion(definition) {
    if ("openapi" in definition) {
        if (parseInt(definition.openapi, 10) === 3) {
            return 3;
        }
    }
    if ("swagger" in definition) {
        if (typeof definition.swagger === "number" && Math.round(definition.swagger) === 2) {
            return 2;
        }
        if (parseInt(definition.swagger, 10) === 2) {
            return 2;
        }
    }
    throw new Error(`✘  version missing from schema; specify whether this is OpenAPI v3 or v2 https://swagger.io/specification`);
}
export function decodeRef(ref) {
    return ref.replace(ESC_0_RE, "~").replace(ESC_1_RE, "/").replace(DOUBLE_QUOTE_RE, '\\"');
}
export function encodeRef(ref) {
    return ref.replace(TILDE_RE, "~0").replace(FS_RE, "~1");
}
export function tsArrayOf(type) {
    return `(${type})[]`;
}
export function tsTupleOf(types) {
    return `[${types.join(", ")}]`;
}
export function tsIntersectionOf(types) {
    const typesWithValues = types.filter(Boolean);
    if (!typesWithValues.length)
        return "undefined";
    if (typesWithValues.length === 1)
        return typesWithValues[0];
    return `(${typesWithValues.join(") & (")})`;
}
export function tsPartial(type) {
    return `Partial<${type}>`;
}
export function tsReadonly(immutable) {
    return immutable ? "readonly " : "";
}
export function tsUnionOf(types) {
    if (!types.length)
        return "undefined";
    if (types.length === 1)
        return `${types[0]}`;
    return `(${types.join(") | (")})`;
}
//# sourceMappingURL=utils.js.map