FROM node:10
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 7086
CMD [ "node", "finances.js" ]
