# Build stage
FROM node:22 AS build

WORKDIR /app

RUN corepack enable

COPY . .

RUN yarn install --immutable
RUN yarn build

# Runtime stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]