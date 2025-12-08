import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificacaoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
       
        self.group_name = "admin_reservas"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    #
    async def enviar_notificacao(self, event):
        mensagem = event['message']

        await self.send(text_data=json.dumps({
            'message': mensagem
        }))