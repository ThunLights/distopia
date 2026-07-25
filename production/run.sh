#!/bin/bash

project_dir=$(cd $(dirname $0); cd ../; pwd)

cd $project_dir/docker

if [ -n "$(docker compose -f docker-compose.yml -f docker-compose.prod.yml ps -q)" ]; then
  docker compose -f docker-compose.yml -f docker-compose.prod.yml down
fi

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
