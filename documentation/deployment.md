# Deployment

The site is hosted on Neocities as a static export, uploaded through a WebDAV mount.

## Mounting the site

Mount the Neocities WebDAV share with davfs. Use the site name as the user name and the API key as the password:

```sh
mount -o uid=1000 -t davfs https://neocities.org/webdav ~/neocities_webdav
```

## Deploying

```sh
npm run deploy
```

The deploy script runs ESLint, cleans and rebuilds the static export, then syncs `out/` to the mount with `rsync`. It
then waits 60 seconds for the Neocities CDN to pick up the new files, and checks that the live home page matches
`out/index.html`. It stops with an error if ESLint reports errors, if the mount is missing, if `rsync` fails to
transfer any file, or if the live home page can't be fetched or doesn't match the new build.

The script syncs to `~/neocities_webdav` by default. To use a different mount point, set `NEOCITIES_WEBDAV`:

```sh
NEOCITIES_WEBDAV=/mnt/neocities npm run deploy
```

The script checks the home page at `https://natural-time.bit-bar.org` by default. To check a different address, set
`NEOCITIES_SITE_URL`:

```sh
NEOCITIES_SITE_URL=https://example.neocities.org npm run deploy
```

The script passes `--inplace` to `rsync`. Without it, `rsync` uploads each file under a temporary name and renames it
over the original, and Neocities rejects that rename for `index.html`, leaving the old home page in place.

The script checks the live site instead of reading `index.html` back through the mount, because davfs2 can keep
returning a cached old copy of a file it has just uploaded.
