FROM node:12.16.2
RUN apt install git && git config --global user.name "MacTool" && git config --global user.email "mac@tool.com"
COPY package.json /usr/src/
RUN cd /usr/src && npm install
COPY . /usr/src/
WORKDIR /usr/src/
CMD /bin/bash