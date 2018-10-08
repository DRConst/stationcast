FROM ubuntu:latest
LABEL maintainer="Diogo Constâncio"

RUN echo 'Please wait, setting up dependencies'

RUN apt-get -qq -y update  && apt-get -qq -y upgrade && apt-get -qq -y install curl && apt-get -qq -y install gnupg && curl -sL https://deb.nodesource.com/setup_10.x | bash - > /dev/null && apt-get install -y -qq build-essential && apt-get install -qq -y nodejs
