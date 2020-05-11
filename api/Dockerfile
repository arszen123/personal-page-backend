# Use the official lightweight Node.js 10 image.
# https://hub.docker.com/_/node
FROM node:10-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

RUN apt-get update && apt-get upgrade
RUN apt-get install -y libfontconfig libfreetype6
RUN apt-get install -y bzip2
# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy local code to the container image.
COPY . ./

COPY .env.prod .env

# Run the web service on container startup.
CMD [ "npm", "start" ]
