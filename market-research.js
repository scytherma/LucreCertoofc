// market-research.js - Sistema de Pesquisa de Mercado

// Configurações globais
const MARKET_RESEARCH_CONFIG = {
    maxSearchLength: 100,
    minSearchLength: 3,
    searchTimeout: 30000, // 30 segundos
    cacheTimeout: 24 * 60 * 60 * 1000, // 24 horas
};

// Estado global da pesquisa
let currentSearchState = {
    isSearching: false,
    currentQuery: '',
    lastResults: null,
    searchHistory: []
};

// Função para inicializar a pesquisa de mercado
function initMarketResearch() {
    console.log('Inicializando sistema de pesquisa de mercado...');
    
    // Verificar se os elementos existem
    const searchInput = document.getElementById('marketSearchInput');
    const searchButton = document.getElementById('marketSearchButton');
    
    if (!searchInput || !searchButton) {
        console.error('Elementos de pesquisa não encontrados');
        return;
    }

    // Event listeners
    setupMarketResearchEventListeners();
    
    // Carregar histórico de pesquisas
    loadSearchHistory();
    
    // Verificar controle de acesso
    checkMarketResearchAccess();
    
    console.log('Sistema de pesquisa de mercado inicializado com sucesso');
}

// Configurar event listeners
function setupMarketResearchEventListeners() {
    const searchInput = document.getElementById('marketSearchInput');
    const searchButton = document.getElementById('marketSearchButton');
    
    // Event listener para o botão de pesquisa
    searchButton.addEventListener('click', handleMarketSearch);
    
    // Event listener para Enter no campo de pesquisa
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleMarketSearch();
        }
    });
    
    // Event listener para validação em tempo real
    searchInput.addEventListener('input', validateSearchInput);
    
    // Event listener para limpar pesquisa
    const clearButton = document.getElementById('clearSearchButton');
    if (clearButton) {
        clearButton.addEventListener('click', clearSearch);
    }
}

// Validar entrada de pesquisa
function validateSearchInput() {
    const searchInput = document.getElementById('marketSearchInput');
    const searchButton = document.getElementById('marketSearchButton');
    const query = searchInput.value.trim();
    
    // Validar comprimento
    if (query.length < MARKET_RESEARCH_CONFIG.minSearchLength) {
        searchButton.disabled = true;
        searchInput.classList.add('invalid');
        showInputError('Digite pelo menos 3 caracteres');
        return false;
    }
    
    if (query.length > MARKET_RESEARCH_CONFIG.maxSearchLength) {
        searchButton.disabled = true;
        searchInput.classList.add('invalid');
        showInputError('Máximo de 100 caracteres');
        return false;
    }
    
    // Validar caracteres especiais
    const invalidChars = /[<>{}[\]\\]/;
    if (invalidChars.test(query)) {
        searchButton.disabled = true;
        searchInput.classList.add('invalid');
        showInputError('Caracteres especiais não permitidos');
        return false;
    }
    
    // Input válido
    searchButton.disabled = false;
    searchInput.classList.remove('invalid');
    hideInputError();
    return true;
}

