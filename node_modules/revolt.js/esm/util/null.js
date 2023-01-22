export function toNullable(data) {
    return typeof data === "undefined" ? null : data;
}
/**
 * Backwards compatible convert potential Date value to Nullable<Date>.
 * @param data ISO8601 Timestamp or BSON DateTime
 * @returns
 */
export function toNullableDate(data) {
    return data ? new Date(typeof data === 'string' ? data : data.$date) : null;
}
