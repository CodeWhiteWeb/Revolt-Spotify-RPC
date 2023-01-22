# OAPI Client

This is a CLI for auto-generating an API library for a given OpenAPI spec which uses JSON primarily and conforms to Revolt's API style.

Thank you to [bree](https://bree.dev/) for helping me figure out all the especially difficult types.

## Goals

- Commit programming atrocities internally.
- Pretend everything is fine externally.
- Provide a simple strongly typed API experience to the user.

## Example

Here's what you can achieve with this library:

```typescript
import { API } from 'your-api';

let id = 'user_id';

// By default, we use the first server specified in the API spec.
new API()
    // Path parameters are specified using template strings.
    .get(`/users/${id}`)
    .then(user => {
        // User is still fully typed!
        return user.username;
    })
    .then(console.log);
```

Conflict resolution is also automatic, so conflicting prefixes will not cause issues:

```typescript
import { API } from 'your-api';

// For a route /some/{string}:
new API()
    .get('/some/this is an example')
    .then(x => {
        x // number
    })

// For a route /some/{string}/conflicting:
new API()
    .get('/some/this is an example/conflicting')
    .then(x => {
        x // string
    })
```

You can also provide your query and body parameters at the same time:

```typescript
import { API } from 'your-api';

// PATCH /users/@me?preserve=true
// Body: { username: string }
new API()
    .patch(`/users/@me`, {
        // Specify query parameters
        preserve: true,
        // Or body parameters
        username: 'something'
    });
```

This removes the overhead of having to remember exactly what goes where and provides a much nicer (and still strongly typed) API experience.

Currently this only supports rauth and Revolt authentication, but you can still provide your own Axios config or add your own authentication.

```typescript
new API({
    baseURL: 'https://example.com',
    authentication: {
        rauth: 'session token'
    }
})
```

## Setup Guide

Create a new project and configure it:

```sh
yarn init
yarn add @insertish/oapi axios lodash.defaultsdeep
yarn add --dev typescript openapi-typescript @types/lodash.defaultsdeep
```

Place your OpenAPI specification at the root of your API library at `OpenAPI.json`.

Update your `package.json` to include the following:

```json
{
    [...],
    "scripts": {
        "build": "oapilib && tsc"
    }
}
```

**Note**: you may want to use `STRICT=1 opailib`, see "Strict Mode" below.

Setup Typescript:

```sh
yarn exec tsc -- --init
```

Change `tsconfig.json` to include:

```json
{
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src",
        "declaration": true
    }
}
```

Create a new `src` directory.

Now generate the library: (`src` folder will be overwritten!)

```sh
yarn build
```

## Replace `anyOf` with `oneOf`

If your spec uses `anyOf`, the values are mapped as an intersection while you may actually want all of these values to be treated as if they were `oneOf`, or otherwise a union.

You can specify the environment variable `REWRITE_ANYOF` to any truthy value.

```sh
REWRITE_ANYOF=1 oapilib
```