// Mostrar erro de input
function showInputError(message) {
    let errorElement = document.getElementById('searchInputError');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'searchInputError';
        errorElement.className = 'search-input-error';
        const searchContainer = document.querySelector('.market-search-container');
        searchContainer.appendChild(errorElement);
    }
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Esconder erro de input
function hideInputError() {
    const errorElement = document.getElementById('searchInputError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Verificar acesso à pesquisa de mercado
function checkMarketResearchAccess() {
    // Verificar se usuário tem assinatura ativa
    if (typeof userSubscriptionStatus !== 'undefined' && 
        userSubscriptionStatus.status !== 'active') {
        
        // Usuário sem assinatura - mostrar preview limitado
        showAccessLimitedMessage();
        return false;
    }
    
    return true;
}

// Mostrar mensagem de acesso limitado
function showAccessLimitedMessage() {
    const searchButton = document.getElementById('marketSearchButton');
    const searchInput = document.getElementById('marketSearchInput');
    
    if (searchButton) {
        searchButton.textContent = 'Upgrade para Pesquisar';
        searchButton.onclick = () => showUpgradeModal('Pesquisa de Mercado');
    }
    
    if (searchInput) {
        searchInput.placeholder = 'Upgrade para usar a pesquisa de mercado...';
        searchInput.disabled = true;
    }
}

// Manipular pesquisa de mercado
async function handleMarketSearch() {
    console.log('Iniciando pesquisa de mercado...');
    
    // Verificar se já está pesquisando
    if (currentSearchState.isSearching) {
        console.log('Pesquisa já em andamento');
        return;
    }
    
    // Verificar acesso
    if (!checkMarketResearchAccess()) {
        console.log('Acesso negado à pesquisa de mercado');
        return;
    }
    
    // Validar input
    if (!validateSearchInput()) {
        console.log('Input inválido');
        return;
    }
    
    const searchInput = document.getElementById('marketSearchInput');
    const query = searchInput.value.trim();
    
    // Verificar cache
    const cachedResult = getCachedResult(query);
    if (cachedResult) {
        console.log('Resultado encontrado no cache');
        displayMarketResearchResults(cachedResult);
        return;
    }
    
    try {
        // Iniciar estado de loading
        setSearchLoadingState(true);
        currentSearchState.isSearching = true;
        currentSearchState.currentQuery = query;
        
        // Fazer a pesquisa
        const results = await performMarketResearch(query);
        
        // Salvar no cache
        setCachedResult(query, results);
        
        // Salvar no histórico
        addToSearchHistory(query);
        
        // Mostrar resultados
        displayMarketResearchResults(results);
        
    } catch (error) {
        console.error('Erro na pesquisa de mercado:', error);
        showSearchError(error.message);
    } finally {
        // Finalizar estado de loading
        setSearchLoadingState(false);
        currentSearchState.isSearching = false;
    }
}

// Definir estado de loading
function setSearchLoadingState(isLoading) {
    const searchButton = document.getElementById('marketSearchButton');
    const searchInput = document.getElementById('marketSearchInput');
    const loadingIndicator = document.getElementById('searchLoadingIndicator');
    
    if (isLoading) {
        searchButton.disabled = true;
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analisando...';
        searchInput.disabled = true;
        
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
    } else {
        searchButton.disabled = false;
        searchButton.innerHTML = '<i class="fas fa-search"></i> Analisar';
        searchInput.disabled = false;
        
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
}

// Realizar pesquisa de mercado
async function performMarketResearch(query) {
    console.log(`Realizando pesquisa para: "${query}"`);
    
    // Obter token de autenticação
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError || !session || !session.access_token) {
        throw new Error('Usuário não autenticado');
    }
    
    const accessToken = session.access_token;
    
    // Fazer requisição para Edge Function
    const response = await fetch(`${SUPABASE_FUNCTIONS_BASE_URL}/market-research`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            query: query,
            timestamp: new Date().toISOString()
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro na pesquisa: ${response.status}`);
    }
    
    const results = await response.json();
    console.log('Resultados da pesquisa:', results);
    
    return results;
}

// Função para exibir os resultados diretamente na página
function displayMarketResearchResults(results) {
    console.log('Exibindo resultados da pesquisa diretamente na página');
    const resultsContainer = document.getElementById('marketResearchResultsContainer');
    if (!resultsContainer) {
        console.error('Elemento marketResearchResultsContainer não encontrado.');
        return;
    }

    if (!results || !results.success) {
        resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro na Análise</h3>
                <p>${results?.error || 'Não foi possível realizar a análise'}</p>
            </div>
        `;
        resultsContainer.style.display = 'block';
        return;
    }

    const data = results.data;
    
    // Atualizar o conteúdo das seções existentes
    updateTrendSection(data.trends);
    updateRegionSection(data.regions);
    updateDemographySection(data.demographics);
    updateCompetitionSection(data.competition);
    updateSuggestedPriceSection(data.price_analysis);
    updateSalesInsightsSection(data.sales_insights);
    updateInsightsRecommendationsSection(data.insights_recommendations);

    // Mostrar o container de resultados
    resultsContainer.style.display = 'block';

    // Salvar resultados atuais
    currentSearchState.lastResults = results;
}

// Atualizar seção de tendência de busca
function updateTrendSection(trendsData) {
    const trendContainer = document.querySelector('.trend-chart-container');
    if (!trendContainer) return;

    trendContainer.innerHTML = `
        <h2><i class="fas fa-chart-line icon"></i> Tendência de Busca</h2>
        <div class="trend-content">
            <p>Interesse ao longo do tempo</p>
            <canvas id="trendChart" width="400" height="200"></canvas>
            <div class="trend-summary">
                <span>Últimos 7 dias: <strong id="trend7Days">+15%</strong></span>
                <span>Últimos 30 dias: <strong id="trend30Days">+8%</strong></span>
            </div>
        </div>
    `;

    // Renderizar gráfico de tendência
    renderTrendChart(trendsData);
}

// Atualizar seção de regiões
function updateRegionSection(regionsData) {
    const regionContainer = document.querySelector('.region-map-container');
    if (!regionContainer) return;

    regionContainer.innerHTML = `
        <h2><i class="fas fa-map-marked-alt icon"></i> Regiões</h2>
        <div class="region-content">
            <div id="brazilMapContainer">
                <svg id="brazilMap" width="300" height="250" viewBox="0 0 300 250">
                    <!-- Mapa do Brasil será renderizado aqui -->
                </svg>
            </div>
        </div>
    `;

    // Renderizar mapa do Brasil
    renderBrazilMap(regionsData);
}

// Atualizar seção de demografia e mercado
function updateDemographySection(demographicsData) {
    const demographyContainer = document.querySelector('.demography-chart-container');
    if (!demographyContainer) return;

    demographyContainer.innerHTML = `
        <h2><i class="fas fa-users icon"></i> Demografia & Mercado</h2>
        <div class="demography-content">
            <p>Renda Média</p>
            <canvas id="incomeChart" width="300" height="150"></canvas>
        </div>
    `;

    // Renderizar gráfico de renda
    renderIncomeChart(demographicsData?.income_distribution);
}

// Atualizar seção de concorrência
function updateCompetitionSection(competitionData) {
    const competitionContainer = document.querySelector('.competition-table-container');
    if (!competitionContainer) return;

    competitionContainer.innerHTML = `
        <h2><i class="fas fa-balance-scale icon"></i> Concorrência</h2>
        <div class="competition-content">
            <p>Preço e Avaliações</p>
            <table class="competition-table">
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Preço</th>
                        <th>Avaliação</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateCompetitionTableRows(competitionData)}
                </tbody>
            </table>
        </div>
    `;
}

// Atualizar seção de preço sugerido
function updateSuggestedPriceSection(priceAnalysis) {
    const priceContainer = document.querySelector('.suggested-price-container');
    if (!priceContainer) return;

    priceContainer.innerHTML = `
        <h2><i class="fas fa-dollar-sign icon"></i> Preço Sugerido</h2>
        <div class="price-content">
            <div class="suggested-price-value">R$ ${priceAnalysis?.suggested_price || '105,00'}</div>
            <div class="profit-margin">Margem de Lucro<br><strong>${priceAnalysis?.profit_margin || '30'}%</strong></div>
        </div>
    `;
}

// Atualizar seção de insights de vendas
function updateSalesInsightsSection(salesInsights) {
    const salesContainer = document.querySelector('.sales-insights-chart-container');
    if (!salesContainer) return;

    salesContainer.innerHTML = `
        <h2><i class="fas fa-chart-bar icon"></i> Insights de Vendas</h2>
        <div class="sales-content">
            <canvas id="salesInsightsChart" width="300" height="150"></canvas>
        </div>
    `;

    // Renderizar gráfico de insights de vendas
    renderSalesInsightsChart(salesInsights);
}

// Atualizar seção de insights e recomendações
function updateInsightsRecommendationsSection(insightsData) {
    const insightsContainer = document.querySelector('.insights-recommendations-section');
    if (!insightsContainer) return;

    insightsContainer.innerHTML = `
        <h2><i class="fas fa-lightbulb icon"></i> Insights e Recomendações</h2>
        <div class="insights-content">
            <ul>
                ${generateInsightsRecommendationsList(insightsData)}
            </ul>
        </div>
    `;
}

// Gerar linhas da tabela de concorrência
function generateCompetitionTableRows(competitionData) {
    if (!competitionData || competitionData.length === 0) {
        return '<tr><td colspan="3">Nenhum dado de concorrência disponível.</td></tr>';
    }
    return competitionData.map(item => `
        <tr>
            <td>${item.product_name || 'N/A'}</td>
            <td>R$ ${item.price || 'N/A'}</td>
            <td>${generateStarRating(item.rating)}</td>
        </tr>
    `).join('');
}

// Gerar estrelas de avaliação
function generateStarRating(rating) {
    if (rating === undefined || rating === null) return 'N/A';
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars += '<i class="fas fa-star filled"></i>';
        } else {
            stars += '<i class="fas fa-star"></i>';
        }
    }
    return stars;
}

