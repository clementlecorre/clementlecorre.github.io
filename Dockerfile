FROM node:14-alpine as build
WORKDIR /root/project
COPY . .

RUN npm install
RUN npm audit fix --force
#RUN npm run-script build
#FROM nginx:alpine
#RUN rm -rf /usr/share/nginx
#COPY --from=build /root/project/build /usr/share/nginx
ENV NODE_ENV=production
CMD npm start
