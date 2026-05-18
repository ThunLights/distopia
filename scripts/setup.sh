#!/bin/bash

project_dir=$(cd $(dirname $0); cd ../; pwd)

$project_dir/scripts/install.sh

cd $project_dir
bun run setup
