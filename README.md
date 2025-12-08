📅 Sistema de Gestão de Reservas Acadêmicas

Nota: Projeto desenvolvido como requisito avaliativo para a disciplina de Back-End Frameworks e Front-End Frameworks na UNINASSAU - Maceió.

📖 Sobre o Projeto

O Sistema de Reservas é uma solução completa para automatizar o agendamento de recursos limitados (laboratórios, auditórios, projetores) em ambientes acadêmicos.

O sistema resolve o problema de conflitos de horário e descentralização, oferecendo uma interface moderna para alunos e ferramentas poderosas de gestão para administradores.

✨ Funcionalidades em Destaque

O projeto vai além do CRUD básico, implementando recursos avançados de engenharia de software:

🔐 Segurança e Acesso

Autenticação JWT: Login seguro com Tokens.

Hierarquia de Usuários:

Admin/Staff: Reservas aprovadas automaticamente, acesso a relatórios e dashboard.

Aluno: Reservas entram como "Pendentes", visualização restrita.

Códigos de Convite: Sistema de tokens únicos para cadastro de novos professores/admins.

Recuperação de Senha: Fluxo completo via e-mail com tokens temporários.

📅 Gestão e Reservas

Calendário Visual: Integração com FullCalendar para visualização semanal/mensal.

Validação de Conflitos: Algoritmo no Backend que impede matematicamente reservas sobrepostas (Start < End e Overlap Check).

Busca Inteligente: Filtro avançado ("Encontre uma sala livre dia X para Y pessoas").

Bloqueio Administrativo: Funcionalidade de manutenção para bloquear horários.

📊 Inteligência e Feedback

Real-Time (WebSockets): O administrador recebe notificações instantâneas (Toasts) quando uma nova reserva é feita, sem recarregar a página.

Dashboard Analítico: Gráficos (Chart.js) mostrando taxas de ocupação e status.

Relatórios: Exportação oficial em PDF e Excel.

E-mails Transacionais: Envio automático de confirmação via SMTP (Gmail).

🎨 Experiência do Usuário (UX)

Modo Escuro (Dark Mode): Interface adaptável com troca de tema em tempo real.

Design Responsivo: Funciona em Desktop e Mobile.

Feedback Visual: Uso de SweetAlert2 para modais e toasts elegantes.

🛠️ Tecnologias Utilizadas

Backend (API REST)

Framework: Django 5.x & Django REST Framework (DRF)

Real-Time: Django Channels & Daphne (ASGI)

Relatórios: ReportLab (PDF) & OpenPyXL (Excel)

Database: SQLite (Desenvolvimento)

Utils: Django-Cors-Headers, Python-Dotenv

Frontend (SPA)

Framework: Angular 17+ (Standalone Components)

Estilização: CSS3 (Variáveis CSS para Temas)

Libs Visuais: FullCalendar, SweetAlert2, Chart.js

Conexão: RxJS (Observables & WebSockets)

⚙️ Instalação e Execução

Siga os passos abaixo para rodar o projeto localmente.

Pré-requisitos

Python 3.10+

Node.js 18+ e NPM

Angular CLI (npm install -g @angular/cli)

1. Configurando o Backend (Django)

# 1. Entre na pasta do backend
cd backend

# 2. Crie e ative o ambiente virtual
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 3. Instale as dependências
pip install django djangorestframework django-cors-headers python-dotenv channels daphne reportlab openpyxl pillow django-rest-passwordreset

# 4. Configure o banco de dados
python manage.py migrate

# 5. Crie um superusuário (Admin)
python manage.py createsuperuser

# 6. Gere um código de convite (Opcional, para testar cadastro de admin)
python manage.py gerar_convite

# 7. Rode o servidor (Suporte a WebSockets e HTTP)
python manage.py runserver


O Backend estará rodando em: http://127.0.0.1:8000

2. Configurando o Frontend (Angular)

# 1. Entre na pasta do frontend (em outro terminal)
cd frontend

# 2. Instale as dependências
npm install
npm install @fullcalendar/angular @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction sweetalert2 chart.js --legacy-peer-deps

# 3. Rode a aplicação
ng serve


Acesse a aplicação em: http://localhost:4200


👥 Autores

Desenvolvido por: 
Raniel Santos
Luís Felipe
Guilherme Laurentino
Enzo Rafael

Projeto acadêmico sem fins comerciais.
