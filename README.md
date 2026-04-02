# Sistema de Eventos (2026-1)

Projeto para gerenciamento de eventos desenvolvido como trabalho da disciplina de DEV II 2026-1.

**Visão geral:**

- Backend: Django (API REST)
- Frontend: React + Vite

**Requisitos**

- Python 3.10+ e pip
- Node.js 18+ e npm

**Instalação e execução — Backend**

1. Entre na pasta `backend`:

```bash
cd backend
```

2. Crie e ative um ambiente virtual (opcional, recomendado):

```bash
python -m venv .venv
# Windows
.venv/Script/activate
# Ou Linux
source .venv/bin/activate
```

3. Instale dependências:

```bash
pip install -r requirements.txt
```

4. Aplique migrações e execute o servidor:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

5. (Opcional) Crie um superusuário:

```bash
python manage.py createsuperuser
```

O backend estará disponível em `http://127.0.0.1:8000/` por padrão.

**Instalação e execução — Frontend**

1. Entre na pasta `frontend`:

```bash
cd frontend
```

2. Instale dependências e execute em modo de desenvolvimento:

```bash
npm install
npm run dev
```

O frontend é servido pelo Vite — siga a URL exibida no terminal (normalmente `http://localhost:5173`).

**Licença**

Ver `LICENSE`.
