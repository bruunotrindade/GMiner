FROM node:12.16.2

MAINTAINER "Bruno Trindade" <bruuno.trindade@gmail.com>

RUN apt install git && git config --global user.name "MacTool" && git config --global user.email "mac@tool.com"
COPY package.json /usr/src/
RUN cd /usr/src && npm install

ENV DELIMITER                       ';'
ENV MODE                            '2'
ENV INPUT_DATA                      '/usr/src/input/'
ENV OUTPUT_FOLDER                   '/usr/src/results/'
ENV REPO_CONFLICT_HASHES_FOLDER     '/usr/src/hashes/'

COPY . /usr/src/
WORKDIR /usr/src/

ENTRYPOINT npm start