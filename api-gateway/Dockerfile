# Specific image
FROM node:20.12.2-alpine3.19

# Setting production enviroment
ENV NODE_ENV production

# Creating the workdir and also the ownership
RUN mkdir -p /app
RUN chown -R node:node /app && chmod -R 770 /app

# create the directory inside the container
WORKDIR /app


# Copy the package.json files from local machine to the workdir in container
COPY --chown=node:node package*.json ./

# Copy the generated modules and all other files to the container
COPY --chown=node:node . ./

# Run npm install in our local machine, but only with production dependencies
RUN npm ci --only=production

# App is running on port 3000 within the container, so need to expose it
EXPOSE 3000

# Ownership of files and source folder
COPY --chown=node:node ./package.json ./package.json
COPY --chown=node:node ./package-lock.json ./package-lock.json
COPY --chown=node:node ./src ./src

#Switching to non-root user
USER node

# the command that starts our app
CMD ["node", "src/index.js"]