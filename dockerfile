FROM node:18-buster

ENV NODE_ENV="production"

# Create app directory
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY dependencies.txt ./

#install all libraries for production from dependencies.txt
RUN apt-get update && xargs apt-get install -y <dependencies.txt

RUN npm install

# Bundle app source
COPY . .

CMD ["npm", "start"]
