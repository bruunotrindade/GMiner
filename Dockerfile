FROM node:12.16.2

MAINTAINER "Bruno Trindade" <bruuno.trindade@gmail.com>

ENV DELIMITER           ';'
ENV MODE                '2'
ENV INPUT_DATA        '/usr/src/input/'
ENV OUTPUT_FOLDER       '/usr/src/results/'

RUN apt install git && git config --global user.name "MacTool" && git config --global user.email "mac@tool.com"
COPY package.json /usr/src/
RUN cd /usr/src && npm install
COPY . /usr/src/
WORKDIR /usr/src/

ENTRYPOINT npm start