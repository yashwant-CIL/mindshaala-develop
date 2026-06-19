#Use an official Node.js runtime as a parent image
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies 
COPY package.json package-lock.json ./
RUN npm install 

#Copy the rest of the application code
COPY . .

#Buid the application
RUN npm run build

# Use a lightweight Node.js image to serve the build folder
FROM node:22-alpine

#Set working directory
WORKDIR /app

#Copy the build folder from the builder stage
COPY --from=builder /app/dist ./dist

#Install a simple HTTP server to server the static files

RUN npm install -g serve

#Expose the port the app runs on
EXPOSE 8005

#Start the application
CMD ["serve", "-s", "dist", "-l", "8005"]
