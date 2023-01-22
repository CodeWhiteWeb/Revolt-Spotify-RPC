// Sample file for type-checking.
export type APIRoutes =
| { method: 'get', parts: 2, path: '-/sus/{target}', params: undefined, response: undefined; }
| { method: 'get', parts: 2, path: `/sus/${string}`, params: undefined, response: string; }
| { method: 'get', parts: 3, path: `/sus/${string}/conflicting`, params: { some: string }, response: number; }
| { method: 'patch', parts: 1, path: `/`, params: undefined, response: undefined }
| { method: 'put', parts: 1, path: `/`, params: undefined, response: undefined }
| { method: 'delete', parts: 1, path: `/`, params: undefined, response: undefined }
| { method: 'post', parts: 1, path: `/`, params: undefined, response: undefined };