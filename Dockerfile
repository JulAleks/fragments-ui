#********************************************************#
# Dockerfile for Fragments-UI project by Julia Alekseev  #
# Build Fragments-UI and serve via Nginx with Parcel     #
# Assignment 2                                           #
# Last updated on: 2024-11-09                           #
#********************************************************#

# Stage 0: Base Image Setup
FROM node:20.18.0-alpine3.19@sha256:2d8c24d9104bda27e07dced6d7110aa728dd917dde8255d8af3678e532b339d6 AS base_img
FROM nginx:1.26.2@sha256:2a7ba4bea138a22356b18add64cd93e808e3cb273051cdcb3a17aa4dbe58eec6 AS deploy_img

#######################################################################
# Stage 1: Dependencies Setup
FROM base_img AS dependencies

# Set maintainer and description
LABEL maintainer="Julia Alekseev <jalekseev@myseneca.ca>" \
      description="Fragments-UI project using Parcel and Nginx"

# Set environment variables
ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Use /app as working dir
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

#######################################################################

# Stage 2: Build the Application
FROM dependencies AS builder

# Use /app as working dir
WORKDIR /app

# Copy the entire source code into the container
COPY . .

# Build the project using Parcel
RUN npm run build

#######################################################################

# Stage 3: Use Nginx to Serve the Built Project
FROM deploy_img AS deploy

# Copy the build output from the builder stage to the Nginx directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80


