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

The deploy script cleans and rebuilds the static export, then syncs `out/` to the mount with `rsync`. It stops with an
error if the mount is missing, if `rsync` fails to transfer any file, or if `index.html` on Neocities doesn't match the
new build.

The script syncs to `~/neocities_webdav` by default. To use a different mount point, set `NEOCITIES_WEBDAV`:

```sh
NEOCITIES_WEBDAV=/mnt/neocities npm run deploy
```

The script passes `--inplace` to `rsync`. Without it, `rsync` uploads each file under a temporary name and renames it
over the original, and Neocities rejects that rename for `index.html`, leaving the old home page in place.
