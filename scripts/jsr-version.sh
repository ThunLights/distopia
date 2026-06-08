#!/bin/bash

set -euo pipefail

version=${1:?usage: $0 <version>}
target="$PWD/jsr.json"

tmp=$(mktemp)
jq --arg version "$version" '.version = $version' "$target" > "$tmp"
mv "$tmp" "$target"
oxfmt "$target"
