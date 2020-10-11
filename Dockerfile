FROM node:lts-alpine3.9
RUN mkdir -p /app
WORKDIR /app
COPY --chown=1000 package.json .
RUN npm install
COPY index.js .
CMD [ "node", "index.js" ]