import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5';

// Configuração do Mercado Pago
const MP_ACCESS_TOKEN = 'APP_USR-6442150651828861-082422-a0941c4b8afaa6a4a646f9ce792e22ce-1057395835';
const MP_BASE_URL = 'https://api.mercadopago.com';

// Função para criar preferência de pagamento
export async function createPaymentPreference(request) {
    try {
        const { planId, title, price, description, period } = await request.json();
        
        // Validar dados de entrada
        if (!planId || !title || !price) {
            return new Response(
                JSON.stringify({ error: 'Dados obrigatórios não fornecidos' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Configurar preferência de pagamento
        const preference = {
            items: [
                {
                    id: planId,
                    title: title,
                    description: description,
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: parseFloat(price)
                }
            ],
            payer: {
                name: '',
                surname: '',
                email: '',
                identification: {
                    type: 'CPF',
                    number: ''
                }
            },
            payment_methods: {
                excluded_payment_methods: [],
                excluded_payment_types: [],
                installments: 12
            },
            back_urls: {
                success: `${request.headers.get('origin')}/payment-success`,
                failure: `${request.headers.get('origin')}/payment-failure`,
                pending: `${request.headers.get('origin')}/payment-pending`
            },
            auto_return: 'approved',
            external_reference: `plan_${planId}_${Date.now()}`,
            notification_url: `${request.headers.get('origin')}/api/webhook`,
            metadata: {
                plan_id: planId,
                plan_period: period
            }
        };

        // Fazer requisição para API do Mercado Pago
        const response = await fetch(`${MP_BASE_URL}/checkout/preferences`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preference)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Erro na API do Mercado Pago:', error);
            throw new Error('Erro ao criar preferência de pagamento');
        }

        const preferenceData = await response.json();
        
        return new Response(
            JSON.stringify(preferenceData),
            { 
                status: 200, 
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                } 
            }
        );

    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        return new Response(
            JSON.stringify({ error: 'Erro interno do servidor' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

// Função para processar pagamento com cartão
export async function processCardPayment(request) {
    try {
        const { 
            token, 
            planId, 
            amount, 
            description, 
            installments, 
            paymentMethodId, 
            email, 
            identificationType, 
            identificationNumber 
        } = await request.json();

        // Validar dados obrigatórios
        if (!token || !planId || !amount || !email) {
            return new Response(
                JSON.stringify({ error: 'Dados obrigatórios não fornecidos' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Configurar dados do pagamento
        const paymentData = {
            transaction_amount: parseFloat(amount),
            token: token,
            description: description,
            installments: parseInt(installments) || 1,
            payment_method_id: paymentMethodId,
            payer: {
                email: email,
                identification: {
                    type: identificationType || 'CPF',
                    number: identificationNumber
                }
            },
            external_reference: `plan_${planId}_${Date.now()}`,
            metadata: {
                plan_id: planId
            },
            notification_url: `${request.headers.get('origin')}/api/webhook`
        };

        // Fazer requisição para API do Mercado Pago
        const response = await fetch(`${MP_BASE_URL}/v1/payments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Erro na API do Mercado Pago:', error);
            throw new Error('Erro ao processar pagamento');
        }

        const paymentResult = await response.json();
        
        return new Response(
            JSON.stringify(paymentResult),
            { 
                status: 200, 
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                } 
            }
        );

    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        return new Response(
            JSON.stringify({ error: 'Erro interno do servidor' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

// Função para processar pagamento PIX
export async function processPixPayment(request) {
    try {
        const { planId, amount, description, email } = await request.json();

        // Validar dados obrigatórios
        if (!planId || !amount || !email) {
            return new Response(
                JSON.stringify({ error: 'Dados obrigatórios não fornecidos' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Configurar dados do pagamento PIX
        const paymentData = {
            transaction_amount: parseFloat(amount),
            description: description,
            payment_method_id: 'pix',
            payer: {
                email: email
            },
            external_reference: `plan_${planId}_${Date.now()}`,
            metadata: {
                plan_id: planId
            },
            notification_url: `${request.headers.get('origin')}/api/webhook`
        };

        // Fazer requisição para API do Mercado Pago
        const response = await fetch(`${MP_BASE_URL}/v1/payments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Erro na API do Mercado Pago:', error);
            throw new Error('Erro ao processar pagamento PIX');
        }

        const paymentResult = await response.json();
        
        return new Response(
            JSON.stringify(paymentResult),
            { 
                status: 200, 
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                } 
            }
        );

    } catch (error) {
        console.error('Erro ao processar pagamento PIX:', error);
        return new Response(
            JSON.stringify({ error: 'Erro interno do servidor' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

// Função para verificar status do pagamento
export async function getPaymentStatus(request, paymentId) {
    try {
        if (!paymentId) {
            return new Response(
                JSON.stringify({ error: 'ID do pagamento não fornecido' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Fazer requisição para API do Mercado Pago
        const response = await fetch(`${MP_BASE_URL}/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Erro na API do Mercado Pago:', error);
            throw new Error('Erro ao verificar status do pagamento');
        }

        const paymentData = await response.json();
        
        return new Response(
            JSON.stringify(paymentData),
            { 
                status: 200, 
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                } 
            }
        );

    } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
        return new Response(
            JSON.stringify({ error: 'Erro interno do servidor' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

// Função para processar webhook do Mercado Pago
export async function processWebhook(request, supabaseClient) {
    try {
        const body = await request.json();
        
        // Verificar se é uma notificação de pagamento
        if (body.type === 'payment') {
            const paymentId = body.data.id;
            
            // Buscar detalhes do pagamento
            const paymentResponse = await fetch(`${MP_BASE_URL}/v1/payments/${paymentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!paymentResponse.ok) {
                throw new Error('Erro ao buscar detalhes do pagamento');
            }

            const paymentData = await paymentResponse.json();
            
            // Processar apenas pagamentos aprovados
            if (paymentData.status === 'approved') {
                const planId = paymentData.metadata?.plan_id;
                const externalReference = paymentData.external_reference;
                
                if (planId && externalReference) {
                    // Extrair informações do plano
                    const planMapping = {
                        'monthly': { name: 'Mensal', months: 1 },
                        'quarterly': { name: 'Trimestral', months: 3 },
                        'yearly': { name: 'Anual', months: 12 }
                    };
                    
                    const plan = planMapping[planId];
                    if (plan) {
                        // Calcular data de expiração
                        const expirationDate = new Date();
                        expirationDate.setMonth(expirationDate.getMonth() + plan.months);
                        
                        // Atualizar assinatura no banco de dados
                        // Nota: Aqui você precisará implementar a lógica específica do seu Supabase
                        // para identificar o usuário baseado no email do pagamento
                        
                        const { error } = await supabaseClient
                            .from('user_subscriptions')
                            .upsert({
                                user_email: paymentData.payer.email,
                                plan_id: planId,
                                plan_name: plan.name,
                                payment_id: paymentId,
                                status: 'active',
                                expires_at: expirationDate.toISOString(),
                                created_at: new Date().toISOString(),
                                external_reference: externalReference
                            });

                        if (error) {
                            console.error('Erro ao atualizar assinatura:', error);
                        } else {
                            console.log('Assinatura atualizada com sucesso:', paymentId);
                        }
                    }
                }
            }
        }
        
        return new Response(
            JSON.stringify({ status: 'ok' }),
            { 
                status: 200, 
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                } 
            }
        );

    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        return new Response(
            JSON.stringify({ error: 'Erro interno do servidor' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

// Função para lidar com CORS
export function handleCors(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            }
        });
    }
    return null;
}



// Função para verificar status da assinatura do usuário
export async function checkSubscriptionStatus(request) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new Response(
                JSON.stringify({ error: "Token de autenticação não fornecido" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const token = authHeader.split(" ")[1];
        
        // Inicializa o cliente Supabase com o token do cabeçalho
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL"),
            Deno.env.get("SUPABASE_ANON_KEY"),
            {
                global: {
                    headers: { Authorization: `Bearer ${token}` },
                },
            }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        console.log("User from token:", user);
        console.log("User error:", userError);
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: "Usuário não autenticado ou token inválido" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const { data, error } = await supabaseClient
            .from("user_subscriptions")
            .select("status, plan_id, expires_at")
            .eq("user_email", user.email)
            .order("expires_at", { ascending: false })
            .limit(1);

        if (error) {
            console.error("Erro ao buscar assinatura do usuário:", error);
            return new Response(
                JSON.stringify({ error: "Erro interno do servidor ao buscar assinatura" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        if (data && data.length > 0) {
            const subscription = data[0];
            // Verificar se a assinatura expirou
            if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
                subscription.status = "expired";
            }
            return new Response(
                JSON.stringify(subscription),
                { 
                    status: 200, 
                    headers: { 
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization"
                    } 
                }
            );
        } else {
            // Usuário não tem assinatura paga, retornar status gratuito
            return new Response(
                JSON.stringify({ status: "free", plan_id: "free", expires_at: null }),
                { 
                    status: 200, 
                    headers: { 
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization"
                    } 
                }
            );
        }

    } catch (error) {
        console.error("Erro na função checkSubscriptionStatus:", error);
        return new Response(
            JSON.stringify({ error: "Erro interno do servidor" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}


