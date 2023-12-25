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

# Install dependencies
COPY ./backend/package.json /home/app/package.json
RUN yarn --frozen-lockfile

# Copy source code into app folder
COPY ./backend /home/app
COPY ./shared /home/shared

# Generate prisma
RUN npx prisma generate

# Set Docker as a non-root user
#USER node

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
COPY --chown=node:node --from=dev /home/app/node_modules node_modules

# Copy source code
COPY --chown=node:node ./backend .
COPY --chown=node:node ./shared /home/shared

RUN yarn build

# Install only the production dependencies and clean cache to optimize image size.
RUN yarn --frozen-lockfile --production && yarn cache clean

# Set Docker as a non-root user
#USER node

#
# 🚀 Production Server
#
FROM node:18-alpine as prod

WORKDIR /home/app
RUN apk add --no-cache libc6-compat

# Set to production environment
ENV NODE_ENV production

# Copy only the necessary files
COPY --chown=node:node --from=build /home/app/dist dist
COPY --chown=node:node --from=build /home/app/node_modules node_modules

# Set Docker as a non-root user
#USER node

CMD ["node", "-r", "./tsconfig-paths-bootstrap.js", "dist/app/src/main.js"]