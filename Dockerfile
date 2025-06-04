# Estágio 1: Instala todas as dependências (incluindo dev) para build e geração de código
FROM node:22-slim AS development-dependencies-env
# Instala dependências do sistema necessárias para módulos node e Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates libssl-dev && rm -rf /var/lib/apt/lists/*
# Copia todo o projeto para o contexto do build
COPY . /app
WORKDIR /app
# Instala todas as dependências (incluindo devDependencies)
RUN npm ci
# Gera o cliente Prisma (pode precisar de devDependencies)
RUN npx prisma generate

# Estágio 2: Instala apenas dependências de produção para a imagem final
FROM node:22-slim AS production-dependencies-env
# Instala dependências do sistema necessárias para módulos node e Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates libssl-dev && rm -rf /var/lib/apt/lists/*
# Copia apenas os arquivos de pacote e o schema do Prisma para instalação de produção
COPY ./package.json package-lock.json /app/
COPY ./prisma /app/prisma
WORKDIR /app
# Instala apenas dependências de produção
RUN npm ci --omit=dev
# Gera o cliente Prisma (usando apenas dependências de produção)
RUN npx prisma generate

# Estágio 3: Faz o build da aplicação usando todas as dependências
FROM node:22-slim AS build-env
# Instala dependências do sistema necessárias para módulos node e Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates libssl-dev && rm -rf /var/lib/apt/lists/*
# Copia todo o projeto para o contexto do build
COPY . /app/
# Copia node_modules do development-dependencies-env (inclui devDependencies)
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
# Faz o build da aplicação (ex: transpila TypeScript, empacota assets)
RUN npm run build

# Estágio 4: Cria a imagem final de runtime
FROM node:22-slim
# Instala dependências do sistema necessárias para módulos node e Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates libssl-dev && rm -rf /var/lib/apt/lists/*
# Copia apenas os arquivos de pacote e o schema do Prisma para o runtime
COPY ./package.json package-lock.json /app/
COPY ./prisma /app/prisma
# Copia apenas node_modules de produção do production-dependencies-env
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
# Copia a aplicação já compilada do build-env
COPY --from=build-env /app/build /app/build
WORKDIR /app
# Gera o cliente Prisma (caso o runtime precise, ex: migrações)
RUN npx prisma generate