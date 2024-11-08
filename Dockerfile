#********************************************************#
# Dockerfile for Fragments-UI project by Julia Alekseev  #
# Build Fragments-UI and serve via Nginx with Parcel     #
# Assignment 2                                           #
# Last updated on: 2024-11-08                            #
#********************************************************#

#Setting bases images 
FROM node:20.18.0-alpine3.19@sha256:2d8c24d9104bda27e07dced6d7110aa728dd917dde8255d8af3678e532b339d6 AS base_img
FROM nginx:1.26.2@sha256:2a7ba4bea138a22356b18add64cd93e808e3cb273051cdcb3a17aa4dbe58eec6 AS deploy_img

#######################################################################
# Stage 0: Dependencies Setup
FROM base_img AS dependencies

# Set maintainer and description
LABEL maintainer="Julia Alekseev <jalekseev@myseneca.ca>" \
      description="Fragments-UI project using Parcel and Nginx"

# Set environment variables
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Use /app as working dir
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm ci

#######################################################################

# Stage 1: Copy Source Files and Build the Application
FROM dependencies AS builder

# Use /app as working dir
WORKDIR /app

# Copy the entire source code into the container
COPY ./src ./src

# Build the project using Parcel
RUN npm run build

#######################################################################

# Stage 2: Use Nginx to serve the built project
FROM deploy_img AS deploy

# Copy the build output from the builder stage to the Nginx directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80
