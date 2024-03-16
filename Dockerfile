FROM node:20.11-alpine as builder

WORKDIR /usr/src/app

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose the port
EXPOSE ${PORT}

# Command to start the application
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm run start; else npm run dev; fi"]
