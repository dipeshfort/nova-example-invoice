FROM node:8.11

LABEL author=dipesh

ARG port

ENV DEBUG=reminder*

WORKDIR /data/app

COPY . .

RUN npm --version \
    && npm install

EXPOSE 3000

CMD ["npm", "start"]
