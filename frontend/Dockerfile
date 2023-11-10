# Origin: https://dawchihliou.github.io/articles/the-last-dockerfile-you-need-for-nestjs

#
# 🧑‍💻 Development
#
FROM node:18-alpine as dev
# add the missing shared libraries from alpine base image
RUN apk add --no-cache libc6-compat
# Create app folder
WORKDIR /home/app

# Set to dev environment
ENV NODE_ENV dev

# Copy source code into app folder
COPY ./frontend /home/app
COPY ./shared /home/shared

# Install dependencies
RUN yarn --frozen-lockfile

#
# 🏡 Production Build
#
FROM node:18-alpine as build

WORKDIR /home/app
RUN apk add --no-cache libc6-compat

# Set to production environment
ENV NODE_ENV production

# In order to run `yarn build` we need access to the Nest CLI.
# Nest CLI is a dev dependency.
COPY --from=dev /home/app/node_modules ./node_modules
# Copy source code
COPY ./frontend /home/app
COPY ./shared /home/shared

# Generate the production build. The build script runs "nest build" to compile the application.
RUN yarn build-only

# Install only the production dependencies and clean cache to optimize image size.
RUN yarn --frozen-lockfile --production && yarn cache clean

#
# 🚀 Production Server
#
FROM nginx:stable-alpine as prod

WORKDIR /home/app
RUN apk add --no-cache libc6-compat

# Copy only the necessary files
COPY --from=build /home/app/dist ./dist
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]