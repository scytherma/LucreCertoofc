// plans.js - Gerenciamento de planos e integração com Mercado Pago

// Configuração do Mercado Pago
const MP_PUBLIC_KEY = 'APP_USR-851d3932-1b61-4a60-9b44-257d18cba073';

// URL base para as Edge Functions do Supabase
const SUPABASE_FUNCTIONS_BASE_URL = 'https://waixxytscfwwumzowejg.supabase.co/functions/v1';

// Inicializar Mercado Pago
const mp = new MercadoPago(MP_PUBLIC_KEY, {
    locale: 'pt-BR'
});

// Configuração dos planos disponíveis
const PLANS = {
    monthly: {
        id: 'monthly',
        name: 'Mensal',
        price: 27.90,
        period: 'month',
        description: 'Acesso completo por 1 mês',
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

// Função para criar preferência de pagamento
async function createPaymentPreference(planId) {
    const plan = PLANS[planId];
    if (!plan) {
        throw new Error('Plano não encontrado');
    }

    try {
        const response = await fetch(`${SUPABASE_FUNCTIONS_BASE_URL}/create-preference`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                planId: planId,
                title: `Plano ${plan.name} - Lucre Certo`,
                price: plan.price,
                description: plan.description,
                period: plan.period
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao criar preferência de pagamento');
        }

        const preference = await response.json();
        return preference;
    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        throw error;
    }
}

// Função para processar pagamento com cartão
async function processCardPayment(planId, cardData) {
    const plan = PLANS[planId];
    
    try {
        // Criar token do cartão
        const cardToken = await mp.createCardToken({
            cardNumber: cardData.number,
            cardholderName: cardData.holderName,
            cardExpirationMonth: cardData.expirationMonth,
            cardExpirationYear: cardData.expirationYear,
            securityCode: cardData.securityCode,
            identificationType: cardData.identificationType,
            identificationNumber: cardData.identificationNumber
        });

        // Processar pagamento
        const response = await fetch(`${SUPABASE_FUNCTIONS_BASE_URL}/process-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: cardToken.id,
                planId: planId,
                amount: plan.price,
                description: `Plano ${plan.name} - Lucre Certo`,
                installments: 1,
                paymentMethodId: cardData.paymentMethodId,
                email: cardData.email,
                identificationType: cardData.identificationType,
                identificationNumber: cardData.identificationNumber
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao processar pagamento');
        }

        const payment = await response.json();
        return payment;
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        throw error;
    }
}

// Função para processar pagamento via PIX
async function processPixPayment(planId, email) {
    const plan = PLANS[planId];
    const { data: { session } } = await supabaseClient.auth.getSession();
    try {
        const response = await fetch(`${SUPABASE_FUNCTIONS_BASE_URL}/process-pix-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                planId: planId,
                amount: plan.price,
                description: `Plano ${plan.name} - Lucre Certo`,
                email: email
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao processar pagamento PIX');
        }

        const payment = await response.json();
        return payment;
    } catch (error) {
        console.error('Erro ao processar pagamento PIX:', error);
        throw error;
    }
}

// Função para selecionar um plano
function selectPlan(planId) {
    const plan = PLANS[planId];
    if (!plan) {
        console.error('Plano não encontrado:', planId);
        return;
    }

    // Mostrar modal de pagamento
    showPaymentModal(plan);
}

// Função para mostrar modal de pagamento
function showPaymentModal(plan) {
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="payment-modal-content">
            <div class="payment-header">
                <h2>Finalizar Assinatura</h2>
                <button class="close-modal" onclick="closePaymentModal()">&times;</button>
            </div>
            
            <div class="plan-summary">
                <h3>Plano ${plan.name}</h3>
                <p class="plan-price">R$ ${plan.price.toFixed(2)}</p>
                <p class="plan-description">${plan.description}</p>
            </div>

            <div class="payment-methods">
                <div class="payment-method-tabs">
                    <button class="payment-tab active" onclick="switchPaymentMethod('card')">
                        <i class="fas fa-credit-card"></i>
                        Cartão de Crédito
                    </button>
                    <button class="payment-tab" onclick="switchPaymentMethod('pix')">
                        <i class="fas fa-qrcode"></i>
                        PIX
                    </button>
                </div>

                <div id="card-payment" class="payment-form active">
                    <form id="card-form">
                        <div class="form-group">
                            <label>Número do Cartão</label>
                            <input type="text" id="card-number" placeholder="0000 0000 0000 0000" maxlength="19">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Validade</label>
                                <input type="text" id="card-expiry" placeholder="MM/AA" maxlength="5">
                            </div>
                            <div class="form-group">
                                <label>CVV</label>
                                <input type="text" id="card-cvv" placeholder="000" maxlength="4">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Nome no Cartão</label>
                            <input type="text" id="card-holder-name" placeholder="Nome completo">
                        </div>
                        
                        <div class="form-group">
                            <label>CPF</label>
                            <input type="text" id="card-cpf" placeholder="000.000.000-00" maxlength="14">
                        </div>
                        
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="card-email" placeholder="seu@email.com">
                        </div>
                        
                        <button type="submit" class="pay-button">
                            <i class="fas fa-lock"></i>
                            Pagar R$ ${plan.price.toFixed(2)}
                        </button>
                    </form>
                </div>

                <div id="pix-payment" class="payment-form">
                    <form id="pix-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="pix-email" placeholder="seu@email.com">
                        </div>
                        
                        <button type="submit" class="pay-button">
                            <i class="fas fa-qrcode"></i>
                            Gerar PIX
                        </button>
                    </form>
                    
                    <div id="pix-result" class="pix-result" style="display: none;">
                        <div class="pix-qr-code">
                            <img id="pix-qr-image" src="" alt="QR Code PIX">
                        </div>
                        <div class="pix-code">
                            <label>Código PIX Copia e Cola:</label>
                            <textarea id="pix-code-text" readonly></textarea>
                            <button onclick="copyPixCode()" class="copy-button">
                                <i class="fas fa-copy"></i>
                                Copiar Código
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Adicionar event listeners
    setupPaymentFormListeners(plan);
}

// Função para configurar listeners dos formulários de pagamento
function setupPaymentFormListeners(plan) {
    // Formulário de cartão
    const cardForm = document.getElementById('card-form');
    if (cardForm) {
        cardForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleCardPayment(plan);
        });
    }

    // Formulário PIX
    const pixForm = document.getElementById('pix-form');
    if (pixForm) {
        pixForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handlePixPayment(plan);
        });
    }

    // Máscaras para inputs
    setupInputMasks();
}

