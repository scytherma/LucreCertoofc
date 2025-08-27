// plans_subscriptions.js - Gerenciamento de planos com API de Assinaturas do Mercado Pago

// Configuração do Mercado Pago
const MP_PUBLIC_KEY = 'APP_USR-851d3932-1b61-4a60-9b44-257d18cba073';

// URL base para as Edge Functions do Supabase
const SUPABASE_FUNCTIONS_BASE_URL = 'https://waixxytscfwwumzowejg.supabase.co/functions/v1';

// Configuração dos planos disponíveis com códigos de assinatura do Mercado Pago
const SUBSCRIPTION_PLANS = {
    free: {
        id: 'free',
        name: 'Gratuito',
        price: 0.00,
        period: 'month',
        description: 'Plano de teste gratuito',
        mercadopago_plan_id: '8d09d95157594e039c232b3176cce78d',
        subscription_url: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=8d09d95157594e039c232b3176cce78d',
        features: [
            'Acesso limitado à calculadora',
            'Teste por período limitado',
            'Suporte básico'
        ]
    },
    monthly: {
        id: 'monthly',
        name: 'Mensal',
        price: 27.90,
        period: 'month',
        description: 'Acesso completo por 1 mês',
        mercadopago_plan_id: '99df347204054c2bb037f1e6413d1e11',
        subscription_url: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=99df347204054c2bb037f1e6413d1e11',
        features: [
            'Calculadora ilimitada',
            'Todas as plataformas',
            'Suporte por email',
            'Relatórios básicos'
        ]
    },
    quarterly: {
        id: 'quarterly',
        name: 'Trimestral',
        price: 72.00,
        period: 'quarter',
        description: 'Acesso completo por 3 meses',
        mercadopago_plan_id: '2fbe147b1b394ded9f35440eed0d852f',
        subscription_url: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2fbe147b1b394ded9f35440eed0d852f',
        features: [
            'Calculadora ilimitada',
            'Todas as plataformas',
            'Suporte prioritário',
            'Relatórios avançados',
            'Análise de mercado'
        ],
        discount: '11% de desconto'
    },
    yearly: {
        id: 'yearly',
        name: 'Anual',
        price: 229.00,
        period: 'year',
        description: 'Acesso completo por 12 meses',
        mercadopago_plan_id: 'acb8090baa8c4dd3afad451891886810',
        subscription_url: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=acb8090baa8c4dd3afad451891886810',
        features: [
            'Calculadora ilimitada',
            'Todas as plataformas',
            'Suporte prioritário',
            'Relatórios avançados',
            'Análise de mercado',
            'Consultoria mensal',
            'API de integração'
        ],
        discount: '17% de desconto'
    }
};

// Função para selecionar um plano e redirecionar para assinatura
function selectPlan(planId) {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
        console.error('Plano não encontrado:', planId);
        showError('Plano não encontrado. Tente novamente.');
        return;
    }

    // Mostrar modal de confirmação antes de redirecionar
    showSubscriptionConfirmationModal(plan);
}

