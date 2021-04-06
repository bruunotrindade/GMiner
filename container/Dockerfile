FROM node:12.16.2-alpine
RUN apt install git && git config --global user.name "MacTool" && git config --global user.email "mac@tool.com"
COPY . /usr/src/
WORKDIR /usr/src/
CMD /bin/bash