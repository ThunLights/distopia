FROM ubuntu:24.04

USER root

ENV LANG=C.UTF-8
ENV DEBIAN_FRONTEND=noninteractive

RUN apt update \
    && apt install -y \
    bash \
    ca-certificates \
    curl \
    git \
    gnome-terminal \
    gnupg \
    htop \
    nano \
    nodejs \
    npm \
    sudo \
    systemd \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

# Update node and npm version
RUN npm i -g n \
    && yes | n 22.21.1 \
    && apt purge -y nodejs npm

# Install npm packages
RUN npm i -g \
    bun \
    @antfu/ni

ENTRYPOINT [ "/sbin/init" ]
