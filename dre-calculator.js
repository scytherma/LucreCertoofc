// dre-calculator.js - Lógica da Calculadora de DRE

// Função para formatar valores monetários
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função para formatar percentual
function formatPercentage(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
}

// Função para converter string monetária em número
function parseCurrency(value) {
    if (typeof value !== 'string' || !value) return 0;
    // Remove pontos (separadores de milhares) e substitui vírgula por ponto (decimal)
    const cleanValue = value.replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanValue) || 0;
}

// Função para aplicar máscara monetária
function applyCurrencyMask(input) {
    let value = input.value.replace(/\D/g, '');
    value = (value / 100).toFixed(2) + '';
    value = value.replace(".", ",");
    value = value.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    value = value.replace(/(\d)(\d{3}),/g, "$1.$2,");
    input.value = value;
}

// Classe principal da calculadora DRE
class DRECalculator {
    constructor() {
        this.data = {
            receitaBruta: 0,
            impostosSobreVendas: 0,
            devolucoes: 0,
            cmv: 0,
            despesasAdministrativas: 0,
            despesasVendas: 0,
            despesasFinanceiras: 0,
            irpjCsll: 0
        };
        
        this.results = {
            receitaLiquida: 0,
            lucroBruto: 0,
            despesasOperacionais: 0,
            resultadoOperacional: 0,
            resultadoLiquido: 0,
            margemBruta: 0,
            margemOperacional: 0,
            margemLiquida: 0
        };
    }

    // Inicializar event listeners
    init() {
        this.setupEventListeners();
        this.setupMasks();
    }

