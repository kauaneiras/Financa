# Financa - Sistema de Gestão Financeira Inteligente

Este projeto é uma plataforma completa de finanças contendo um **Frontend em Next.js** (em `finhub/apps/web`) e uma **API em Node.js** (`finhub-api`).

## Pré-requisitos
Para rodar este projeto muito facilmente sem precisar instalar dependências node em sua máquina, você precisa ter instalado:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Como Executar a Aplicação (Usando Docker)

1. Abra a pasta raiz do projeto (`C:\Users\kauan\OneDrive\Documentos\Financa`) no seu terminal.
2. Execute o comando abaixo para compilar e subir os containers da API e do Web:

   ```bash
   docker compose up --build -d
   ```

3. Após a execução ser concluída com sucesso, os sistemas estarão disponíveis nas seguintes URLs:
   - **Plataforma Web (Interface):** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:4000](http://localhost:4000)

## Modificando o Projeto Localmente (Modo Desenvolvimento)

Se você desejar não usar o Docker e rodar o projeto localmente para editar códigos enquanto visualiza as mudanças em tempo real:

**Para a API:**
```bash
cd finhub-api
npm install
npm run dev
```

**Para a Plataforma Web:**
Abra um novo terminal e rode:
```bash
cd finhub/apps/web
npm install
npm run dev
```

## Como Parar e Limpar os Containers

Para desligar o serviço em Docker, execute na raiz do projeto:

```bash
docker compose down
```

Se precisar resetar o build ou imagens órfãs, execute:
```bash
docker compose down --rmi all -v
```
