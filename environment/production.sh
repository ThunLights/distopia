#!/bin/bash

project_dir=$(cd $(dirname $0); cd ../; pwd)

cd $project_dir/docker
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