    // Configurar máscaras monetárias
    setupMasks() {
        const inputs = document.querySelectorAll('.dre-input');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                applyCurrencyMask(e.target);
                this.updateData();
                this.calculate();
                this.updateDisplay();
            });
        });
    }

    // Configurar event listeners
    setupEventListeners() {
        const calcularBtn = document.getElementById('calcularDre');
        const limparBtn = document.getElementById('limparDre');

        if (calcularBtn) {
            calcularBtn.addEventListener('click', () => {
                this.updateData();
                this.calculate();
                this.updateDisplay();
                this.updateCharts();
            });
        }

        if (limparBtn) {
            limparBtn.addEventListener('click', () => {
                this.clearAll();
            });
        }
    }

    // Atualizar dados a partir dos inputs
    updateData() {
        this.data.receitaBruta = parseCurrency(document.getElementById('receitaBruta')?.value || 0);
        this.data.impostosSobreVendas = parseCurrency(document.getElementById('impostosSobreVendas')?.value || 0);
        this.data.devolucoes = parseCurrency(document.getElementById('devolucoes')?.value || 0);
        this.data.cmv = parseCurrency(document.getElementById('cmv')?.value || 0);
        this.data.despesasAdministrativas = parseCurrency(document.getElementById('despesasAdministrativas')?.value || 0);
        this.data.despesasVendas = parseCurrency(document.getElementById('despesasVendas')?.value || 0);
        this.data.despesasFinanceiras = parseCurrency(document.getElementById('despesasFinanceiras')?.value || 0);
        this.data.irpjCsll = parseCurrency(document.getElementById('irpjCsll')?.value || 0);
    }

    // Realizar cálculos da DRE
    calculate() {
        // Receita Líquida = Receita Bruta - Deduções
        this.results.receitaLiquida = this.data.receitaBruta - this.data.impostosSobreVendas - this.data.devolucoes;

        // Lucro Bruto = Receita Líquida - CMV
        this.results.lucroBruto = this.results.receitaLiquida - this.data.cmv;

        // Total de Despesas Operacionais
        this.results.despesasOperacionais = this.data.despesasAdministrativas + this.data.despesasVendas + this.data.despesasFinanceiras;

        // Resultado Operacional = Lucro Bruto - Despesas Operacionais
        this.results.resultadoOperacional = this.results.lucroBruto - this.results.despesasOperacionais;

        // Resultado Líquido = Resultado Operacional - IRPJ e CSLL
        this.results.resultadoLiquido = this.results.resultadoOperacional - this.data.irpjCsll;

        // Cálculo das margens
        if (this.data.receitaBruta > 0) {
            this.results.margemBruta = (this.results.lucroBruto / this.data.receitaBruta) * 100;
            this.results.margemOperacional = (this.results.resultadoOperacional / this.data.receitaBruta) * 100;
            this.results.margemLiquida = (this.results.resultadoLiquido / this.data.receitaBruta) * 100;
        } else {
            this.results.margemBruta = 0;
            this.results.margemOperacional = 0;
            this.results.margemLiquida = 0;
        }
    }

    // Atualizar display dos resultados
    updateDisplay() {
        // Atualizar valores da tabela DRE
        const elements = {
            'resultReceitaBruta': this.data.receitaBruta,
            'resultDeducoes': this.data.impostosSobreVendas + this.data.devolucoes,
            'resultReceitaLiquida': this.results.receitaLiquida,
            'resultCmv': this.data.cmv,
            'resultLucroBruto': this.results.lucroBruto,
            'resultDespesasOperacionais': this.results.despesasOperacionais,
            'resultOperacional': this.results.resultadoOperacional,
            'resultIrpjCsll': this.data.irpjCsll,
            'resultLiquido': this.results.resultadoLiquido
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = formatCurrency(value);
                
                // Aplicar cores baseadas no valor
                if (value < 0) {
                    element.style.color = '#dc3545'; // Vermelho para valores negativos
                } else if (value > 0) {
                    element.style.color = '#28a745'; // Verde para valores positivos
                } else {
                    element.style.color = '#6c757d'; // Cinza para zero
                }
            }
        });

        // Atualizar indicadores
        const indicators = {
            'margemBruta': this.results.margemBruta,
            'margemOperacional': this.results.margemOperacional,
            'margemLiquida': this.results.margemLiquida
        };

        Object.entries(indicators).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = formatPercentage(value);
            }
        });
    }

    // Limpar todos os campos
    clearAll() {
        // Limpar inputs
        const inputs = document.querySelectorAll('.dre-input');
        inputs.forEach(input => {
            input.value = '';
        });

        // Resetar dados
        Object.keys(this.data).forEach(key => {
            this.data[key] = 0;
        });

        Object.keys(this.results).forEach(key => {
            this.results[key] = 0;
        });

        // Atualizar display
        this.updateDisplay();
        this.clearCharts();
    }

    // Obter dados para gráficos
    getChartData() {
        return {
            despesas: {
                labels: ['Despesas Administrativas', 'Despesas com Vendas', 'Despesas Financeiras'],
                data: [
                    this.data.despesasAdministrativas,
                    this.data.despesasVendas,
                    this.data.despesasFinanceiras
                ],
                colors: ['#ff6b35', '#f7931e', '#ffa726'] // Paleta do sistema
            },
            estrutura: {
                labels: ['Receita Líquida', 'CMV', 'Despesas Operacionais', 'IRPJ/CSLL', 'Resultado Líquido'],
                data: [
                    this.results.receitaLiquida,
                    this.data.cmv,
                    this.results.despesasOperacionais,
                    this.data.irpjCsll,
                    this.results.resultadoLiquido
                ],
                colors: ['#28a745', '#dc3545', '#ff6b35', '#6c757d', '#17a2b8'] // Verde, vermelho, laranja do sistema, cinza, azul
            }
        };
    }

    // Atualizar gráficos (será implementado na próxima fase)
    updateCharts() {
        this.createDespesasChart();
        this.createEstruturaChart();
    }

    // Limpar gráficos
    clearCharts() {
        // Destruir gráficos existentes se existirem
        if (this.despesasChart) {
            this.despesasChart.destroy();
            this.despesasChart = null;
        }
        if (this.estruturaChart) {
            this.estruturaChart.destroy();
            this.estruturaChart = null;
        }
    }

    // Criar gráfico de pizza das despesas
    createDespesasChart() {
        const ctx = document.getElementById('despesasChart');
        if (!ctx) return;

        // Destruir gráfico anterior se existir
        if (this.despesasChart) {
            this.despesasChart.destroy();
        }

        const chartData = this.getChartData().despesas;
        
        // Filtrar apenas despesas com valores maiores que zero
        const filteredData = [];
        const filteredLabels = [];
        const filteredColors = [];
        
        chartData.data.forEach((value, index) => {
            if (value > 0) {
                filteredData.push(value);
                filteredLabels.push(chartData.labels[index]);
                filteredColors.push(chartData.colors[index]);
            }
        });

        // Se não há dados, mostrar mensagem
        if (filteredData.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            const context = ctx.getContext('2d');
            context.font = '14px Arial';
            context.fillStyle = '#666';
            context.textAlign = 'center';
            context.fillText('Nenhuma despesa informada', ctx.width / 2, ctx.height / 2);
            return;
        }

        this.despesasChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: filteredLabels,
                datasets: [{
                    data: filteredData,
                    backgroundColor: filteredColors,
                    borderColor: '#fff',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '50%'
            }
        });
    }

    // Criar gráfico de barras da estrutura DRE
    createEstruturaChart() {
        const ctx = document.getElementById('estruturaChart');
        if (!ctx) return;

        // Destruir gráfico anterior se existir
        if (this.estruturaChart) {
            this.estruturaChart.destroy();
        }

        const chartData = this.getChartData().estrutura;

        this.estruturaChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Valores (R$)',
                    data: chartData.data,
                    backgroundColor: chartData.colors.map(color => color + '80'), // Adiciona transparência
                    borderColor: chartData.colors,
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        },
                        grid: {
                            color: '#e0e0e0'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
}

// Instância global da calculadora
let dreCalculator;

// Função para inicializar a calculadora DRE
function initDRECalculator() {
    dreCalculator = new DRECalculator();
    dreCalculator.init();
}

// Função para ser chamada quando a página DRE for carregada
function setupDREPage() {
    // Aguardar um pequeno delay para garantir que o DOM foi renderizado
    setTimeout(() => {
        initDRECalculator();
    }, 100);
}

