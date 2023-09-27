#!/bin/bash

git pull


# if [ "$DEPLOY_MODE" == "--clean" ]; then
#     sudo docker stop $(docker ps -a -q)
#     sudo docker rm $(docker ps -a -q)
# fi

docker volume create caddy_data
docker volume create portainer-data

sudo docker compose up -d --build