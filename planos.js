// Variáveis globais
let selectedPlan = null;
let selectedPaymentMethod = null;

// Configuração dos planos
const PLANS_CONFIG = {
    trial: {
        name: "Teste Grátis",
        price: 0,
        period: "3 dias",
        priceId: "", // Será configurado com trial_period_days no backend
        description: "Acesso completo por 3 dias"
    },
    monthly: {
        name: "Plano Mensal",
        price: 49.90,
        period: "mês",
        priceId: "price_mensal_id", // Substitua pelo ID real da Stripe
        description: "Cobrança mensal"
    },
    quarterly: {
        name: "Plano Trimestral", 
        price: 129.90,
        period: "trimestre",
        priceId: "price_trimestral_id", // Substitua pelo ID real da Stripe
        description: "Cobrança trimestral"
    },
    annual: {
        name: "Plano Anual",
        price: 399.90,
        period: "ano", 
        priceId: "price_anual_id", // Substitua pelo ID real da Stripe
        description: "Cobrança anual"
    }
};

// Inicialização quando a página carrega
document.addEventListener("DOMContentLoaded", function() {
    initializePage();
    setupEventListeners();
});

// Verificar autenticação e inicializar página
async function initializePage() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            window.location.href = './login.html';
            return;
        }
        
        // Verificar se já tem assinatura ativa
        const { data: subscriptionData, error } = await supabaseClient
            .from("subscriptions")
            .select("status, trial_end, current_period_end")
            .eq("user_id", user.id)
            .single();

        if (subscriptionData && !error) {
            const now = new Date();
            let hasActiveSubscription = false;
            
            if (subscriptionData.status === "active") {
                hasActiveSubscription = true;
            } else if (subscriptionData.status === "trialing" && new Date(subscriptionData.trial_end) > now) {
                hasActiveSubscription = true;
            }
            
            if (hasActiveSubscription) {
                window.location.href = './index.html';
                return;
            }
        }
        
    } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        showMessage("Erro ao carregar página. Tente novamente.", "error");
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Botões de seleção de plano
    const planButtons = document.querySelectorAll('.select-plan-btn');
    planButtons.forEach(button => {
        button.addEventListener('click', function() {
            selectPlan(this.dataset.plan, this.dataset.priceId);
        });
    });

    // Botões de método de pagamento
    const paymentButtons = document.querySelectorAll('.payment-btn');
    paymentButtons.forEach(button => {
        button.addEventListener('click', function() {
            selectPaymentMethod(this.id.replace('Btn', ''));
        });
    });

    // Botão de aplicar cupom
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }

    // Botão de finalizar
    const finalizeBtn = document.getElementById('finalizeBtn');
    if (finalizeBtn) {
        finalizeBtn.addEventListener('click', finalizePurchase);
    }

    // Máscaras para os campos
    setupInputMasks();
}

