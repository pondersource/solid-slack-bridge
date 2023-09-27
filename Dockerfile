FROM node:lts
# ENV NODE_ENV=production
WORKDIR /app
COPY . .
# COPY ["package.json", "package-lock.json", "tsconfig.json", "./"]
# COPY src ./src
RUN ls -al
RUN npm install
RUN npm run build
CMD ["npm","run", "start"]

# ## this is stage two , where the app actually runs
# FROM node:alpine
# WORKDIR /app
# # COPY package.json ./
# COPY --from=0 /app .
# RUN ls -a
# RUN npm install pm2 -g
# # EXPOSE 8000
# CMD ["npm","run", "pm2"]
# CMD ["pm2-runtime","index.js"]
# RUN pm2 start index.js --name solid-slack-bridge