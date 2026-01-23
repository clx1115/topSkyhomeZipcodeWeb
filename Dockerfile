FROM node:18.20.2-buster
RUN mkdir -p /app
WORKDIR /app
RUN npm install -g pm2@latest
ENV NITRO_PORT=3000

# # 暴露端口
EXPOSE 3000