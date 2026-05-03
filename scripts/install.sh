#!/bin/bash

project_dir=$(cd $(dirname $0); cd ../; pwd)

rm -rf $project_dir/node_modules/*
rm -rf $project_dir/node_modules/.bin
rm -rf $project_dir/node_modules/.bun

cd $project_dir

bun ci
