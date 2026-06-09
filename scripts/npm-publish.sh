#!/bin/bash

project_dir=$(cd $(dirname $0); cd ../; pwd)
flags=$@

cd $project_dir/lib/distopia

PKG_NAME=$(node -p "require('./package.json').name")
PKG_VER=$(node -p "require('./package.json').version")

if npm view "${PKG_NAME}@${PKG_VER}" version > /dev/null 2>&1; then
  echo "already published: ${PKG_NAME}@${PKG_VER} — skipping"
else
  bun pm pack
  cd $project_dir
  npm publish $project_dir/lib/distopia/$PKG_NAME-$PKG_VER.tgz --verbose --provenance --access public $flags
fi
