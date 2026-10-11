FROM node:22-bookworm

ENV NODE_ENV="production"

# Create app directory
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY dependencies.txt ./

# Install the shared libraries used by Chromium for PDF generation.
RUN apt-get -o Acquire::Retries=3 -o APT::Update::Error-Mode=any update \
    && xargs -r apt-get install -y --no-install-recommends < dependencies.txt \
    && rm -rf /var/lib/apt/lists/*

RUN npm install

# Bundle app source
COPY . .

CMD ["npm", "run", "prod"]
