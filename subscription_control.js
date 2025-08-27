// subscription_control.js - Sistema de controle de acesso baseado em assinatura

// Configuração do controle de acesso
const ACCESS_CONTROL = {
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
    const navItems = document.querySelectorAll(".nav__item");
    navItems.forEach(item => {
        item.classList.remove('disabled');
        item.onclick = () => {
            const route = item.getAttribute("data-route");
            if (route) {
                loadPage(route);
                updateActiveClass(route);
            }
        };
        const lockIcon = item.querySelector(".lock-icon");
        if (lockIcon) {
            lockIcon.remove();
        }
    });

    // Remover overlays de bloqueio
    const blockedElements = document.querySelectorAll('.feature-blocked-overlay');
    blockedElements.forEach(overlay => overlay.remove());

    // Habilitar todos os inputs
    const inputs = document.querySelectorAll(".calculator-wrapper input, .calculator-wrapper button, .calculator-wrapper select, .calculator-wrapper textarea");
    inputs.forEach(input => {
        input.disabled = false;
    });
}

// Função para aplicar limitações estritas para usuários gratuitos
function applyStrictFreeUserLimitations() {
    // Bloquear todas as abas, exceto a de planos
    blockAllTabsExceptPlans();
    
    // Bloquear todas as funcionalidades da calculadora
    blockAllCalculatorFeatures();
    
    // Mostrar modal de upgrade imediatamente
    showUpgradeModal('Acesso Completo');
}

// Função para bloquear todas as abas, exceto a de planos
function blockAllTabsExceptPlans() {
    const navItems = document.querySelectorAll(".nav__item");
    navItems.forEach(item => {
        const route = item.getAttribute("data-route");
        if (route && route !== 'planos') {
            item.classList.add('disabled');
            item.onclick = (e) => {
                e.preventDefault();
                showUpgradeModal('Acesso Completo');
            };
            if (!item.querySelector(".lock-icon")) {
                const lockIcon = document.createElement("i");
                lockIcon.className = "fas fa-lock lock-icon";
                item.appendChild(lockIcon);
            }
        }
    });
}

// Função para bloquear todas as funcionalidades da calculadora
function blockAllCalculatorFeatures() {
    const calculatorContainer = document.querySelector(".calculator-wrapper");
    if (calculatorContainer) {
        addFeatureBlockOverlay(calculatorContainer, 'Acesso Completo');
    }

    // Desabilitar todos os inputs e botões dentro da calculadora
    const inputs = document.querySelectorAll(".calculator-wrapper input, .calculator-wrapper button, .calculator-wrapper select, .calculator-wrapper textarea");
    inputs.forEach(input => {
        input.disabled = true;
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
            justify-content: space-between;
            gap: 15px;
        }
        
        .cancel-button, .upgrade-button {
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
        }
        
        .cancel-button {
            background-color: #f0f0f0;
            color: #333;
        }
        
        .upgrade-button {
            background: linear-gradient(135deg, #6a11cb, #2575fc);
            color: white;
        }
        
        .cancel-button:hover, .upgrade-button:hover {
            transform: translateY(-2px);
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 1.8rem;
            cursor: pointer;
            color: #333;
        }

        .feature-blocked-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            z-index: 10;
            cursor: pointer;
        }

        .blocked-content {
            text-align: center;
        }

        .blocked-content i {
            font-size: 2rem;
        }

        .blocked-content span {
            display: block;
            margin-top: 10px;
        }
    `;
    
    document.head.appendChild(styles);
}

// Inicializar o sistema
document.addEventListener("DOMContentLoaded", () => {
    checkUserSubscriptionStatus();
});

