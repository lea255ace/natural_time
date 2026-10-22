#!/usr/bin/env bash
# Builds the static export and syncs it to Neocities through a davfs WebDAV mount.
set -euo pipefail

DEST="${NEOCITIES_WEBDAV:-$HOME/neocities_webdav}"
SITE_URL="${NEOCITIES_SITE_URL:-https://natural-time.bit-bar.org}"

cd "$(dirname "$0")/.."

npm run lint

if ! mountpoint -q "$DEST"; then
    echo "error: $DEST is not mounted. Mount it first with:" >&2
    echo "  mount -o uid=$(id -u) -t davfs https://neocities.org/webdav $DEST" >&2
    echo "When prompted, enter the Neocities site name as the username and a site API key as the password." >&2
    exit 1
fi

npm run clean
npm run build

if [ ! -f out/index.html ]; then
    echo "error: the build did not produce out/index.html." >&2
    exit 1
fi

# --inplace writes into existing files instead of renaming a temporary file over them.
# Neocities rejects that rename for index.html, which leaves the old home page in place.
if ! rsync --exclude=lost+found --delete --recursive --inplace out/ "$DEST/"; then
    echo "error: rsync did not transfer every file. The site may be partially updated." >&2
    exit 1
fi

# Check the live site rather than the mount: davfs2 can keep returning a cached old copy of a file it just uploaded.
# The wait gives the Neocities CDN time to pick up the new files.
echo "Waiting 60 seconds before checking $SITE_URL/ ..."
sleep 60

LIVE_INDEX="$(mktemp)"
trap 'rm -f "$LIVE_INDEX"' EXIT

if ! curl --fail --silent --show-error --location --max-time 30 --output "$LIVE_INDEX" "$SITE_URL/"; then
    echo "error: could not fetch $SITE_URL/ to check the deploy." >&2
    exit 1
fi

if ! cmp -s out/index.html "$LIVE_INDEX"; then
    echo "error: the home page at $SITE_URL/ does not match out/index.html." >&2
    exit 1
fi

echo "Deployed to Neocities."
