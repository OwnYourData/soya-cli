FROM ruby:2.5.9-alpine
MAINTAINER "Christoph Fabianek" christoph@ownyourdata.eu

RUN addgroup -S user && \
    adduser -S user -G user && \
    apk add --no-cache libsodium-dev git make gcc musl-dev jq npm openjdk8 bash curl && \
    gem install securerandom httparty ed25519 multibases multihashes optparse rbnacl dag uri && \
    apk del make gcc musl-dev && \
    wget https://raw.githubusercontent.com/OwnYourData/did-cmd/main/oydid.rb -O /usr/local/bin/oydid && \
    chmod 755 /usr/local/bin/oydid && \
    mkdir -p /usr/src/app

ENV NODE_ENV=development
WORKDIR /usr/src/app
COPY . .

RUN chgrp -R user /usr/src/app && \
    chown -R user /usr/src/app && \
    cat docker/welcome.txt > /etc/motd

USER user

RUN npm install && \
    npm run build

USER root
RUN npm run bin && \
    ln -s /usr/src/app/docker/jolt /usr/local/bin

USER user
WORKDIR /home/user

COPY docker/home .

CMD ["bash"]