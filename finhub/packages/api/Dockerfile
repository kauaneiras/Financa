FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm

# Apenas instalamos se os fontes existirem, senão isso falha no boot via compose sem volumes
CMD ["pnpm", "run", "dev", "--filter", "@finhub/api"]