// Gerar lista de insights e recomendações
function generateInsightsRecommendationsList(insightsData) {
    if (!insightsData || insightsData.length === 0) {
        return '<li>Nenhum insight ou recomendação disponível.</li>';
    }
    return insightsData.map(insight => `
        <li>
            <strong>${insight.title}:</strong> ${insight.description}
        </li>
    `).join('');
}

// Renderizar Gráfico de Tendência de Busca
function renderTrendChart(trendsData) {
    const canvas = document.getElementById("trendChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Gerar dados de exemplo para os últimos 6 meses se não houver dados reais
    const today = new Date();
    const sampleData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
        const monthYear = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
        return { period: monthYear, value: Math.floor(Math.random() * 60) + 40 }; // Valores aleatórios entre 40 e 100
    });

    const dataToRender = trendsData && trendsData.length > 0 ? trendsData : sampleData;

    // Destruir instância anterior do gráfico se existir
    if (window.trendChartInstance) {
        window.trendChartInstance.destroy();
    }

    const labels = dataToRender.map(t => t.period);
    const values = dataToRender.map(t => t.value);

    window.trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Interesse ao longo do tempo',
                data: values,
                borderColor: '#ff6b35',
                backgroundColor: 'rgba(255, 107, 53, 0.2)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ff6b35',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#ff6b35',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Interesse: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });

    // Atualizar percentuais de aumento/queda nas buscas
    updateTrendSummaries(dataToRender);
}

// Atualizar resumos de tendência
function updateTrendSummaries(trendsData) {
    const trend7Days = document.getElementById('trend7Days');
    const trend30Days = document.getElementById('trend30Days');
    const trend90Days = document.getElementById('trend90Days');

    const getPercentageChange = (data, days) => {
        if (data.length < days) return 'N/A';
        const startValue = data[data.length - days].value;
        const endValue = data[data.length - 1].value;
        if (startValue === 0) return 'N/A';
        const change = ((endValue - startValue) / startValue) * 100;
        return `${change.toFixed(2)}% ${change >= 0 ? '▲' : '▼'}`;
    };

    if (trend7Days) trend7Days.textContent = getPercentageChange(trendsData, 7);
    if (trend30Days) trend30Days.textContent = getPercentageChange(trendsData, 30);
    if (trend90Days) trend90Days.textContent = getPercentageChange(trendsData, 90);
}

