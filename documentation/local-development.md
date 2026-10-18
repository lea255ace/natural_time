# Local Development

## Installing dependencies

The `@lea255ace/astro_algo` package is hosted on GitHub Packages, so installing dependencies requires a GitHub token
with the `read:packages` scope in `~/.npmrc`:

```text
//npm.pkg.github.com/:_authToken=<token>
```

Then install from the lockfile:

```sh
npm ci
```

## Running the dev server

The dev server supports hot reloading and serves the site at <http://localhost:3000>:

```sh
npm run dev
```

## Building and serving the static site

This builds the same static export that is deployed to Neocities:

```sh
npm run build
npm run serve
```

`npm run build` writes the static export to `out/`, and `npm run serve` serves that folder with `serve`, usually at
<http://localhost:3000>.

To remove the `.next/` and `out/` folders from a previous build, run:

```sh
npm run clean
```