// Função para mostrar modal de confirmação de assinatura
function showSubscriptionConfirmationModal(plan) {
    const modal = document.createElement('div');
    modal.className = 'subscription-modal';
    modal.innerHTML = `
        <div class="subscription-modal-content">
            <div class="subscription-header">
                <h2>Confirmar Assinatura</h2>
                <button class="close-modal" onclick="closeSubscriptionModal()">&times;</button>
            </div>
            
            <div class="plan-summary">
                <h3>Plano ${plan.name}</h3>
                <p class="plan-price">R$ ${plan.price.toFixed(2)}${plan.period === 'month' ? '/mês' : plan.period === 'quarter' ? '/trimestre' : '/ano'}</p>
                <p class="plan-description">${plan.description}</p>
                ${plan.discount ? `<p class="plan-discount">${plan.discount}</p>` : ''}
            </div>

            <div class="plan-features">
                <h4>O que está incluído:</h4>
                <ul>
                    ${plan.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                </ul>
            </div>

            <div class="subscription-info">
                <div class="info-item">
                    <i class="fas fa-info-circle"></i>
                    <p>Você será redirecionado para o Mercado Pago para finalizar sua assinatura.</p>
                </div>
                <div class="info-item">
                    <i class="fas fa-sync-alt"></i>
                    <p>A cobrança será renovada automaticamente conforme a periodicidade escolhida.</p>
                </div>
                <div class="info-item">
                    <i class="fas fa-times-circle"></i>
                    <p>Você pode cancelar sua assinatura a qualquer momento.</p>
                </div>
            </div>

            <div class="subscription-actions">
                <button class="cancel-button" onclick="closeSubscriptionModal()">
                    Cancelar
                </button>
                <button class="subscribe-button" onclick="proceedToSubscription('${plan.id}')">
                    <i class="fas fa-credit-card"></i>
                    Assinar Agora
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Adicionar estilos do modal se não existirem
    if (!document.getElementById('subscription-modal-styles')) {
        addSubscriptionModalStyles();
    }
}

// Função para prosseguir com a assinatura
function proceedToSubscription(planId) {
    const plan = SUBSCRIPTION_PLANS[planId];
    
    try {
        // Registrar tentativa de assinatura (opcional - para analytics)
        trackSubscriptionAttempt(planId);
        
        // Redirecionar para o Mercado Pago
        window.open(plan.subscription_url, '_blank');
        
        // Fechar modal
        closeSubscriptionModal();
        
        // Mostrar mensagem de acompanhamento
        showSubscriptionFollowUp();
        
    } catch (error) {
        console.error('Erro ao processar assinatura:', error);
        showError('Erro ao processar assinatura. Tente novamente.');
    }
}

// Função para fechar modal de assinatura
function closeSubscriptionModal() {
    const modal = document.querySelector('.subscription-modal');
    if (modal) {
        modal.remove();
    }
}

// Função para mostrar acompanhamento pós-assinatura
function showSubscriptionFollowUp() {
    const followUpModal = document.createElement('div');
    followUpModal.className = 'follow-up-modal';
    followUpModal.innerHTML = `
        <div class="follow-up-modal-content">
            <div class="follow-up-header">
                <h2>Assinatura em Andamento</h2>
                <button class="close-modal" onclick="closeFollowUpModal()">&times;</button>
            </div>
            
            <div class="follow-up-content">
                <div class="follow-up-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <h3>Aguardando confirmação do pagamento</h3>
                <p>Você foi redirecionado para o Mercado Pago. Após confirmar o pagamento, sua assinatura será ativada automaticamente.</p>
                
                <div class="follow-up-steps">
                    <h4>Próximos passos:</h4>
                    <ol>
                        <li>Complete o pagamento no Mercado Pago</li>
                        <li>Aguarde a confirmação (pode levar alguns minutos)</li>
                        <li>Sua assinatura será ativada automaticamente</li>
                        <li>Você receberá um email de confirmação</li>
                    </ol>
                </div>
                
                <div class="follow-up-actions">
                    <button class="primary-button" onclick="closeFollowUpModal()">
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(followUpModal);
    
    // Auto-fechar após 10 segundos
    setTimeout(() => {
        closeFollowUpModal();
    }, 10000);
}

// Função para fechar modal de acompanhamento
function closeFollowUpModal() {
    const modal = document.querySelector('.follow-up-modal');
    if (modal) {
        modal.remove();
    }
}

