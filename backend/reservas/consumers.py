import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificacaoConsumer(AsyncWebsocketConsumer):
    """
    Consumer para gerenciar conexões WebSocket.
    
    Diferente de uma View HTTP (que recebe requisição -> processa -> responde -> encerra),
    o Consumer mantém uma conexão persistente aberta (handshake).
    
    Isso permite comunicação "Full-Duplex": servidor e cliente podem enviar dados
    um ao outro a qualquer momento, sem necessidade de nova requisição.
    """

    async def connect(self):
        """
        Evento disparado quando um cliente (Frontend) tenta abrir uma conexão WebSocket.
        """
        # Define um nome de grupo estático.
        self.group_name = "admin_reservas"

        # Adiciona o canal atual (self.channel_name) ao grupo.
        # self.channel_name é um ID único gerado automaticamente para cada aba/usuário conectado.
        # O 'await' é crucial aqui: como WebSockets lidam com milhares de conexões,
        # a operação é assíncrona para não travar o servidor esperando o banco de dados (Redis/Memória).
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # Aceita a conexão, completando o handshake HTTP -> WebSocket.
        await self.accept()

    async def disconnect(self, close_code):
        """
        Evento disparado quando o cliente fecha a aba ou a internet cai.
        É vital limpar o grupo para não tentar enviar mensagens para fantasmas.
        """
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Manipuladores de Eventos (Event Handlers)

    async def enviar_notificacao(self, event):
        """
        Este método NÃO é chamado pelo usuário. Ele é chamado internamente pelo
        Channel Layer (Redis/In-Memory) quando algo acontece no Backend.
        
        Fluxo:
        1. Alguém cria reserva na API (views.py)
        2. A View manda mensagem para o grupo "admin_reservas" com type="enviar_notificacao"
        3. O Django Channels busca este método (baseado no nome do type) e o executa.
        """
        mensagem = event['message']

        # Envia a mensagem final (JSON string) para o WebSocket do cliente conectado.
        # É aqui que o popup aparece na tela do Admin.
        await self.send(text_data=json.dumps({
            'message': mensagem
        }))