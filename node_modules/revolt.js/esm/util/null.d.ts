export declare type Nullable<T> = T | null;
export declare function toNullable<T>(data?: T): T | null;
/**
 * Backwards compatible convert potential Date value to Nullable<Date>.
 * @param data ISO8601 Timestamp or BSON DateTime
 * @returns
 */
export declare function toNullableDate(data?: {
    $date: string;
} | string | null): Date | null;
