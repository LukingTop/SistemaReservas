📅 Sistema de Gerenciamento de Reservas de Salas

Sistema Full Stack desenvolvido para automatizar e centralizar o processo de reserva de recursos limitados (salas de aula, laboratórios, auditórios), eliminando conflitos de agendamento.

Projeto desenvolvido como requisito avaliativo acadêmico.

🚀 Funcionalidades Principais

Autenticação Segura: Login e Cadastro com JWT/Tokens e proteção de rotas (Guards).

Gestão de Recursos: CRUD de salas e laboratórios (Acesso restrito a Admins/Staff).

Calendário Interativo: Visualização semanal de ocupação das salas (integração FullCalendar).

Sistema de Reservas:

Validação avançada de conflito de horários (Backend).

Bloqueio de datas passadas ou inválidas.

Feedback visual imediato de erros.

Hierarquia de Usuários:

Admin/Professor: Reservas aprovadas automaticamente (Status: Confirmada).

Aluno: Reservas entram como Pendentes (Status: Pendente).

Gestão Pessoal: Painel "Minhas Reservas" com histórico e opção de cancelamento.

Notificações: Envio automático de e-mail de confirmação (SMTP).

🛠️ Tecnologias Utilizadas

Backend (API)

Language: Python 3

Framework: Django 5 & Django REST Framework

Database: SQLite (Desenvolvimento)

Auth: Token Authentication

Utils: Django-Cors-Headers, Python-Dotenv

Frontend (SPA)

Framework: Angular (Standalone Components)

Language: TypeScript

Styling: CSS3 (Layout Responsivo)

Libs: FullCalendar, RxJS

⚙️ Como Rodar o Projeto

Pré-requisitos

Python 3.x instalado

Node.js e NPM instalados

Angular CLI (npm install -g @angular/cli)

1. Configurando o Backend (Django)

# Entre na pasta do backend
cd reserva_salas

# Crie e ative o ambiente virtual (Windows)
python -m venv venv
.\venv\Scripts\activate

# Instale as dependências
pip install django djangorestframework django-cors-headers python-dotenv

# Configure o banco de dados
python manage.py migrate

# Crie um superusuário (para acessar o Admin)
python manage.py createsuperuser

# Rode o servidor
python manage.py runserver


O backend estará rodando em: http://127.0.0.1:8000

2. Configurando o Frontend (Angular)

# Entre na pasta do frontend
cd reserva-frontend

# Instale as dependências
npm install
npm install @fullcalendar/angular @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction --legacy-peer-deps

# Rode a aplicação
ng serve


Acesse a aplicação em: http://localhost:4200

🧪 Testando o Sistema

Login: Utilize o usuário criado no createsuperuser ou cadastre um novo na tela de Registro.

Dashboard: Veja as salas disponíveis na Home.

Reserva: Clique em "Reservar", escolha um horário futuro e confirme.

Validação: Tente reservar o mesmo horário com outro usuário para ver o bloqueio de conflito.

Calendário: Acesse a aba Calendário para ver a visualização gráfica.

👥 Autores


