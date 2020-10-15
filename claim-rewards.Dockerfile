FROM node:12-alpine as build-stage

WORKDIR /app

# install application dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# copy in application source
COPY . .

# copy built application to runtime image
FROM node:12-alpine
WORKDIR /app
COPY --from=build-stage /app/config config
COPY --from=build-stage /app/build build
COPY --from=build-stage /app/node_modules node_modules

# setup default env
ENV NODE_ENV production

## Launch the wait tool and then your application
CMD node build/index.js