import type { GlobalContext, OperationObject, ParameterObject, PathItemObject } from "../types.js";
interface TransformOperationOptions extends GlobalContext {
    globalParameters?: Record<string, ParameterObject>;
    pathItem?: PathItemObject;
}
export declare function transformOperationObj(operation: OperationObject, options: TransformOperationOptions): string;
export {};
