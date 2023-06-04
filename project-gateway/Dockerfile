FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./
COPY node_modules node_modules

# Install app dependencies
RUN npm install --insecure

# Copy the rest of the app source code to the container
COPY index.ts .

# Expose the port on which your Node.js app is running
EXPOSE 3003

# Start the Node.js app
CMD ["npm", "start"]