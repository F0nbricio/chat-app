# Chat App - Aplicação de um chat ao-vivo

Aplicação de chat em tempo real desenvolvida para portfólio, focada em segurança, arquitetura modular e excelente experiência de utilizador (UI/UX).

---

## Tecnologias Utilizadas

* **Frontend:** React, Vite, Tailwind CSS (v4), Socket.io-client
* **Backend:** Node.js, Express, Socket.io, Mongoose
* **Base de Dados:** MongoDB
* **Segurança:** Bcryptjs (hashing de senhas), Dotenv (.env)

---

## Arquitetura do Projeto

O backend foi modularizado seguindo as melhores práticas de desenvolvimento corporativo:

```text
backend/
├── models/        # Esquemas da Base de Dados (User, Message)
├── routes/        # Rotas HTTP (Autenticação e Registo)
├── sockets/       # Gestão de Eventos em Tempo Real (Socket.io)
├── middlewares/   # Tratamento Global de Erros
├── server.js      # Ponto de entrada da aplicação
└── .env           # Variáveis de ambiente
```

---

## Funcionalidades

* **Autenticação Completa:** Registo, Login e Recuperação de palavra-passe com encriptação segura (bcrypt).
* **Salas de Chat Dinâmicas:** Comunicação instantânea baseada em salas isoladas via WebSockets.
* **Histórico de Mensagens:** Persistência de mensagens no MongoDB com carregamento automático ao entrar numa sala.
* **Feedback de Conexão:** Indicador visual de estado de ligação em tempo real no cabeçalho do chat.
* **Interface Moderna:** Design responsivo em Dark Mode utilizando Tailwind CSS.