// Renderizar Gráfico de Renda Média (Demografia)
function renderIncomeChart(incomeDistribution) {
    const canvas = document.getElementById("incomeChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Dados de exemplo para demonstração se não houver dados reais
    const sampleIncomeData = [
        { range: "Até R$1.500", percentage: 30 },
        { range: "R$1.501-R$3.000", percentage: 40 },
        { range: "R$3.001-R$6.000", percentage: 20 },
        { range: "Acima de R$6.000", percentage: 10 }
    ];

    const dataToRender = incomeDistribution && incomeDistribution.length > 0 ? incomeDistribution : sampleIncomeData;

    if (window.incomeChartInstance) {
        window.incomeChartInstance.destroy();
    }

    const labels = dataToRender.map(d => d.range);
    const data = dataToRender.map(d => d.percentage);

    window.incomeChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Porcentagem da População",
                data: data,
                backgroundColor: "#ff6b35",
                borderColor: "#ff6b35",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Porcentagem da População"
                    },
                    ticks: {
                        callback: function(value) {
                            return value + "%";
                        },
                        color: "#666"
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.05)"
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Faixa de Renda"
                    },
                    ticks: {
                        color: "#666"
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `População: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

// Renderizar Gráfico de Insights de Vendas
function renderSalesInsightsChart(salesInsightsData) {
    const canvas = document.getElementById("salesInsightsChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Dados de exemplo para demonstração se não houver dados reais
    const sampleSalesData = [
        { label: "Estoque", value: 70 },
        { label: "Sazonalidade", value: 50 },
        { label: "Produtos Complementares", value: 90 }
    ];

    const dataToRender = salesInsightsData && salesInsightsData.length > 0 ? salesInsightsData : sampleSalesData;

    if (window.salesInsightsChartInstance) {
        window.salesInsightsChartInstance.destroy();
    }

    const labels = dataToRender.map(s => s.label);
    const data = dataToRender.map(s => s.value);

    window.salesInsightsChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Insights de Vendas",
                data: data,
                backgroundColor: "#ff6b35",
                borderColor: "#ff6b35",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + "%";
                        },
                        color: "#666"
                    },
                    grid: {
                        color: "rgba(0, 0, 0, 0.05)"
                    }
                },
                x: {
                    ticks: {
                        color: "#666"
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

// Renderizar Mapa do Brasil (usando SVG ou biblioteca)
function renderBrazilMap(regionsData) {
    const mapContainer = document.getElementById("brazilMapContainer");
    if (!mapContainer) return;

    // Dados de exemplo para demonstração
    const sampleRegions = [
        { state: "SP", percentage: 35 },
        { state: "RJ", percentage: 20 },
        { state: "MG", percentage: 15 },
        { state: "RS", percentage: 12 },
        { state: "PR", percentage: 10 },
        { state: "BA", percentage: 8 },
        { state: "PE", percentage: 7 },
        { state: "CE", percentage: 6 },
        { state: "AM", percentage: 5 },
        { state: "DF", percentage: 4 }
    ];

    const dataToRender = regionsData && regionsData.length > 0 ? regionsData : sampleRegions;

    // SVG simplificado do mapa do Brasil (apenas para demonstração)
    // Em um cenário real, você usaria um SVG completo ou uma biblioteca de mapas.
    mapContainer.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 500 500">
            <!-- Exemplo de alguns estados com caminhos simplificados -->
            <path d="M200,200 L250,200 L250,250 L200,250 Z" id="state-sp" data-state="São Paulo" data-percentage="${dataToRender.find(r => r.state === 'SP')?.percentage || 0}%" fill="#ff6b35" class="state-path"></path>
            <path d="M250,200 L300,200 L300,250 L250,250 Z" id="state-rj" data-state="Rio de Janeiro" data-percentage="${dataToRender.find(r => r.state === 'RJ')?.percentage || 0}%" fill="#ff8c5a" class="state-path"></path>
            <path d="M150,150 L200,150 L200,200 L150,200 Z" id="state-mg" data-state="Minas Gerais" data-percentage="${dataToRender.find(r => r.state === 'MG')?.percentage || 0}%" fill="#ffad7f" class="state-path"></path>
            <path d="M100,250 L150,250 L150,300 L100,300 Z" id="state-rs" data-state="Rio Grande do Sul" data-percentage="${dataToRender.find(r => r.state === 'RS')?.percentage || 0}%" fill="#ffce9f" class="state-path"></path>
            <path d="M150,250 L200,250 L200,300 L150,300 Z" id="state-pr" data-state="Paraná" data-percentage="${dataToRender.find(r => r.state === 'PR')?.percentage || 0}%" fill="#ffefbf" class="state-path"></path>
            <path d="M300,100 L350,100 L350,150 L300,150 Z" id="state-ba" data-state="Bahia" data-percentage="${dataToRender.find(r => r.state === 'BA')?.percentage || 0}%" fill="#ff6b35" class="state-path"></path>
            <path d="M350,100 L400,100 L400,150 L350,150 Z" id="state-pe" data-state="Pernambuco" data-percentage="${dataToRender.find(r => r.state === 'PE')?.percentage || 0}%" fill="#ff8c5a" class="state-path"></path>
            <path d="M400,100 L450,100 L450,150 L400,150 Z" id="state-ce" data-state="Ceará" data-percentage="${dataToRender.find(r => r.state === 'CE')?.percentage || 0}%" fill="#ffad7f" class="state-path"></path>
            <path d="M100,50 L150,50 L150,100 L100,100 Z" id="state-am" data-state="Amazonas" data-percentage="${dataToRender.find(r => r.state === 'AM')?.percentage || 0}%" fill="#ffce9f" class="state-path"></path>
            <path d="M250,150 L300,150 L300,200 L250,200 Z" id="state-df" data-state="Distrito Federal" data-percentage="${dataToRender.find(r => r.state === 'DF')?.percentage || 0}%" fill="#ffefbf" class="state-path"></path>
            
            <!-- Adicione mais estados conforme necessário -->
        </svg>
        <div id="mapTooltip" class="map-tooltip"></div>
    `;

    const statePaths = mapContainer.querySelectorAll(".state-path");
    const tooltip = document.getElementById("mapTooltip");

    statePaths.forEach(path => {
        path.addEventListener("mouseover", (e) => {
            tooltip.style.display = "block";
            tooltip.textContent = `${path.dataset.state}: ${path.dataset.percentage}`;
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
            path.style.opacity = 0.7; // Efeito de hover
        });

        path.addEventListener("mouseout", () => {
            tooltip.style.display = "none";
            path.style.opacity = 1; // Remover efeito de hover
        });

        path.addEventListener("mousemove", (e) => {
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        });
    });

    // Função para obter a cor com base na porcentagem
    function getColorByPercentage(percentage) {
        const p = parseFloat(percentage);
        if (p > 30) return "#ff6b35"; // Laranja forte
        if (p > 20) return "#ff8c5a";
        if (p > 10) return "#ffad7f";
        return "#ffefbf";
    }

    // Aplicar cores aos estados com base nos dados
    dataToRender.forEach(region => {
        const path = document.getElementById(`state-${region.state.toLowerCase()}`);
        if (path) {
            path.style.fill = getColorByPercentage(region.percentage);
        }
    });
}