// Selecionar plano
function selectPlan(planType, priceId) {
    selectedPlan = {
        type: planType,
        priceId: priceId,
        config: PLANS_CONFIG[planType]
    };

    // Atualizar visual dos botões
    const planButtons = document.querySelectorAll('.select-plan-btn');
    planButtons.forEach(btn => {
        btn.classList.remove('selected');
        btn.textContent = btn.textContent.replace(' ✓', '');
    });

    const selectedButton = document.querySelector(`[data-plan="${planType}"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected');
        selectedButton.textContent += ' ✓';
    }

    // Mostrar botões de pagamento
    document.querySelector('.payment-buttons').style.display = 'flex';
    
    showMessage(`Plano ${selectedPlan.config.name} selecionado!`, "success");
}

// Selecionar método de pagamento
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;

    // Atualizar visual dos botões
    const paymentButtons = document.querySelectorAll('.payment-btn');
    paymentButtons.forEach(btn => btn.classList.remove('active'));

    const selectedButton = document.getElementById(method + 'Btn');
    if (selectedButton) {
        selectedButton.classList.add('active');
    }

    // Mostrar formulário se cartão for selecionado
    const paymentForm = document.getElementById('paymentForm');
    if (method === 'cartao') {
        paymentForm.style.display = 'block';
        updateFinalizeButton();
    } else {
        paymentForm.style.display = 'none';
        // Para PIX, pode finalizar direto
        updateFinalizeButton();
    }
}

// Atualizar botão de finalizar
function updateFinalizeButton() {
    const finalizeBtn = document.getElementById('finalizeBtn');
    if (!finalizeBtn) return;

    if (selectedPaymentMethod === 'pix') {
        finalizeBtn.innerHTML = '<span class="btn-icon">📱</span> Gerar PIX';
    } else {
        finalizeBtn.innerHTML = '<span class="btn-icon">💳</span> Assinar agora';
    }
}

// Aplicar cupom
function applyCoupon() {
    const couponInput = document.getElementById('couponInput');
    const couponCode = couponInput.value.trim();

    if (!couponCode) {
        showMessage("Digite um código de cupom válido.", "error");
        return;
    }

    // Aqui você implementaria a lógica de validação do cupom
    // Por enquanto, apenas uma simulação
    showMessage("Cupom aplicado com sucesso!", "success");
    
    // Simular desconto visual (opcional)
    // updatePricesWithDiscount(discountPercent);
}

// Finalizar compra
async function finalizePurchase() {
    if (!selectedPlan) {
        showMessage("Selecione um plano primeiro.", "error");
        return;
    }

    if (!selectedPaymentMethod) {
        showMessage("Selecione um método de pagamento.", "error");
        return;
    }

    // Validar formulário se cartão for selecionado
    if (selectedPaymentMethod === 'cartao' && !validateForm()) {
        return;
    }

    const finalizeBtn = document.getElementById('finalizeBtn');
    finalizeBtn.disabled = true;
    finalizeBtn.textContent = "Processando...";

    try {
        // Obter usuário atual
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            throw new Error("Usuário não autenticado");
        }

        // Chamar backend para criar sessão de checkout da Stripe
        const response = await fetch("https://lucre-certoofc-29rr7lbij-scythermas-projects.vercel.app/create-checkout-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                planType: selectedPlan.type,
                priceId: selectedPlan.priceId,
                userId: user.id,
                paymentMethod: selectedPaymentMethod,
                // Adicionar dados do formulário se necessário
                customerData: selectedPaymentMethod === 'cartao' ? getFormData() : null
            }),
        });

        const data = await response.json();

        if (data.url) {
            // Redirecionar para checkout da Stripe
            window.location.href = data.url;
        } else {
            throw new Error(data.error || "Erro ao processar pagamento");
        }

    } catch (error) {
        console.error("Erro ao finalizar compra:", error);
        showMessage("Erro ao processar pagamento. Tente novamente.", "error");
    } finally {
        finalizeBtn.disabled = false;
        updateFinalizeButton();
    }
}

// Validar formulário
function validateForm() {
    const requiredFields = [
        'cardholderName',
        'cardholderEmail', 
        'cardholderDocument',
        'cep',
        'addressNumber',
        'phone',
        'cardNumber',
        'cardExpiry',
        'cardCvv'
    ];

    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            showMessage(`Campo "${field.placeholder}" é obrigatório.`, "error");
            field.focus();
            return false;
        }
    }

    // Validações específicas
    const email = document.getElementById('cardholderEmail').value;
    if (!isValidEmail(email)) {
        showMessage("Digite um e-mail válido.", "error");
        return false;
    }

    return true;
}

// Obter dados do formulário
function getFormData() {
    return {
        name: document.getElementById('cardholderName').value,
        email: document.getElementById('cardholderEmail').value,
        document: document.getElementById('cardholderDocument').value,
        cep: document.getElementById('cep').value,
        addressNumber: document.getElementById('addressNumber').value,
        addressComplement: document.getElementById('addressComplement').value,
        phone: document.getElementById('phone').value,
        cardNumber: document.getElementById('cardNumber').value,
        cardExpiry: document.getElementById('cardExpiry').value,
        cardCvv: document.getElementById('cardCvv').value
    };
}

// Configurar máscaras de input
function setupInputMasks() {
    // Máscara para telefone
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
            e.target.value = value;
        });
    }

    // Máscara para CPF/CNPJ
    const documentInput = document.getElementById('cardholderDocument');
    if (documentInput) {
        documentInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                // CPF
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else {
                // CNPJ
                value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            }
            e.target.value = value;
        });
    }

    // Máscara para CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
            e.target.value = value;
        });
    }

    // Máscara para cartão
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
            e.target.value = value;
        });
    }

    // Máscara para validade
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d{2})/, '$1/$2');
            e.target.value = value;
        });
    }
}

// Funções utilitárias
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showMessage(message, type = "info") {
    const messageArea = document.getElementById('messageArea');
    if (!messageArea) return;

    messageArea.textContent = message;
    messageArea.className = `message-area ${type}`;
    messageArea.style.display = 'block';

    // Auto-hide após 5 segundos
    setTimeout(() => {
        messageArea.style.display = 'none';
    }, 5000);
}

