FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3000

CMD ["npm", "start"]
