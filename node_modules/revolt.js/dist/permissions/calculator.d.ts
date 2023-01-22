import { Channel, Server, Member } from "..";
/**
 * Check whether `b` is present in `a`
 * @param a Input A
 * @param b Inputs (OR'd together)
 */
export declare function bitwiseAndEq(a: number, ...b: number[]): boolean;
/**
 * Calculate permissions against a given object
 * @param target Target object to check permissions against
 * @param options Additional options to use when calculating
 */
export declare function calculatePermission(target: Channel | Server, options?: {
    /**
     * Pretend to be another member
     */
    member?: Member;
}): number;
