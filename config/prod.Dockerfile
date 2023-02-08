FROM node:18.14.0-alpine AS build
# Create build directory
WORKDIR /src/app
# Bundle app source
COPY . .
# Install app dependencies
RUN npm ci
# If you are building your code for production
# RUN npm ci --only=production
RUN npm install -g @angular/cli
RUN npm run build:ssr:production

# Release container
FROM node:18.14.0-alpine
# Expose the port that the application runs on
EXPOSE 443
EXPOSE 80
EXPOSE 4000
# Create build directory
WORKDIR /opt/website
# Copy the dist
COPY --from=build /src/app/dist dist
# Set the user to Node
USER root

CMD ["node", "./dist/wb/server/main.js"]
