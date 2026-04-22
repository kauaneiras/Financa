FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY . .

RUN pnpm install --filter @finhub/web... --frozen-lockfile || pnpm install --filter @finhub/web...

CMD ["pnpm", "--filter", "@finhub/web", "exec", "next", "dev", "-H", "0.0.0.0", "-p", "3000"]
