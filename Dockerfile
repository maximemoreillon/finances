FROM node:10
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 8086
CMD [ "node", "weight.js" ]
