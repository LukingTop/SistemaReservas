from django.views.generic.edit import CreateView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Reserva
from .forms import ReservaForm

class ReservaCreateView(LoginRequiredMixin, CreateView):
    model = Reserva
    form_class = ReservaForm
    template_name = 'reservas/reserva_form.html' 
    success_url = reverse_lazy('home') 
    
    def form_valid(self, form):
        form.instance.usuario = self.request.user
        return super().form_valid(form)