// Função para configurar máscaras dos inputs
function setupInputMasks() {
    // Máscara para número do cartão
    const cardNumber = document.getElementById('card-number');
    if (cardNumber) {
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Máscara para validade
    const cardExpiry = document.getElementById('card-expiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    // Máscara para CPF
    const cardCpf = document.getElementById('card-cpf');
    if (cardCpf) {
        cardCpf.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    }
}

// Função para processar pagamento com cartão
async function handleCardPayment(plan) {
    const cardData = {
        number: document.getElementById('card-number').value.replace(/\s/g, ''),
        holderName: document.getElementById('card-holder-name').value,
        expirationMonth: document.getElementById('card-expiry').value.split('/')[0],
        expirationYear: '20' + document.getElementById('card-expiry').value.split('/')[1],
        securityCode: document.getElementById('card-cvv').value,
        identificationType: 'CPF',
        identificationNumber: document.getElementById('card-cpf').value.replace(/\D/g, ''),
        email: document.getElementById('card-email').value
    };

    try {
        // Mostrar loading
        showPaymentLoading();

        // Processar pagamento
        const result = await processCardPayment(plan.id, cardData);
        
        if (result.status === 'approved') {
            showPaymentSuccess(result);
            // Atualizar status do usuário no Supabase
            await updateUserSubscription(plan.id, result.id);
        } else {
            showPaymentError('Pagamento não aprovado. Verifique os dados do cartão.');
        }
    } catch (error) {
        console.error('Erro no pagamento:', error);
        showPaymentError('Erro ao processar pagamento. Tente novamente.');
    } finally {
        hidePaymentLoading();
    }
}

// Função para processar pagamento PIX
async function handlePixPayment(plan) {
    const email = document.getElementById('pix-email').value;

    try {
        // Mostrar loading
        showPaymentLoading();

        // Gerar PIX
        const result = await processPixPayment(plan.id, email);
        
        if (result.status === 'pending') {
            showPixQRCode(result);
        } else {
            showPaymentError('Erro ao gerar PIX. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        showPaymentError('Erro ao gerar PIX. Tente novamente.');
    } finally {
        hidePaymentLoading();
    }
}

// Função para mostrar QR Code do PIX
function showPixQRCode(paymentResult) {
    const pixResult = document.getElementById('pix-result');
    const pixForm = document.getElementById('pix-form');
    
    if (pixResult && pixForm) {
        // Esconder formulário e mostrar resultado
        pixForm.style.display = 'none';
        pixResult.style.display = 'block';
        
        // Definir QR Code e código PIX
        document.getElementById('pix-qr-image').src = paymentResult.point_of_interaction.transaction_data.qr_code_base64;
        document.getElementById('pix-code-text').value = paymentResult.point_of_interaction.transaction_data.qr_code;
        
        // Iniciar verificação de status do pagamento
        startPaymentStatusCheck(paymentResult.id);
    }
}

// Função para copiar código PIX
function copyPixCode() {
    const pixCodeText = document.getElementById('pix-code-text');
    if (pixCodeText) {
        pixCodeText.select();
        document.execCommand('copy');
        
        // Mostrar feedback
        const copyButton = document.querySelector('.copy-button');
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        copyButton.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            copyButton.innerHTML = originalText;
            copyButton.style.backgroundColor = '';
        }, 2000);
    }
}

// Função para verificar status do pagamento
async function startPaymentStatusCheck(paymentId) {
    const checkInterval = setInterval(async () => {
        try {
            const response = await fetch(`${SUPABASE_FUNCTIONS_BASE_URL}/payment-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ paymentId: paymentId })
            });
            const payment = await response.json();
            
            if (payment.status === 'approved') {
                clearInterval(checkInterval);
                showPaymentSuccess(payment);
                // Atualizar status do usuário no Supabase
                await updateUserSubscription(payment.metadata.plan_id, payment.id);
            } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
                clearInterval(checkInterval);
                showPaymentError(`Pagamento ${payment.status}.`);
            }
        } catch (error) {
            console.error('Erro ao verificar status do pagamento:', error);
            clearInterval(checkInterval);
            showPaymentError('Erro ao verificar status do pagamento.');
        }
    }, 5000); // Verifica a cada 5 segundos
}

// Função para atualizar a assinatura do usuário no Supabase
async function updateUserSubscription(planId, paymentId) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('Usuário não autenticado.');
        }

        const { data, error } = await supabase
            .from('user_subscriptions')
            .upsert({
                user_id: user.id,
                user_email: user.email,
                plan_id: planId,
                payment_id: paymentId,
                status: 'active',
                expires_at: getExpirationDate(planId)
            }, { onConflict: 'user_id, plan_id' });

        if (error) {
            throw new Error(error.message);
        }
        console.log('Assinatura do usuário atualizada no Supabase:', data);
    } catch (error) {
        console.error('Erro ao atualizar assinatura do usuário no Supabase:', error);
    }
}

// Função auxiliar para calcular a data de expiração
function getExpirationDate(planId) {
    const now = new Date();
    switch (planId) {
        case 'monthly':
            now.setMonth(now.getMonth() + 1);
            break;
        case 'quarterly':
            now.setMonth(now.getMonth() + 3);
            break;
        case 'yearly':
            now.setFullYear(now.getFullYear() + 1);
            break;
    }
    return now.toISOString();
}

// Funções de UI para feedback ao usuário
function showPaymentLoading() {
    // Implementar lógica para mostrar um spinner ou mensagem de carregamento
    console.log('Mostrando carregamento...');
}

function hidePaymentLoading() {
    // Implementar lógica para esconder o spinner ou mensagem de carregamento
    console.log('Escondendo carregamento...');
}

function showPaymentSuccess(payment) {
    alert(`Pagamento aprovado! ID: ${payment.id}`);
    closePaymentModal();
    // Redirecionar ou atualizar UI para refletir o novo plano
}

function showPaymentError(message) {
    alert(`Erro no pagamento: ${message}`);
    hidePaymentLoading();
}

function closePaymentModal() {
    const modal = document.querySelector('.payment-modal');
    if (modal) {
        modal.remove();
    }
}

function switchPaymentMethod(method) {
    const cardTab = document.getElementById('card-payment');
    const pixTab = document.getElementById('pix-payment');
    const cardButton = document.querySelector('.payment-tab[onclick="switchPaymentMethod(\'card\')"]');
    const pixButton = document.querySelector('.payment-tab[onclick="switchPaymentMethod(\'pix\')"]');

    if (method === 'card') {
        cardTab.classList.add('active');
        pixTab.classList.remove('active');
        cardButton.classList.add('active');
        pixButton.classList.remove('active');
    } else if (method === 'pix') {
        cardTab.classList.remove('active');
        pixTab.classList.add('active');
        cardButton.classList.remove('active');
        pixButton.classList.add('active');
    }
}

// Expor a função selectPlanPage globalmente para ser acessível do HTML/SPA
window.selectPlanPage = function(planId) {
    selectPlan(planId);
};
