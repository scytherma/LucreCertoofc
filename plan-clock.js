// Gerenciamento do relógio do plano
class PlanClock {
    constructor() {
        this.planData = {
            type: 'Plano Gratuito',
            expiryDate: null,
            status: 'Ativo'
        };
        this.init();
    }

    init() {
        this.loadPlanData();
        this.updateDisplay();
        this.startRealTimeClock();
    }

    async loadPlanData() {
        try {
            const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
            if (sessionError || !session || !session.access_token) {
                this.setPlanData('Plano Gratuito', null, 'Ativo');
                return;
            }

            const accessToken = session.access_token;
            const response = await fetch(`${SUPABASE_FUNCTIONS_BASE_URL}/check-subscription-status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const subscriptionData = await response.json();
                console.log("Dados da assinatura para o relógio:", subscriptionData);
                
                if (subscriptionData.status === 'active' && subscriptionData.plan_id && subscriptionData.expires_at) {
                    const planName = this.getPlanName(subscriptionData.plan_id);
                    const expiryDate = new Date(subscriptionData.expires_at);
                    const status = this.getStatusText(expiryDate);
                    
                    this.setPlanData(planName, expiryDate, status);
                } else {
                    this.setPlanData('Plano Gratuito', null, 'Ativo');
                }
            } else {
                this.setPlanData('Plano Gratuito', null, 'Ativo');
            }
        } catch (error) {
            console.error('Erro ao carregar dados do plano:', error);
            this.setPlanData('Plano Gratuito', null, 'Ativo');
        }
    }

    setPlanData(type, expiryDate, status) {
        this.planData = {
            type: type,
            expiryDate: expiryDate,
            status: status
        };
        this.updateDisplay();
    }

    getPlanName(planId) {
        const planNames = {
            'basic': 'Plano Básico',
            'premium': 'Plano Premium',
            'pro': 'Plano Pro',
            'enterprise': 'Plano Enterprise',
            'free': 'Plano Gratuito'
        };
        return planNames[planId] || 'Plano Premium';
    }

    getStatusText(expiryDate) {
        if (!expiryDate) return 'Ativo';
        
        const now = new Date();
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'Expirado';
        } else if (diffDays <= 7) {
            return `Expira em ${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
        } else {
            return 'Ativo';
        }
    }

    formatDate(date) {
        if (!date) return 'Sem data de expiração';
        
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return date.toLocaleDateString('pt-BR', options);
    }

    updateDisplay() {
        const planTypeElement = document.getElementById('planType');
        const planExpiryElement = document.getElementById('planExpiry');
        const planStatusElement = document.getElementById('planStatus');

        if (planTypeElement) {
            planTypeElement.textContent = this.planData.type;
        }

        if (planExpiryElement) {
            if (this.planData.expiryDate) {
                planExpiryElement.textContent = `Expira em: ${this.formatDate(this.planData.expiryDate)}`;
            } else {
                planExpiryElement.textContent = 'Plano gratuito - sem expiração';
            }
        }

        if (planStatusElement) {
            planStatusElement.textContent = `Status: ${this.planData.status}`;
            
            // Adicionar classe CSS baseada no status
            planStatusElement.className = '';
            if (this.planData.status === 'Expirado') {
                planStatusElement.classList.add('status-expired');
            } else if (this.planData.status.includes('Expira em')) {
                planStatusElement.classList.add('status-warning');
            } else {
                planStatusElement.classList.add('status-active');
            }
        }

        // Atualizar cor do relógio baseada no status
        this.updateClockColor();
    }

    updateClockColor() {
        const clockElement = document.getElementById('planClock');
        if (!clockElement) return;

        // Remover classes de status anteriores
        clockElement.classList.remove('clock-expired', 'clock-warning', 'clock-active');

        if (this.planData.status === 'Expirado') {
            clockElement.classList.add('clock-expired');
        } else if (this.planData.status.includes('Expira em')) {
            clockElement.classList.add('clock-warning');
        } else {
            clockElement.classList.add('clock-active');
        }
    }

    startRealTimeClock() {
        // Atualizar o status a cada minuto
        setInterval(() => {
            if (this.planData.expiryDate) {
                const newStatus = this.getStatusText(this.planData.expiryDate);
                if (newStatus !== this.planData.status) {
                    this.planData.status = newStatus;
                    this.updateDisplay();
                }
            }
        }, 60000); // 1 minuto

        // Recarregar dados do plano a cada 5 minutos
        setInterval(() => {
            this.loadPlanData();
        }, 300000); // 5 minutos
    }

    // Método público para forçar atualização
    refresh() {
        this.loadPlanData();
    }
}

// Inicializar o relógio do plano quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que o Supabase esteja inicializado
    setTimeout(() => {
        if (typeof supabaseClient !== 'undefined') {
            window.planClock = new PlanClock();
        } else {
            console.warn('Supabase client não encontrado, tentando novamente...');
            setTimeout(() => {
                if (typeof supabaseClient !== 'undefined') {
                    window.planClock = new PlanClock();
                }
            }, 2000);
        }
    }, 1000);
});

// Função global para atualizar o relógio (pode ser chamada de outros scripts)
window.updatePlanClock = function() {
    if (window.planClock) {
        window.planClock.refresh();
    }
};

