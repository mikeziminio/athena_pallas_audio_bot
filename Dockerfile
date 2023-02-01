FROM node:18.13

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install ffmpeg -y

RUN npm i -g typescript
