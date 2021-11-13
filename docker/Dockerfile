FROM ruby:2.5.9-alpine
MAINTAINER "Christoph Fabianek" christoph@ownyourdata.eu

RUN addgroup -S soyagroup && \
    adduser -S user -G soyagroup && \
    apk add --no-cache libsodium-dev git make gcc musl-dev jq npm openjdk8 bash curl && \
    gem install securerandom httparty ed25519 multibases multihashes optparse rbnacl dag uri && \
    apk del make gcc musl-dev && \
    wget https://raw.githubusercontent.com/OwnYourData/did-cmd/main/oydid.rb -O /usr/local/bin/oydid && \
    chmod 755 /usr/local/bin/oydid

WORKDIR /usr/src/app
COPY . .
RUN npm i && \
    npm run build && \
    npm run bin && \
    ln -s /usr/src/app/docker/jolt /usr/local/bin

USER user
WORKDIR /home/user


CMD ["sh"]