// Limpar pesquisa
function clearSearch() {
    const searchInput = document.getElementById('marketSearchInput');
    if (searchInput) {
        searchInput.value = '';
        validateSearchInput();
    }
    
    hideInputError();
    // Esconder resultados ao limpar a pesquisa
    const resultsContainer = document.getElementById('marketResearchResultsContainer');
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
}

// Mostrar erro de pesquisa
function showSearchError(message) {
    const errorContainer = document.getElementById('marketResearchResultsContainer');
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro na Análise</h3>
                <p>${message}</p>
                <p>Tente novamente em alguns instantes ou entre em contato com o suporte se o problema persistir.</p>
            </div>
        `;
        errorContainer.style.display = 'block';
    }
}

// Funções de cache
function getCachedResult(query) {
    try {
        const cacheKey = `market_research_${btoa(query)}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            const data = JSON.parse(cached);
            const now = Date.now();
            
            if (now - data.timestamp < MARKET_RESEARCH_CONFIG.cacheTimeout) {
                return data.results;
            } else {
                localStorage.removeItem(cacheKey);
            }
        }
    } catch (error) {
        console.error('Erro ao acessar cache:', error);
    }
    
    return null;
}

function setCachedResult(query, results) {
    try {
        const cacheKey = `market_research_${btoa(query)}`;
        const data = {
            timestamp: Date.now(),
            results: results
        };
        
        localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
        console.error('Erro ao salvar no cache:', error);
    }
}

