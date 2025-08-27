// subscription_control.js - Sistema de controle de acesso baseado em assinatura

// Configuração do controle de acesso
const ACCESS_CONTROL = {
    // Limites para usuários gratuitos
    FREE_LIMITS: {
        calculations_per_month: 10,
        platforms_allowed: ['shopee'], // Apenas Shopee
        features_blocked: [
            'mercadolivre-tab',
            'advanced-reports',
            'export-data',
            'bulk-calculations'
        ]
    },
    
    // Status de assinatura possíveis
    SUBSCRIPTION_STATUS: {
        FREE: 'free',
        ACTIVE: 'active',
        EXPIRED: 'expired',
        CANCELLED: 'cancelled'
    }
};

// Variável global para armazenar status do usuário
let userSubscriptionStatus = {
    status: ACCESS_CONTROL.SUBSCRIPTION_STATUS.FREE,
    plan: 'free',
    calculations_used: 0,
    calculations_limit: ACCESS_CONTROL.FREE_LIMITS.calculations_per_month,
    expires_at: null
};

// Função para verificar status da assinatura do usuário
async function checkUserSubscriptionStatus() {
    try {
        // Verificar se usuário está logado
        const user = await getCurrentUser();
        if (!user) {
            return setFreeAccess();
        }

        // Buscar status da assinatura no Supabase
        const response = await fetch(`${SUPABASE_FUNCTIONS_BASE_URL}/check-subscription-status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.access_token}`
            }
        });

        if (response.ok) {
            const subscriptionData = await response.json();
            userSubscriptionStatus = {
                status: subscriptionData.status || ACCESS_CONTROL.SUBSCRIPTION_STATUS.FREE,
                plan: subscriptionData.plan_id || 'free',
                calculations_used: subscriptionData.calculations_used || 0,
                calculations_limit: subscriptionData.calculations_limit || ACCESS_CONTROL.FREE_LIMITS.calculations_per_month,
                expires_at: subscriptionData.expires_at
            };
        } else {
            setFreeAccess();
        }
    } catch (error) {
        console.error('Erro ao verificar status da assinatura:', error);
        setFreeAccess();
    }

    // Aplicar controles de acesso
    applyAccessControls();
    updateUIBasedOnSubscription();
}

// Função para definir acesso gratuito
function setFreeAccess() {
    userSubscriptionStatus = {
        status: ACCESS_CONTROL.SUBSCRIPTION_STATUS.FREE,
        plan: 'free',
        calculations_used: parseInt(localStorage.getItem('calculations_used') || '0'),
        calculations_limit: ACCESS_CONTROL.FREE_LIMITS.calculations_per_month,
        expires_at: null
    };
}

// Função para aplicar controles de acesso
function applyAccessControls() {
    if (userSubscriptionStatus.status === ACCESS_CONTROL.SUBSCRIPTION_STATUS.ACTIVE || userSubscriptionStatus.plan === 'free') {
        // Usuário com assinatura ativa ou plano de teste - liberar tudo
        enableAllFeatures();
    } else {
        // Usuário não logado ou com plano gratuito padrão - aplicar limitações estritas
        applyStrictFreeUserLimitations();
    }
}

// Função para liberar todas as funcionalidades
function enableAllFeatures() {
    // Remover bloqueios das abas
    const mercadoLivreTab = document.querySelector('[data-tab="mercadolivre"]');
    if (mercadoLivreTab) {
        mercadoLivreTab.classList.remove('disabled');
        mercadoLivreTab.onclick = () => switchTab('mercadolivre');
    }

    // Remover overlays de bloqueio
    const blockedElements = document.querySelectorAll('.feature-blocked-overlay');
    blockedElements.forEach(overlay => overlay.remove());

    // Habilitar todos os inputs
    const inputs = document.querySelectorAll('input, button, select');
    inputs.forEach(input => {
        if (input.classList.contains('premium-feature')) {
            input.disabled = false;
        }
    });
}

// Função para aplicar limitações de usuário gratuito
function applyFreeUserLimitations() {
    // Bloquear aba do Mercado Livre
    blockMercadoLivreTab();
    
    // Adicionar contador de cálculos
    addCalculationCounter();
    
    // Bloquear funcionalidades premium
    blockPremiumFeatures();
    
    // Interceptar cálculos
    interceptCalculations();
}

// Função para bloquear aba do Mercado Livre
function blockMercadoLivreTab() {
    const mercadoLivreTab = document.querySelector('[data-tab="mercadolivre"]');
    if (mercadoLivreTab) {
        mercadoLivreTab.classList.add('disabled');
        mercadoLivreTab.onclick = () => showUpgradeModal('Mercado Livre');
        
        // Adicionar ícone de bloqueio
        if (!mercadoLivreTab.querySelector('.lock-icon')) {
            const lockIcon = document.createElement('i');
            lockIcon.className = 'fas fa-lock lock-icon';
            lockIcon.style.marginLeft = '8px';
            mercadoLivreTab.appendChild(lockIcon);
        }
    }
}

