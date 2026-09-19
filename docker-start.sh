#!/bin/sh
set -eu

node scripts/migrate.mjs
node scripts/seed-persistent.mjs
exec node .output/server/index.mjs
