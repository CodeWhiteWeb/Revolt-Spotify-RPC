import type { GlobalContext } from "../types.js";
interface TransformSchemaObjOptions extends GlobalContext {
    required: Set<string>;
}
export declare function transformSchemaObjMap(obj: Record<string, any>, options: TransformSchemaObjOptions): string;
export declare function addRequiredProps(properties: Record<string, any>, required: Set<string>): string[];
export declare function transformAnyOf(anyOf: any, options: TransformSchemaObjOptions): string;
export declare function transformOneOf(oneOf: any, options: TransformSchemaObjOptions): string;
export declare function transformSchemaObj(node: any, options: TransformSchemaObjOptions): string;
export {};