// Função para registrar tentativa de assinatura (analytics)
async function trackSubscriptionAttempt(planId) {
    try {
        // Enviar para analytics ou Edge Function se necessário
        await fetch(`${SUPABASE_FUNCTIONS_BASE_URL}/track-subscription-attempt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                planId: planId,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            })
        });
    } catch (error) {
        console.log('Analytics tracking failed:', error);
        // Não bloquear o fluxo se analytics falhar
    }
}

// Função para mostrar mensagens de erro
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Função para adicionar estilos do modal
function addSubscriptionModalStyles() {
    const styles = document.createElement('style');
    styles.id = 'subscription-modal-styles';
    styles.textContent = `
        .subscription-modal, .follow-up-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .subscription-modal-content, .follow-up-modal-content {
            background: white;
            border-radius: 12px;
            padding: 0;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .subscription-header, .follow-up-header {
            background: #3483FA;
            color: white;
            padding: 20px;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .subscription-header h2, .follow-up-header h2 {
            margin: 0;
            font-size: 1.5rem;
        }
        
        .close-modal {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .plan-summary {
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #eee;
        }
        
        .plan-summary h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        
        .plan-price {
            font-size: 2rem;
            font-weight: bold;
            color: #3483FA;
            margin: 10px 0;
        }
        
        .plan-description {
            color: #666;
            margin: 10px 0;
        }
        
        .plan-discount {
            background: #e8f5e8;
            color: #2d5a2d;
            padding: 5px 10px;
            border-radius: 15px;
            display: inline-block;
            font-size: 0.9rem;
            font-weight: bold;
        }
        
        .plan-features {
            padding: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .plan-features h4 {
            margin: 0 0 15px 0;
            color: #333;
        }
        
        .plan-features ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .plan-features li {
            padding: 8px 0;
            display: flex;
            align-items: center;
        }
        
        .plan-features li i {
            color: #28a745;
            margin-right: 10px;
        }
        
        .subscription-info {
            padding: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .info-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        
        .info-item i {
            color: #3483FA;
            margin-right: 10px;
            margin-top: 2px;
        }
        
        .info-item p {
            margin: 0;
            color: #666;
            font-size: 0.9rem;
        }
        
        .subscription-actions {
            padding: 20px;
            display: flex;
            gap: 15px;
        }
        
        .cancel-button {
            flex: 1;
            padding: 12px;
            border: 2px solid #ddd;
            background: white;
            color: #666;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
        }
        
        .subscribe-button {
            flex: 2;
            padding: 12px;
            border: none;
            background: #3483FA;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .subscribe-button:hover {
            background: #2a68c8;
        }
        
        .follow-up-content {
            padding: 30px;
            text-align: center;
        }
        
        .follow-up-icon {
            font-size: 3rem;
            color: #3483FA;
            margin-bottom: 20px;
        }
        
        .follow-up-content h3 {
            margin: 0 0 15px 0;
            color: #333;
        }
        
        .follow-up-content p {
            color: #666;
            margin-bottom: 25px;
            line-height: 1.5;
        }
        
        .follow-up-steps {
            text-align: left;
            margin-bottom: 25px;
        }
        
        .follow-up-steps h4 {
            margin: 0 0 15px 0;
            color: #333;
        }
        
        .follow-up-steps ol {
            padding-left: 20px;
        }
        
        .follow-up-steps li {
            margin-bottom: 8px;
            color: #666;
        }
        
        .follow-up-actions {
            text-align: center;
        }
        
        .primary-button {
            padding: 12px 30px;
            border: none;
            background: #3483FA;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
        }
        
        .primary-button:hover {
            background: #2a68c8;
        }
        
        .error-message {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 6px;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .error-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        @media (max-width: 768px) {
            .subscription-modal-content, .follow-up-modal-content {
                width: 95%;
                margin: 10px;
            }
            
            .subscription-actions {
                flex-direction: column;
            }
            
            .cancel-button, .subscribe-button {
                flex: none;
            }
        }
    `;
    
    document.head.appendChild(styles);
}

// Função para verificar status da assinatura (opcional)
async function checkSubscriptionStatus() {
    try {
        const response = await fetch(`${SUPABASE_FUNCTIONS_BASE_URL}/check-subscription-status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getSupabaseToken()}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error('Erro ao verificar status da assinatura:', error);
    }
    
    return null;
}

// Função auxiliar para obter token do Supabase (implementar conforme sua autenticação)
async function getSupabaseToken() {
    // Implementar conforme seu sistema de autenticação
    // Retornar o token JWT do usuário logado
    return 'user-jwt-token';
}

// Expor funções globalmente para serem acessíveis do HTML/SPA
window.selectPlan = selectPlan;
window.closeSubscriptionModal = closeSubscriptionModal;
window.proceedToSubscription = proceedToSubscription;
window.closeFollowUpModal = closeFollowUpModal;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de Assinaturas do Mercado Pago carregado');
    
    // Verificar se há parâmetros de retorno do Mercado Pago
    const urlParams = new URLSearchParams(window.location.search);
    const preapprovalId = urlParams.get('preapproval_id');
    
    if (preapprovalId) {
        // Usuário retornou do Mercado Pago com assinatura
        handleSubscriptionReturn(preapprovalId);
    }
});

// Função para lidar com retorno do Mercado Pago
function handleSubscriptionReturn(preapprovalId) {
    console.log('Retorno do Mercado Pago com preapproval_id:', preapprovalId);
    
    // Mostrar mensagem de sucesso
    const successModal = document.createElement('div');
    successModal.className = 'follow-up-modal';
    successModal.innerHTML = `
        <div class="follow-up-modal-content">
            <div class="follow-up-header" style="background: #28a745;">
                <h2>Assinatura Confirmada!</h2>
                <button class="close-modal" onclick="closeFollowUpModal()">&times;</button>
            </div>
            
            <div class="follow-up-content">
                <div class="follow-up-icon" style="color: #28a745;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Sua assinatura foi ativada com sucesso!</h3>
                <p>Agora você tem acesso completo a todas as funcionalidades do Lucre Certo.</p>
                
                <div class="follow-up-actions">
                    <button class="primary-button" onclick="closeFollowUpModal(); window.location.reload();" style="background: #28a745;">
                        Começar a usar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(successModal);
    
    // Limpar URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

