export interface Plan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  features: string[];
  type: 'monthly' | 'quarterly' | 'yearly' | 'free';
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Teste Grátis',
    price: 0,
    priceId: 'price_12345',
    features: [
      'Acesso limitado à calculadora',
      'Suporte básico',
      'Até 5 cálculos por dia',
    ],
    type: 'free',
  },
  {
    id: 'monthly',
    name: 'Mensal',
    price: 29.90,
    priceId: 'price_1234567890abcdef',
    features: [
      'Acesso ilimitado à calculadora',
      'Suporte prioritário',
      'Atualizações mensais',
      'Relatórios de desempenho',
    ],
    type: 'monthly',
  },
  {
    id: 'quarterly',
    name: 'Trimestral',
    price: 79.90,
    priceId: 'price_abcdef1234567890',
    features: [
      'Acesso ilimitado à calculadora',
      'Suporte prioritário',
      'Atualizações trimestrais',
      'Relatórios de desempenho avançados',
      'Acesso a novos recursos em beta',
    ],
    type: 'quarterly',
  },
  {
    id: 'yearly',
    name: 'Anual',
    price: 299.90,
    priceId: 'price_0987654321fedcba',
    features: [
      'Acesso ilimitado à calculadora',
      'Suporte VIP 24/7',
      'Todas as atualizações futuras',
      'Relatórios de desempenho completos',
      'Acesso antecipado a novos recursos',
      'Consultoria anual personalizada',
    ],
    type: 'yearly',
  },
];


