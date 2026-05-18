#!/bin/bash

project_dir=$(cd $(dirname $0); cd ../; pwd)

$project_dir/scripts/setup.sh

cd $project_dir

bun run build

bun run $project_dir/src/presentation/web/build/index.js
