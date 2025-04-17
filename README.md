## 🧠 Backend - Chatbot API

Este é o backend do projeto de chatbot, desenvolvido em **TypeScript**, utilizando **PostgreSQL** e **MongoDB**, com suporte a **Docker** e integração com APIs externas e serviços da AWS.

---

### 🚀 Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- MongoDB
- Docker & Docker Compose
- AWS S3
- Integração com API do WhatsApp

---

### 📦 Pré-requisitos

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

### ⚙️ Setup

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/seu-repo-backend.git
cd seu-repo-backend
```

2. Crie um arquivo `.env` na raiz com o seguinte conteúdo:

```env
MONGODB_URI="mongodb://localhost:27017"
PGHOST="localhost"
PGUSER="postgres"
PGPASSWORD="Postgres@2025"
PGDATABASE="chatbot"
SECRET_USER="secret de token do usuário"
SECRET_AIP_WHATSAPP_NO_OFFICIAL="secret da api do whatsapp"
API_URL_WHATSAPP_NO_OFFICIAL="ip do servidor do whatsapp"
X_API_KEY="key para conectar a api de forma segura"
AWS_BUCKET_NAME="nome-do-bucket"
AWS_REGION="região-do-bucket"
AWS_ACCESS_KEY_ID="sua-access-key"
AWS_SECRET_ACCESS_KEY="sua-secret-key"
```

3. Suba os serviços com Docker Compose:

```bash
docker-compose up -d
```

---

### 📁 Estrutura do Projeto

```
src/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── utils/
└── index.ts
```

---

### 🔒 Licença

Este projeto é **privado**. Todos os direitos reservados.  
O uso, cópia, modificação ou distribuição sem permissão explícita do autor é proibido.

---

### 📫 Contato

Para dúvidas ou contribuições, sinta-se à vontade para abrir uma issue ou pull request.