// Função para adicionar contador de cálculos
function addCalculationCounter() {
    const calculatorContainer = document.querySelector('.calculator-wrapper');
    if (calculatorContainer && !document.querySelector('.calculation-counter')) {
        const counter = document.createElement('div');
        counter.className = 'calculation-counter';
        counter.innerHTML = `
            <div class="counter-content">
                <i class="fas fa-calculator"></i>
                <span>Cálculos restantes: <strong>${userSubscriptionStatus.calculations_limit - userSubscriptionStatus.calculations_used}</strong></span>
                <button onclick="showUpgradeModal('Cálculos Ilimitados')" class="upgrade-btn-small">
                    <i class="fas fa-crown"></i> Upgrade
                </button>
            </div>
        `;
        
        calculatorContainer.insertBefore(counter, calculatorContainer.firstChild);
    }
}

// Função para bloquear funcionalidades premium
function blockPremiumFeatures() {
    // Lista de seletores de funcionalidades premium
    const premiumFeatures = [
        '.export-button',
        '.advanced-settings',
        '.bulk-calculator',
        '.profit-reports'
    ];

    premiumFeatures.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            addFeatureBlockOverlay(element, 'Funcionalidade Premium');
        }
    });
}

// Função para adicionar overlay de bloqueio
function addFeatureBlockOverlay(element, featureName) {
    if (element.querySelector('.feature-blocked-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'feature-blocked-overlay';
    overlay.innerHTML = `
        <div class="blocked-content">
            <i class="fas fa-lock"></i>
            <span>Premium</span>
        </div>
    `;
    
    overlay.onclick = () => showUpgradeModal(featureName);
    
    element.style.position = 'relative';
    element.appendChild(overlay);
}

// Função para interceptar cálculos
function interceptCalculations() {
    // Interceptar evento de cálculo na calculadora
    const originalCalculate = window.calculateShopee || function() {};
    
    window.calculateShopee = function(...args) {
        if (!canPerformCalculation()) {
            showCalculationLimitModal();
            return;
        }
        
        // Incrementar contador
        incrementCalculationCount();
        
        // Executar cálculo original
        return originalCalculate.apply(this, args);
    };
}

// Função para verificar se pode realizar cálculo
function canPerformCalculation() {
    if (userSubscriptionStatus.status === ACCESS_CONTROL.SUBSCRIPTION_STATUS.ACTIVE) {
        return true;
    }
    
    return userSubscriptionStatus.calculations_used < userSubscriptionStatus.calculations_limit;
}

// Função para incrementar contador de cálculos
function incrementCalculationCount() {
    if (userSubscriptionStatus.status !== ACCESS_CONTROL.SUBSCRIPTION_STATUS.ACTIVE) {
        userSubscriptionStatus.calculations_used++;
        localStorage.setItem('calculations_used', userSubscriptionStatus.calculations_used.toString());
        
        // Atualizar contador na UI
        updateCalculationCounter();
    }
}

// Função para atualizar contador na UI
function updateCalculationCounter() {
    const counter = document.querySelector('.calculation-counter strong');
    if (counter) {
        const remaining = userSubscriptionStatus.calculations_limit - userSubscriptionStatus.calculations_used;
        counter.textContent = remaining;
        
        if (remaining <= 0) {
            counter.parentElement.innerHTML = '<span style="color: #dc3545;">Limite atingido!</span>';
        }
    }
}

// Função para mostrar modal de upgrade
function showUpgradeModal(featureName) {
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
        <div class="upgrade-modal-content">
            <div class="upgrade-header">
                <h2><i class="fas fa-crown"></i> Funcionalidade Premium</h2>
                <button class="close-modal" onclick="closeUpgradeModal()">&times;</button>
            </div>
            
            <div class="upgrade-content">
                <div class="feature-info">
                    <h3>${featureName}</h3>
                    <p>Esta funcionalidade está disponível apenas para usuários com plano pago.</p>
                </div>
                
                <div class="upgrade-benefits">
                    <h4>Com o plano pago você terá:</h4>
                    <ul>
                        <li><i class="fas fa-check"></i> Cálculos ilimitados</li>
                        <li><i class="fas fa-check"></i> Todas as plataformas (Shopee, Mercado Livre)</li>
                        <li><i class="fas fa-check"></i> Relatórios avançados</li>
                        <li><i class="fas fa-check"></i> Suporte prioritário</li>
                        <li><i class="fas fa-check"></i> Exportação de dados</li>
                    </ul>
                </div>
                
                <div class="upgrade-actions">
                    <button class="cancel-button" onclick="closeUpgradeModal()">
                        Continuar Gratuito
                    </button>
                    <button class="upgrade-button" onclick="goToPlansPage()">
                        <i class="fas fa-crown"></i>
                        Ver Planos
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addUpgradeModalStyles();
}

// Função para mostrar modal de limite de cálculos
function showCalculationLimitModal() {
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
        <div class="upgrade-modal-content">
            <div class="upgrade-header">
                <h2><i class="fas fa-exclamation-triangle"></i> Limite Atingido</h2>
                <button class="close-modal" onclick="closeUpgradeModal()">&times;</button>
            </div>
            
            <div class="upgrade-content">
                <div class="limit-info">
                    <h3>Você atingiu o limite de ${userSubscriptionStatus.calculations_limit} cálculos gratuitos</h3>
                    <p>Para continuar usando a calculadora, faça upgrade para um plano pago.</p>
                </div>
                
                <div class="upgrade-benefits">
                    <h4>Com o plano pago:</h4>
                    <ul>
                        <li><i class="fas fa-infinity"></i> Cálculos ilimitados</li>
                        <li><i class="fas fa-check"></i> Todas as plataformas</li>
                        <li><i class="fas fa-check"></i> Sem limitações</li>
                    </ul>
                </div>
                
                <div class="upgrade-actions">
                    <button class="cancel-button" onclick="closeUpgradeModal()">
                        Fechar
                    </button>
                    <button class="upgrade-button" onclick="goToPlansPage()">
                        <i class="fas fa-crown"></i>
                        Fazer Upgrade
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    addUpgradeModalStyles();
}

// Função para fechar modal de upgrade
function closeUpgradeModal() {
    const modal = document.querySelector('.upgrade-modal');
    if (modal) {
        modal.remove();
    }
}

// Função para ir para página de planos
function goToPlansPage() {
    closeUpgradeModal();
    
    // Se estiver usando SPA, navegar para planos
    if (typeof loadPage === 'function') {
        loadPage('planos');
        updateActiveClass('planos');
    } else {
        // Caso contrário, redirecionar
        window.location.href = '/planos';
    }
}

// Função para atualizar UI baseada na assinatura
function updateUIBasedOnSubscription() {
    const statusIndicator = document.querySelector('.subscription-status');
    if (statusIndicator) {
        if (userSubscriptionStatus.status === ACCESS_CONTROL.SUBSCRIPTION_STATUS.ACTIVE) {
            statusIndicator.innerHTML = `
                <i class="fas fa-crown" style="color: #ffd700;"></i>
                <span>Plano ${userSubscriptionStatus.plan}</span>
            `;
        } else {
            statusIndicator.innerHTML = `
                <i class="fas fa-user"></i>
                <span>Gratuito</span>
            `;
        }
    }
}

// Função para obter usuário atual (implementar conforme seu sistema de auth)
async function getCurrentUser() {
    try {
        // Implementar conforme seu sistema de autenticação
        // Exemplo com Supabase:
        // const { data: { user } } = await supabase.auth.getUser();
        // return user;
        
        const { data: { user } } = await supabaseClient.auth.getUser();
        return user;
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        return null;
    }
}

// Função para adicionar estilos dos modais
function addUpgradeModalStyles() {
    if (document.getElementById('upgrade-modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'upgrade-modal-styles';
    styles.textContent = `
        .upgrade-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .upgrade-modal-content {
            background: white;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .upgrade-header {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #333;
            padding: 20px;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .upgrade-header h2 {
            margin: 0;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .upgrade-content {
            padding: 30px;
        }
        
        .feature-info, .limit-info {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .feature-info h3, .limit-info h3 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .upgrade-benefits {
            margin-bottom: 25px;
        }
        
        .upgrade-benefits h4 {
            color: #333;
            margin-bottom: 15px;
        }
        
        .upgrade-benefits ul {
            list-style: none;
            padding: 0;
        }
        
        .upgrade-benefits li {
            padding: 8px 0;
            display: flex;
            align-items: center;
        }
        
        .upgrade-benefits li i {
            color: #28a745;
            margin-right: 10px;
            width: 16px;
        }
        
        .upgrade-actions {
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
        }
        
        .upgrade-button {
            flex: 2;
            padding: 12px;
            border: none;
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #333;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .calculation-counter {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .counter-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
        }
        
        .counter-content i {
            color: #3483FA;
        }
        
        .upgrade-btn-small {
            padding: 6px 12px;
            border: none;
            background: #ffd700;
            color: #333;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .feature-blocked-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: inherit;
        }
        
        .blocked-content {
            color: white;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
        }
        
        .blocked-content i {
            font-size: 1.5rem;
        }
        
        .tab-button.disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .lock-icon {
            color: #dc3545;
        }
        
        @media (max-width: 768px) {
            .upgrade-actions {
                flex-direction: column;
            }
            
            .counter-content {
                flex-direction: column;
                text-align: center;
            }
        }
    `;
    
    document.head.appendChild(styles);
}

// Expor funções globalmente
window.checkUserSubscriptionStatus = checkUserSubscriptionStatus;
window.closeUpgradeModal = closeUpgradeModal;
window.goToPlansPage = goToPlansPage;
window.showUpgradeModal = showUpgradeModal;

// Inicializar controle de acesso quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de controle de acesso carregado');
    
    // Verificar status da assinatura
    checkUserSubscriptionStatus();
    
    // Verificar a cada 5 minutos se há mudanças na assinatura
    setInterval(checkUserSubscriptionStatus, 5 * 60 * 1000);
});

// Função para resetar contador de cálculos (para testes)
function resetCalculationCount() {
    localStorage.removeItem('calculations_used');
    userSubscriptionStatus.calculations_used = 0;
    updateCalculationCounter();
}

// Expor função de reset para testes
window.resetCalculationCount = resetCalculationCount;