// Funções de histórico
function loadSearchHistory() {
    try {
        const history = localStorage.getItem('market_research_history');
        if (history) {
            currentSearchState.searchHistory = JSON.parse(history);
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        currentSearchState.searchHistory = [];
    }
}

function addToSearchHistory(query) {
    try {
        // Remover duplicatas
        currentSearchState.searchHistory = currentSearchState.searchHistory.filter(item => item.query !== query);
        
        // Adicionar no início
        currentSearchState.searchHistory.unshift({
            query: query,
            timestamp: Date.now()
        });
        
        // Manter apenas os últimos 10
        currentSearchState.searchHistory = currentSearchState.searchHistory.slice(0, 10);
        
        // Salvar no localStorage
        localStorage.setItem('market_research_history', JSON.stringify(currentSearchState.searchHistory));
    } catch (error) {
        console.error('Erro ao salvar histórico:', error);
    }
}

// Exportar funções globais
window.initMarketResearch = initMarketResearch;



// Renderizar Gráfico de Tendência de Busca
function renderTrendChart(trendsData) {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Dados de exemplo para demonstração
    const sampleData = [
        { period: 'Set 2023', value: 45 },
        { period: 'Jan 2024', value: 55 },
        { period: 'Mar 2024', value: 75 },
        { period: 'Mai 2024', value: 85 }
    ];
    
    const data = trendsData || sampleData;
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configurações do gráfico
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Encontrar valores min e max
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    
    // Desenhar eixos
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Eixo Y
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.stroke();
    
    // Eixo X
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();
    
    // Desenhar linha de tendência
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Desenhar pontos
    ctx.fillStyle = '#ff6b35';
    data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Adicionar labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    data.forEach((point, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        ctx.fillText(point.period, x, padding + chartHeight + 20);
    });
}

// Renderizar Mapa do Brasil
function renderBrazilMap(regionsData) {
    const mapContainer = document.getElementById('brazilMapContainer');
    if (!mapContainer) return;
    
    // Dados de exemplo para demonstração
    const sampleRegions = [
        { state: 'SP', percentage: 35 },
        { state: 'RJ', percentage: 20 },
        { state: 'MG', percentage: 15 },
        { state: 'RS', percentage: 12 },
        { state: 'PR', percentage: 10 }
    ];
    
    const regions = regionsData || sampleRegions;
    
    // Criar SVG simplificado do Brasil
    mapContainer.innerHTML = `
        <svg width="300" height="250" viewBox="0 0 300 250">
            <!-- Estados do Brasil simplificados -->
            <g id="brazilStates">
                <!-- São Paulo -->
                <path d="M120 180 L160 180 L160 200 L120 200 Z" 
                      fill="#ff6b35" opacity="0.8" 
                      data-state="SP" data-percentage="35%"
                      class="state-path">
                </path>
                
                <!-- Rio de Janeiro -->
                <path d="M160 180 L180 180 L180 195 L160 195 Z" 
                      fill="#ff8c5a" opacity="0.7" 
                      data-state="RJ" data-percentage="20%"
                      class="state-path">
                </path>
                
                <!-- Minas Gerais -->
                <path d="M120 160 L160 160 L160 180 L120 180 Z" 
                      fill="#ffad7f" opacity="0.6" 
                      data-state="MG" data-percentage="15%"
                      class="state-path">
                </path>
                
                <!-- Rio Grande do Sul -->
                <path d="M100 200 L140 200 L140 230 L100 230 Z" 
                      fill="#ffce9f" opacity="0.5" 
                      data-state="RS" data-percentage="12%"
                      class="state-path">
                </path>
                
                <!-- Paraná -->
                <path d="M100 180 L120 180 L120 200 L100 200 Z" 
                      fill="#ffefbf" opacity="0.4" 
                      data-state="PR" data-percentage="10%"
                      class="state-path">
                </path>
            </g>
        </svg>
        <div class="map-legend">
            <div class="legend-item">
                <span class="legend-color" style="background: #ff6b35;"></span>
                <span>SP: 35%</span>
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background: #ff8c5a;"></span>
                <span>RJ: 20%</span>
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background: #ffad7f;"></span>
                <span>MG: 15%</span>
            </div>
        </div>
    `;
    
    // Adicionar interatividade ao mapa
    const statePaths = mapContainer.querySelectorAll('.state-path');
    statePaths.forEach(path => {
        path.addEventListener('mouseenter', function() {
            const state = this.getAttribute('data-state');
            const percentage = this.getAttribute('data-percentage');
            
            // Criar tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'map-tooltip';
            tooltip.innerHTML = `${state}: ${percentage}`;
            tooltip.style.position = 'absolute';
            tooltip.style.background = '#333';
            tooltip.style.color = 'white';
            tooltip.style.padding = '5px 10px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '12px';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '1000';
            
            document.body.appendChild(tooltip);
            
            // Posicionar tooltip
            const rect = this.getBoundingClientRect();
            tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
        });
        
        path.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.map-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Renderizar Gráfico de Renda
function renderIncomeChart(incomeData) {
    const canvas = document.getElementById('incomeChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Dados de exemplo
    const sampleData = [
        { range: 'R$ 5.000', value: 300 },
        { range: 'R$ 1.000', value: 600 },
        { range: 'R$ 3.000', value: 800 },
        { range: 'R$ 3.000', value: 1200 },
        { range: 'R$ 3.000', value: 1500 }
    ];
    
    const data = incomeData || sampleData;
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configurações do gráfico
    const padding = 30;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = chartWidth / data.length - 10;
    
    // Encontrar valor máximo
    const maxValue = Math.max(...data.map(d => d.value));
    
    // Desenhar barras
    ctx.fillStyle = '#ff6b35';
    data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * chartHeight;
        const x = padding + index * (barWidth + 10);
        const y = padding + chartHeight - barHeight;
        
        ctx.fillRect(x, y, barWidth, barHeight);
    });
}

// Renderizar Gráfico de Insights de Vendas
function renderSalesInsightsChart(salesData) {
    const canvas = document.getElementById('salesInsightsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Dados de exemplo
    const sampleData = [
        { category: 'Estoque', value: 60 },
        { category: 'Sazonalidade', value: 40 },
        { category: 'Produtos', value: 80 },
        { category: 'Complementares', value: 95 }
    ];
    
    const data = salesData || sampleData;
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configurações do gráfico
    const padding = 30;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    const barWidth = chartWidth / data.length - 10;
    
    // Encontrar valor máximo
    const maxValue = Math.max(...data.map(d => d.value));
    
    // Desenhar barras
    data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * chartHeight;
        const x = padding + index * (barWidth + 10);
        const y = padding + chartHeight - barHeight;
        
        // Cor da barra baseada no valor
        if (item.value >= 80) {
            ctx.fillStyle = '#ff6b35';
        } else if (item.value >= 60) {
            ctx.fillStyle = '#ff8c5a';
        } else {
            ctx.fillStyle = '#ffad7f';
        }
        
        ctx.fillRect(x, y, barWidth, barHeight);
    });
}



// Funções para o Mapa SVG do Brasil

// Dados mock para demonstração
const mockData = {
    "AC": { name: "Acre", percentage: 15, searches: 1250, trend: 5, competition: "Baixa", price: "R$ 45,00", insights: "Mercado em crescimento com baixa concorrência. Oportunidade para entrada com preços competitivos.", demographics: "População jovem, renda média-baixa, preferência por produtos básicos." },
    "AL": { name: "Alagoas", percentage: 45, searches: 3200, trend: 12, competition: "Média", price: "R$ 52,00", insights: "Interesse moderado com tendência de crescimento. Concorrência equilibrada.", demographics: "Mercado diversificado, crescimento do poder de compra." },
    "AP": { name: "Amapá", percentage: 22, searches: 890, trend: -3, competition: "Baixa", price: "R$ 48,00", insights: "Mercado pequeno mas estável. Logística pode ser um desafio.", demographics: "População concentrada na capital, renda média." },
    "AM": { name: "Amazonas", percentage: 18, searches: 4500, trend: 8, competition: "Baixa", price: "R$ 50,00", insights: "Grande potencial devido ao tamanho da população. Desafios logísticos.", demographics: "Mercado concentrado em Manaus, crescimento do e-commerce." },
    "BA": { name: "Bahia", percentage: 52, searches: 8900, trend: 15, competition: "Média", price: "R$ 48,00", insights: "Mercado promissor com boa aceitação. Diversidade regional importante.", demographics: "Mercado heterogêneo, interior em crescimento." },
    "CE": { name: "Ceará", percentage: 38, searches: 5600, trend: 7, competition: "Média", price: "R$ 46,00", insights: "Mercado estável com potencial de crescimento. Forte cultura local.", demographics: "Economia diversificada, crescimento do turismo." },
    "DF": { name: "Distrito Federal", percentage: 75, searches: 2100, trend: 20, competition: "Alta", price: "R$ 65,00", insights: "Alto poder aquisitivo, mercado exigente. Preços premium aceitos.", demographics: "Renda alta, população educada, consumo sofisticado." },
    "ES": { name: "Espírito Santo", percentage: 68, searches: 3400, trend: 18, competition: "Média", price: "R$ 58,00", insights: "Mercado próspero com boa margem. Proximidade com grandes centros.", demographics: "Economia forte, setor industrial desenvolvido." },
    "GO": { name: "Goiás", percentage: 48, searches: 6700, trend: 10, competition: "Média", price: "R$ 50,00", insights: "Crescimento constante, mercado do agronegócio influente.", demographics: "Economia baseada no agronegócio, cidades em expansão." },
    "MA": { name: "Maranhão", percentage: 28, searches: 4200, trend: 4, competition: "Baixa", price: "R$ 42,00", insights: "Mercado emergente com potencial. Preços acessíveis necessários.", demographics: "Economia em transição, crescimento urbano." },
    "MT": { name: "Mato Grosso", percentage: 35, searches: 5100, trend: 6, competition: "Baixa", price: "R$ 47,00", insights: "Mercado do agronegócio próspero. Sazonalidade importante.", demographics: "Renda concentrada no agronegócio, cidades médias." },
    "MS": { name: "Mato Grosso do Sul", percentage: 42, searches: 3800, trend: 9, competition: "Baixa", price: "R$ 49,00", insights: "Crescimento estável, influência do agronegócio.", demographics: "Economia diversificada, turismo rural." },
    "MG": { name: "Minas Gerais", percentage: 65, searches: 12500, trend: 22, competition: "Alta", price: "R$ 55,00", insights: "Mercado muito promissor, alta demanda. Concorrência intensa.", demographics: "Economia diversificada, forte tradição comercial." },
    "PA": { name: "Pará", percentage: 25, searches: 6800, trend: 2, competition: "Baixa", price: "R$ 44,00", insights: "Mercado grande mas desafiador. Logística complexa.", demographics: "População dispersa, economia baseada em recursos naturais." },
    "PB": { name: "Paraíba", percentage: 41, searches: 2900, trend: 11, competition: "Baixa", price: "R$ 45,00", insights: "Mercado em crescimento, baixa concorrência.", demographics: "Economia em desenvolvimento, setor têxtil forte." },
    "PR": { name: "Paraná", percentage: 72, searches: 9200, trend: 25, competition: "Alta", price: "R$ 60,00", insights: "Excelente mercado, alta demanda e poder de compra.", demographics: "Economia forte, setor industrial desenvolvido." },
    "PE": { name: "Pernambuco", percentage: 46, searches: 7100, trend: 13, competition: "Média", price: "R$ 48,00", insights: "Mercado equilibrado com bom potencial de crescimento.", demographics: "Economia diversificada, polo tecnológico." },
    "PI": { name: "Piauí", percentage: 31, searches: 2600, trend: 1, competition: "Baixa", price: "R$ 40,00", insights: "Mercado emergente, preços baixos necessários.", demographics: "Economia agrícola, renda baixa." },
    "RJ": { name: "Rio de Janeiro", percentage: 78, searches: 11800, trend: 28, competition: "Muito Alta", price: "R$ 70,00", insights: "Mercado premium, alta demanda. Concorrência muito intensa.", demographics: "Alto poder aquisitivo, mercado sofisticado." },
    "RN": { name: "Rio Grande do Norte", percentage: 39, searches: 2400, trend: 8, competition: "Baixa", price: "R$ 46,00", insights: "Mercado estável com potencial turístico.", demographics: "Economia baseada em turismo e petróleo." },
    "RS": { name: "Rio Grande do Sul", percentage: 69, searches: 8700, trend: 19, competition: "Alta", price: "R$ 58,00", insights: "Mercado muito bom, cultura de consumo forte.", demographics: "Economia diversificada, tradição comercial." },
    "RO": { name: "Rondônia", percentage: 19, searches: 1800, trend: 3, competition: "Baixa", price: "R$ 43,00", insights: "Mercado pequeno mas em crescimento.", demographics: "Economia agrícola, migração interna." },
    "RR": { name: "Roraima", percentage: 16, searches: 650, trend: -1, competition: "Muito Baixa", price: "R$ 45,00", insights: "Mercado muito pequeno, desafios logísticos.", demographics: "População pequena, economia limitada." },
    "SC": { name: "Santa Catarina", percentage: 74, searches: 5900, trend: 24, competition: "Alta", price: "R$ 62,00", insights: "Excelente mercado, alto padrão de vida.", demographics: "Economia forte, alta qualidade de vida." },
    "SP": { name: "São Paulo", percentage: 82, searches: 25600, trend: 35, competition: "Muito Alta", price: "R$ 75,00", insights: "Melhor mercado do país, altíssima demanda. Concorrência feroz.", demographics: "Maior mercado consumidor, alta renda." },
    "SE": { name: "Sergipe", percentage: 44, searches: 1900, trend: 14, competition: "Baixa", price: "R$ 47,00", insights: "Mercado pequeno mas promissor.", demographics: "Economia em crescimento, setor de serviços." },
    "TO": { name: "Tocantins", percentage: 33, searches: 2100, trend: 5, competition: "Baixa", price: "R$ 44,00", insights: "Mercado emergente com potencial.", demographics: "Economia agrícola, cidades em desenvolvimento." }
};

let currentSelectedState = null;
let tooltip = null;
let detailsPanel = null;
let mapContainer = null;

function getColorClass(percentage) {
    if (percentage < 10) return 'pessimo';
    if (percentage < 25) return 'ruim';
    if (percentage < 45) return 'fraco';
    if (percentage < 60) return 'mediano';
    if (percentage < 80) return 'bom';
    return 'excelente';
}

function formatNumber(num) {
    return num.toLocaleString('pt-BR');
}

function generateSparkline(canvas, trend) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const points = [];
    const baseValue = 50;
    let currentValue = baseValue;
    
    for (let i = 0; i < 10; i++) {
        const variation = (Math.random() - 0.5) * 10 + (trend * 0.5);
        currentValue = Math.max(0, Math.min(100, currentValue + variation));
        points.push(currentValue);
    }
    
    ctx.strokeStyle = trend >= 0 ? '#28a745' : '#dc3545';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    points.forEach((point, index) => {
        const x = (index / (points.length - 1)) * width;
        const y = height - (point / 100) * height;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
}

function showTooltip(event, stateData) {
    if (!tooltip) return;
    
    const state = stateData.dataset.state;
    const data = mockData[state];
    
    tooltip.innerHTML = `
        <div class="tooltip-header">
            <h3>${data.name}</h3>
            <span>${data.percentage}%</span>
        </div>
        <div class="tooltip-content">
            <p><strong>Buscas:</strong> ${formatNumber(data.searches)}</p>
            <p><strong>Tendência:</strong> <span style="color: ${data.trend >= 0 ? '#28a745' : '#dc3545'}">${data.trend >= 0 ? '+' : ''}${data.trend}%</span></p>
            <div class="sparkline-container">
                <canvas id="sparkline-tooltip" width="80" height="20"></canvas>
            </div>
        </div>
    `;
    
    const sparklineCanvas = document.getElementById('sparkline-tooltip');
    generateSparkline(sparklineCanvas, data.trend);
    
    const rect = mapContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y - 10}px`;
    
    const tooltipRect = tooltip.getBoundingClientRect();
    const containerRect = mapContainer.getBoundingClientRect();
    
    if (tooltipRect.right > containerRect.right) {
        tooltip.style.left = `${x - tooltipRect.width - 10}px`;
    }
    
    if (tooltipRect.top < containerRect.top) {
        tooltip.style.top = `${y + 20}px`;
    }
    
    tooltip.classList.add('visible');
}

function hideTooltip() {
    if (tooltip) {
        tooltip.classList.remove('visible');
    }
}

function showDetailsPanel(state) {
    const data = mockData[state];
    
    detailsPanel.innerHTML = `
        <div class="panel-header">
            <h2>${data.name}</h2>
            <button id="close-panel" class="close-btn">&times;</button>
        </div>
        <div class="panel-content">
            <div class="metrics-grid">
                <div class="metric-card">
                    <h3>Interesse</h3>
                    <div class="metric-value">${data.percentage}%</div>
                    <div class="metric-trend ${data.trend >= 0 ? 'positive' : 'negative'}">${data.trend >= 0 ? '+' : ''}${data.trend}%</div>
                </div>
                <div class="metric-card">
                    <h3>Buscas Totais</h3>
                    <div class="metric-value">${formatNumber(data.searches)}</div>
                    <div class="metric-subtitle">últimos 30 dias</div>
                </div>
                <div class="metric-card">
                    <h3>Concorrência</h3>
                    <div class="metric-value">${data.competition}</div>
                    <div class="metric-subtitle">nível médio</div>
                </div>
                <div class="metric-card">
                    <h3>Preço Sugerido</h3>
                    <div class="metric-value">${data.price}</div>
                    <div class="metric-subtitle">baseado no mercado</div>
                </div>
            </div>
            <div class="insights-section">
                <h3>Insights e Recomendações</h3>
                <div class="insights-content"><p>${data.insights}</p></div>
            </div>
            <div class="demographics-section">
                <h3>Demografia</h3>
                <div class="demographics-content"><p>${data.demographics}</p></div>
            </div>
        </div>
    `;
    
    document.getElementById('close-panel').addEventListener('click', () => {
        if (currentSelectedState) {
            currentSelectedState.classList.remove('selected');
            currentSelectedState = null;
        }
        if (window.innerWidth <= 1024) {
            detailsPanel.style.display = 'none';
        }
    });
    
    detailsPanel.style.display = 'block';
}

function applyStateColors() {
    Object.keys(mockData).forEach(stateCode => {
        const stateElement = document.getElementById(stateCode);
        if (stateElement) {
            const colorClass = getColorClass(mockData[stateCode].percentage);
            stateElement.className.baseVal = `state ${colorClass}`;
        }
    });
}

async function loadSVGMap() {
    try {
        const response = await fetch('brasil-map.svg');
        const svgText = await response.text();
        
        const mapContainer = document.getElementById('brasil-map-container');
        mapContainer.innerHTML = svgText;
        
        applyStateColors();
        
        const states = document.querySelectorAll('.state');
        states.forEach(state => {
            state.addEventListener('mouseenter', (e) => {
                showTooltip(e, state);
            });
            
            state.addEventListener('mousemove', (e) => {
                showTooltip(e, state);
            });
            
            state.addEventListener('mouseleave', hideTooltip);
            
            state.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (currentSelectedState) {
                    currentSelectedState.classList.remove('selected');
                }
                
                state.classList.add('selected');
                currentSelectedState = state;
                
                showDetailsPanel(state.dataset.state);
                
                hideTooltip();
            });
            
            state.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    state.click();
                }
            });
            
            state.setAttribute('tabindex', '0');
        });
        
    } catch (error) {
        console.error('Erro ao carregar SVG:', error);
        document.getElementById('brasil-map-container').innerHTML = '<div class="loading">Erro ao carregar o mapa</div>';
    }
}

function initMap() {
    tooltip = document.getElementById('tooltip');
    detailsPanel = document.getElementById('details-panel');
    mapContainer = document.querySelector('.region-map-container');
    
    loadSVGMap();
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 && 
            !mapContainer.contains(e.target) && 
            !detailsPanel.contains(e.target)) {
            hideTooltip();
        }
    });
    
    window.addEventListener('resize', () => {
        hideTooltip();
        
        if (window.innerWidth > 1024) {
            detailsPanel.style.display = 'block';
        } else if (!currentSelectedState) {
            detailsPanel.style.display = 'none';
        }
    });
}

// Sobrescrever a função initMarketResearch para incluir a inicialização do mapa
const originalInitMarketResearch = window.initMarketResearch;
window.initMarketResearch = function() {
    if (originalInitMarketResearch) {
        originalInitMarketResearch();
    }
    initMap();
};

