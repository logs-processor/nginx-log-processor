FROM node:21-alpine

# Create app directory
WORKDIR /usr/src/nginx-logs-processor
# Bundle app source
COPY . .
RUN  npm install --omit=dev

EXPOSE 8080

CMD ["npm", "start"]