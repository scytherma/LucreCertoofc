export interface Plan {
  id: string
  name: string
  price: number
  period: string
  priceId: string
  description: string
  features: string[]
  savings?: string
  badge?: string
}

export const PLANS: Record<string, Plan> = {
  trial: {
    id: 'trial',
    name: 'Teste Grátis',
    price: 0,
    period: '3 dias',
    priceId: 'price_1RxIhmRzgVcmLmJHdLVgSww7',
    description: 'Acesso completo por 3 dias',
    features: [
      'Acesso completo por 3 dias',
      'Todas as calculadoras',
      'Suporte básico',
      'Sem compromisso'
    ]
  },
  monthly: {
    id: 'monthly',
    name: 'Plano Mensal',
    price: 29.90,
    period: 'mês',
    priceId: 'price_1RxEH3RzgVcmLmJHGGMdsJuj',
    description: 'Cobrança mensal',
    features: [
      'Acesso ilimitado às calculadoras',
      'Suporte prioritário',
      'Relatórios avançados',
      'Cancelamento fácil e sem burocracia'
    ]
  },
  quarterly: {
    id: 'quarterly',
    name: 'Plano Trimestral',
    price: 72.00,
    period: 'trimestre',
    priceId: 'price_1RxEJyRzgVcmLmJH5W2B9hJC',
    description: 'Cobrança trimestral',
    savings: 'Economia de 13%',
    features: [
      'Todos os benefícios do mensal',
      'Economia de 13%',
      'Prioridade máxima no suporte',
      'Acesso antecipado a novos recursos'
    ]
  },
  annual: {
    id: 'annual',
    name: 'Plano Anual',
    price: 229.00,
    period: 'ano',
    priceId: 'price_1RxER7RzgVcmLmJH26Ntu89K',
    description: 'Cobrança anual',
    savings: 'Economia de 33%',
    badge: '⭐ Mais Vantajoso',
    features: [
      'Todos os benefícios do mensal',
      'Economia de 33%',
      'Prioridade máxima no suporte',
      'Garantia estendida de 30 dias',
      'Acesso exclusivo a novos módulos'
    ]
  }
}

export function getPlan(planId: string): Plan | undefined {
  return PLANS[planId]
}

export function getAllPlans(): Plan[] {
  return Object.values(PLANS)
}

