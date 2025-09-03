// market-research-enhanced.js - Sistema de Pesquisa de Mercado Aprimorado

// Configurações globais
const MARKET_RESEARCH_CONFIG = {
    maxSearchLength: 100,
    minSearchLength: 3,
    searchTimeout: 60000, // 60 segundos para análises mais complexas
    cacheTimeout: 24 * 60 * 60 * 1000, // 24 horas
    maxRetries: 3,
    retryDelay: 2000
};

// Estado global da pesquisa
let currentSearchState = {
    isSearching: false,
    currentQuery: '',
    lastResults: null,
    searchHistory: [],
    currentAnalysisId: null
};

// Variável global para o URL da Edge Function, para evitar redeclaração
// Certifique-se de que esta variável seja definida apenas UMA VEZ em seu projeto, 
// idealmente em um arquivo de configuração global ou injetada pelo ambiente.
// Se 'SUPABASE_FUNCTIONS_BASE_URL' já estiver definida em 'plans.js' ou 'auth-supabase.js', remova a declaração de lá.
// Por exemplo, se 'SUPABASE_FUNCTIONS_BASE_URL' já existe, apenas use-a.
// Caso contrário, defina-a aqui ou em um arquivo de configuração global.
// Exemplo de definição (se não estiver definida em outro lugar):
// const SUPABASE_FUNCTIONS_BASE_URL = 'https://<your-project-ref>.supabase.co/functions/v1';

// Funções auxiliares que estavam faltando ou mal declaradas
function closeMarketResearchModal() {
    const modal = document.getElementById('marketResearchModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300); // Tempo para a transição CSS
    }
}

function clearSearch() {
    const searchInput = document.getElementById('marketSearchInput');
    if (searchInput) {
        searchInput.value = '';
        validateSearchInput(); // Revalidar para desabilitar o botão se necessário
        const clearButton = document.getElementById('clearSearchButton');
        if (clearButton) clearButton.style.display = 'none';
    }
}

function showInputError(message) {
    const errorElement = document.getElementById('searchInputError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideInputError() {
    const errorElement = document.getElementById('searchInputError');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function showSearchError(message) {
    const resultsContainer = document.getElementById('marketResearchResults');
    if (resultsContainer) {
        resultsContainer.innerHTML = `<div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Erro na Pesquisa</h3>
            <p>${message}</p>
        </div>`;
    }
}

function ensureAdvancedModalStyles() {
    // Esta função pode ser vazia se os estilos já estiverem carregados via CSS
    // Ou pode adicionar dinamicamente estilos se necessário
}

function exportAdvancedResults() {
    alert('Funcionalidade de exportar relatório em desenvolvimento!');
}

function shareAnalysis() {
    alert('Funcionalidade de compartilhar análise em desenvolvimento!');
}

function initInteractiveComponents(results) {
    // Adicionar event listeners para as abas
    const tabButtons = document.querySelectorAll('.analysis-tabs .tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            // Remover active de todos os botões e painéis
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
            // Adicionar active ao botão e painel clicados
            button.classList.add('active');
            document.getElementById(`${tab}-panel`).classList.add('active');
        });
    });

    // Renderizar gráficos (ex: Chart.js)
    // Exemplo para o gráfico de tendências
    if (results.data && results.data.google_trends && results.data.google_trends.data_points) {
        const trendsCtx = document.getElementById('trendsChart');
        if (trendsCtx) {
            new Chart(trendsCtx, {
                type: 'line',
                data: {
                    labels: results.data.google_trends.data_points.map(dp => new Date(dp.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })),
                    datasets: [{
                        label: 'Interesse ao longo do tempo',
                        data: results.data.google_trends.data_points.map(dp => dp.value),
                        borderColor: '#ff6b35',
                        tension: 0.1,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // Exemplo para o gráfico de demanda mensal
    if (results.data && results.data.monthly_demand) {
        const demandCtx = document.getElementById('demandChart');
        if (demandCtx) {
            new Chart(demandCtx, {
                type: 'bar',
                data: {
                    labels: results.data.monthly_demand.map(md => md.month),
                    datasets: [{
                        label: 'Índice de Demanda Mensal',
                        data: results.data.monthly_demand.map(md => md.value),
                        backgroundColor: '#3498db',
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // Exemplo para o gráfico de sazonalidade
    if (results.data && results.data.seasonality && results.data.seasonality.seasonal_index) {
        const seasonalityCtx = document.getElementById('seasonalityChart');
        if (seasonalityCtx) {
            new Chart(seasonalityCtx, {
                type: 'pie',
                data: {
                    labels: ['Primavera', 'Verão', 'Outono', 'Inverno'],
                    datasets: [{
                        label: 'Índice Sazonal',
                        data: [
                            results.data.seasonality.seasonal_index * results.data.seasonality.spring,
                            results.data.seasonality.seasonal_index * results.data.seasonality.summer,
                            results.data.seasonality.seasonal_index * results.data.seasonality.autumn,
                            results.data.seasonality.seasonal_index * results.data.seasonality.winter
                        ],
                        backgroundColor: ['#2ecc71', '#f1c40f', '#e67e22', '#3498db'],
                    }]
                },
                options: {
                    responsive: true,
                }
            });
        }
    }
}

function loadSearchHistory() {
    // Implementar carregamento do histórico do localStorage
    try {
        const history = JSON.parse(localStorage.getItem('marketResearchHistory') || '[]');
        currentSearchState.searchHistory = history;
        // Opcional: renderizar histórico na UI
    } catch (e) {
        console.error('Erro ao carregar histórico de pesquisa:', e);
        currentSearchState.searchHistory = [];
    }
}

function checkMarketResearchAccess() {
    // Implementar lógica de verificação de acesso (ex: plano de assinatura)
    // Por enquanto, sempre retorna true para permitir a pesquisa
    return true;
}

function getCachedResult(query) {
    // Implementar cache baseado em localStorage ou IndexedDB
    const cached = localStorage.getItem(`marketResearchCache_${query}`);
    if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < MARKET_RESEARCH_CONFIG.cacheTimeout) {
            return data;
        }
    }
    return null;
}

function setCachedResult(query, results) {
    localStorage.setItem(`marketResearchCache_${query}`, JSON.stringify({ timestamp: Date.now(), data: results }));
}

function addToSearchHistory(query) {
    let history = currentSearchState.searchHistory;
    // Remover duplicatas e adicionar no início
    history = history.filter(item => item !== query);
    history.unshift(query);
    // Limitar tamanho do histórico
    history = history.slice(0, 10); 
    currentSearchState.searchHistory = history;
    localStorage.setItem('marketResearchHistory', JSON.stringify(history));
}

// Função para inicializar a pesquisa de mercado
function initMarketResearch() {
    console.log('Inicializando sistema de pesquisa de mercado aprimorado...');
    
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
    
    // Inicializar componentes avançados
    initAdvancedComponents();
    
    console.log('Sistema de pesquisa de mercado aprimorado inicializado com sucesso');
}

// Inicializar componentes avançados
function initAdvancedComponents() {
    // Criar container para análises em tempo real
    createRealTimeAnalysisContainer();
    
    // Inicializar sistema de notificações
    initNotificationSystem();
    
    // Configurar auto-complete inteligente
    setupIntelligentAutoComplete();

    // Adicionar elemento para mensagens de erro de input
    const searchInputGroup = document.querySelector('.search-input-group');
    if (searchInputGroup && !document.getElementById('searchInputError')) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'searchInputError';
        errorDiv.className = 'input-error-message';
        errorDiv.style.display = 'none';
        searchInputGroup.appendChild(errorDiv);
    }

    // Adicionar link para Chart.js se não existir
    if (!document.querySelector('script[src*="chart.js"]')) {
        const chartJsScript = document.createElement('script');
        chartJsScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        document.head.appendChild(chartJsScript);
    }

    // Adicionar link para Font Awesome se não existir
    if (!document.querySelector('link[href*="fontawesome"]')) {
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fontAwesomeLink);
    }
}

// Configurar event listeners
function setupMarketResearchEventListeners() {
    const searchInput = document.getElementById('marketSearchInput');
    const searchButton = document.getElementById('marketSearchButton');
    
    // Event listener para o botão de pesquisa
    searchButton.addEventListener('click', handleAdvancedMarketSearch);
    
    // Event listener para Enter no campo de pesquisa
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAdvancedMarketSearch();
        }
    });
    
    // Event listener para validação em tempo real
    searchInput.addEventListener('input', validateSearchInput);
    
    // Event listener para sugestões inteligentes
    searchInput.addEventListener('input', debounce(showIntelligentSuggestions, 300));
    
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
        showInputError(`Digite pelo menos ${MARKET_RESEARCH_CONFIG.minSearchLength} caracteres`);
        return false;
    }
    
    if (query.length > MARKET_RESEARCH_CONFIG.maxSearchLength) {
        searchButton.disabled = true;
        searchInput.classList.add('invalid');
        showInputError(`Máximo de ${MARKET_RESEARCH_CONFIG.maxSearchLength} caracteres`);
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

// Manipular pesquisa de mercado avançada
async function handleAdvancedMarketSearch() {
    console.log('Iniciando pesquisa de mercado avançada...');
    
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
        showAdvancedMarketResearchResults(cachedResult);
        return;
    }
    
    try {
        // Iniciar estado de loading
        setAdvancedSearchLoadingState(true);
        currentSearchState.isSearching = true;
        currentSearchState.currentQuery = query;
        currentSearchState.currentAnalysisId = generateAnalysisId();
        
        // Mostrar progresso em tempo real
        showRealTimeProgress();
        
        // Fazer a pesquisa avançada
        const results = await performAdvancedMarketResearch(query);
        
        // Salvar no cache
        setCachedResult(query, results);
        
        // Salvar no histórico
        addToSearchHistory(query);
        
        // Mostrar resultados avançados
        showAdvancedMarketResearchResults(results);
        
        // Notificar conclusão
        showNotification('Análise concluída com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro na pesquisa de mercado:', error);
        showSearchError(error.message);
        showNotification('Erro na análise: ' + error.message, 'error');
    } finally {
        // Finalizar estado de loading
        setAdvancedSearchLoadingState(false);
        currentSearchState.isSearching = false;
        hideRealTimeProgress();
    }
}

// Realizar pesquisa de mercado avançada
async function performAdvancedMarketResearch(query) {
    console.log(`Realizando pesquisa avançada para: "${query}"`);
    
    // Obter token de autenticação
    // Assumindo que supabaseClient está disponível globalmente ou importado
    if (typeof supabaseClient === 'undefined') {
        throw new Error('supabaseClient não está definido. Certifique-se de que o Supabase JS SDK está carregado.');
    }

    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError || !session || !session.access_token) {
        throw new Error('Usuário não autenticado ou sessão expirada.');
    }
    
    const accessToken = session.access_token;
    
    // Atualizar progresso
    updateRealTimeProgress('Iniciando análise...', 10);
    
    // Fazer requisição para Edge Function aprimorada
    // Assumindo que SUPABASE_FUNCTIONS_BASE_URL está definido globalmente
    if (typeof SUPABASE_FUNCTIONS_BASE_URL === 'undefined') {
        throw new Error('SUPABASE_FUNCTIONS_BASE_URL não está definido. Verifique seu arquivo de configuração.');
    }

    const response = await fetch(`${SUPABASE_FUNCTIONS_BASE_URL}/market-research-advanced`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            query: query,
            timestamp: new Date().toISOString(),
            analysisId: currentSearchState.currentAnalysisId,
            options: {
                includeGoogleTrends: true,
                includeDemandAnalysis: true,
                includeContextAnalysis: true,
                includeCompetitorAnalysis: true,
                includePriceAnalysis: true,
                includeSeasonalityAnalysis: true,
                includeStrategicInsights: true
            }
        })
    });
    
    updateRealTimeProgress('Processando dados...', 30);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro na pesquisa: ${response.status}`);
    }
    
    const results = await response.json();
    
    updateRealTimeProgress('Finalizando análise...', 90);
    
    console.log('Resultados da pesquisa avançada:', results);
    
    updateRealTimeProgress('Concluído!', 100);
    
    return results;
}

// Mostrar resultados da pesquisa avançada
function showAdvancedMarketResearchResults(results) {
    console.log('Exibindo resultados da pesquisa avançada');
    
    // Criar e mostrar modal avançado
    const modal = createAdvancedResultsModal(results);
    document.body.appendChild(modal);
    
    // Adicionar estilos se necessário
    ensureAdvancedModalStyles();
    
    // Animar entrada do modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Salvar resultados atuais
    currentSearchState.lastResults = results;
    
    // Inicializar componentes interativos
    initInteractiveComponents(results);
}

// Criar modal de resultados avançado
function createAdvancedResultsModal(results) {
    const modal = document.createElement('div');
    modal.className = 'market-research-modal advanced';
    modal.id = 'marketResearchModal';
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeMarketResearchModal()"></div>
        <div class="modal-content advanced">
            <div class="modal-header advanced">
                <div class="header-content">
                    <h2><i class="fas fa-chart-line"></i> Análise Avançada de Mercado</h2>
                    <div class="analysis-meta">
                        <span class="product-name">${results.data?.product_name || currentSearchState.currentQuery}</span>
                        <span class="analysis-date">${new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
                <div class="header-actions">
                    <button class="btn-icon" onclick="exportAdvancedResults()" title="Exportar Relatório">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon" onclick="shareAnalysis()" title="Compartilhar">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button class="modal-close" onclick="closeMarketResearchModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="modal-body advanced">
                <div class="analysis-tabs">
                    <button class="tab-btn active" data-tab="overview">Visão Geral</button>
                    <button class="tab-btn" data-tab="trends">Tendências</button>
                    <button class="tab-btn" data-tab="demand">Demanda</button>
                    <button class="tab-btn" data-tab="competition">Concorrência</button>
                    <button class="tab-btn" data-tab="insights">Insights</button>
                </div>
                
                <div class="tab-content">
                    <div class="tab-panel active" id="overview-panel">
                        ${generateOverviewHTML(results)}
                    </div>
                    <div class="tab-panel" id="trends-panel">
                        ${generateTrendsHTML(results)}
                    </div>
                    <div class="tab-panel" id="demand-panel">
                        ${generateDemandHTML(results)}
                    </div>
                    <div class="tab-panel" id="competition-panel">
                        ${generateCompetitionHTML(results)}
                    </div>
                    <div class="tab-panel" id="insights-panel">
                        ${generateInsightsHTML(results)}
                    </div>
                </div>
            </div>
            
            <div class="modal-footer advanced">
                <div class="footer-info">
                    <span class="analysis-id">ID: ${currentSearchState.currentAnalysisId}</span>
                    <span class="confidence-score">Confiança: ${results.data?.confidence_score || 85}%</span>
                </div>
                <div class="footer-actions">
                    <button class="btn-secondary" onclick="closeMarketResearchModal()">
                        Fechar
                    </button>
                    <button class="btn-primary" onclick="exportAdvancedResults()">
                        <i class="fas fa-download"></i> Exportar Relatório
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Gerar HTML da visão geral
function generateOverviewHTML(results) {
    if (!results || !results.success) {
        return `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro na Análise</h3>
                <p>${results?.error || 'Não foi possível realizar a análise'}</p>
            </div>
        `;
    }
    
    const data = results.data;
    
    return `
        <div class="overview-container">
            <!-- Resumo Executivo -->
            <div class="executive-summary">
                <h3><i class="fas fa-clipboard-list"></i> Resumo Executivo</h3>
                <div class="summary-grid">
                    <div class="summary-card primary">
                        <div class="card-icon"><i class="fas fa-box"></i></div>
                        <div class="card-content">
                            <h4>Produto</h4>
                            <p>${data.product_name || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="card-icon"><i class="fas fa-tags"></i></div>
                        <div class="card-content">
                            <h4>Categoria</h4>
                            <p>${data.category || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="card-icon"><i class="fas fa-chart-line"></i></div>
                        <div class="card-content">
                            <h4>Índice de Demanda</h4>
                            <p class="demand-${getDemandLevel(data.demand_index)}">${data.demand_index || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="card-icon"><i class="fas fa-trophy"></i></div>
                        <div class="card-content">
                            <h4>Potencial de Mercado</h4>
                            <p class="potential-${getMarketPotential(data.market_potential)}">${data.market_potential || 'Médio'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Contexto Demográfico -->
            <div class="context-section">
                <h3><i class="fas fa-globe-americas"></i> Contexto Demográfico e Climático</h3>
                <div class="context-content">
                    <div class="context-text">
                        <p>${data.demographic_context || 'Análise de contexto não disponível'}</p>
                    </div>
                    <div class="context-indicators">
                        <div class="indicator">
                            <i class="fas fa-thermometer-half"></i>
                            <span>Clima Tropical</span>
                        </div>
                        <div class="indicator">
                            <i class="fas fa-users"></i>
                            <span>Demografia</span>
                        </div>
                        <div class="indicator">
                            <i class="fas fa-trending-up"></i>
                            <span>Tendências</span>
                        </div>
                        <div class="indicator">
                            <i class="fas fa-map-marked-alt"></i>
                            <span>Regiões</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Análise de Preços -->
            <div class="price-section">
                <h3><i class="fas fa-dollar-sign"></i> Análise de Preços</h3>
                <div class="price-analysis">
                    ${generatePriceAnalysisHTML(data.price_analysis)}
                </div>
            </div>
        </div>
    `;
}

// Gerar HTML das tendências
function generateTrendsHTML(results) {
    const data = results.data;
    
    return `
        <div class="trends-container">
            <!-- Google Trends -->
            <div class="trends-section">
                <h3><i class="fab fa-google"></i> Tendências Google Trends</h3>
                <div class="trends-chart-container">
                    <canvas id="trendsChart" width="400" height="200"></canvas>
                </div>
                <div class="trends-analysis">
                    <p>${data.trends_analysis || 'Análise de tendências baseada nos últimos 12 meses mostra variações sazonais significativas.'}</p>
                </div>
            </div>
            
            <!-- Picos de Interesse -->
            <div class="peaks-section">
                <h3><i class="fas fa-mountain"></i> Picos de Interesse</h3>
                <div class="peaks-grid">
                    ${generatePeaksHTML(data.interest_peaks)}
                </div>
            </div>
            
            <!-- Sazonalidade -->
            <div class="seasonality-section">
                <h3><i class="fas fa-calendar-alt"></i> Análise de Sazonalidade</h3>
                <div class="seasonality-chart-container">
                    <canvas id="seasonalityChart" width="400" height="200"></canvas>
                </div>
            </div>
        </div>
    `;
}

// Gerar HTML da demanda
function generateDemandHTML(results) {
    const data = results.data;
    
    return `
        <div class="demand-container">
            <!-- Índice de Demanda Mensal -->
            <div class="monthly-demand-section">
                <h3><i class="fas fa-chart-bar"></i> Índice de Demanda Mensal</h3>
                <div class="demand-chart-container">
                    <canvas id="demandChart" width="400" height="200"></canvas>
                </div>
                <div class="demand-table">
                    ${generateMonthlyDemandTable(data.monthly_demand)}
                </div>
            </div>
            
            <!-- Previsão de Demanda -->
            <div class="forecast-section">
                <h3><i class="fas fa-crystal-ball"></i> Previsão de Demanda</h3>
                <div class="forecast-content">
                    ${generateDemandForecast(data.demand_forecast)}
                </div>
            </div>
        </div>
    `;
}

// Gerar HTML da concorrência
function generateCompetitionHTML(results) {
    const data = results.data;
    
    return `
        <div class="competition-container">
            <!-- Análise Competitiva -->
            <div class="competitive-analysis-section">
                <h3><i class="fas fa-chess"></i> Análise Competitiva</h3>
                <div class="competitors-grid">
                    ${generateCompetitorsHTML(data.competitors)}
                </div>
            </div>
            
            <!-- Oportunidades de Mercado -->
            <div class="opportunities-section">
                <h3><i class="fas fa-bullseye"></i> Oportunidades de Mercado</h3>
                <div class="opportunities-list">
                    ${generateOpportunitiesHTML(data.market_opportunities)}
                </div>
            </div>
        </div>
    `;
}

// Gerar HTML dos insights
function generateInsightsHTML(results) {
    const data = results.data;
    
    return `
        <div class="insights-container">
            <!-- Insights Estratégicos -->
            <div class="strategic-insights-section">
                <h3><i class="fas fa-lightbulb"></i> Insights Estratégicos</h3>
                <div class="insights-grid">
                    ${generateStrategicInsightsHTML(data.strategic_insights)}
                </div>
            </div>
            
            <!-- Recomendações de Ação -->
            <div class="recommendations-section">
                <h3><i class="fas fa-tasks"></i> Recomendações de Ação</h3>
                <div class="recommendations-timeline">
                    ${generateRecommendationsHTML(data.recommendations)}
                </div>
            </div>
        </div>
    `;
}

// Funções auxiliares para geração de HTML
function generatePriceAnalysisHTML(priceAnalysis) {
    if (!priceAnalysis) {
        return '<p class="no-data">Dados de preços não disponíveis</p>';
    }
    
    return `
        <div class="price-grid">
            <div class="price-card">
                <div class="price-label">Preço Médio</div>
                <div class="price-value">R$ ${priceAnalysis.average_price?.toFixed(2) || 'N/A'}</div>
                <div class="price-trend ${priceAnalysis.average_trend || 'stable'}">
                    <i class="fas fa-arrow-${priceAnalysis.average_trend === 'up' ? 'up' : priceAnalysis.average_trend === 'down' ? 'down' : 'right'}"></i>
                </div>
            </div>
            <div class="price-card">
                <div class="price-label">Preço Mínimo</div>
                <div class="price-value">R$ ${priceAnalysis.min_price?.toFixed(2) || 'N/A'}</div>
            </div>
            <div class="price-card">
                <div class="price-label">Preço Máximo</div>
                <div class="price-value">R$ ${priceAnalysis.max_price?.toFixed(2) || 'N/A'}</div>
            </div>
            <div class="price-card suggested">
                <div class="price-label">Preço Sugerido</div>
                <div class="price-value">R$ ${priceAnalysis.suggested_price?.toFixed(2) || 'N/A'}</div>
                <div class="confidence">Confiança: ${priceAnalysis.confidence || 85}%</div>
            </div>
        </div>
    `;
}

function generatePeaksHTML(peaks) {
    if (!peaks || peaks.length === 0) {
        return '<p class="no-data">Nenhum pico de interesse identificado.</p>';
    }
    return peaks.map(peak => `
        <div class="peak-card">
            <h4>${peak.month}</h4>
            <p>${peak.reason}</p>
        </div>
    `).join('');
}

function generateMonthlyDemandTable(monthlyDemand) {
    if (!monthlyDemand || monthlyDemand.length === 0) {
        return '<p class="no-data">Dados de demanda mensal não disponíveis.</p>';
    }
    return `
        <table>
            <thead>
                <tr>
                    <th>Mês</th>
                    <th>Índice</th>
                    <th>Nível</th>
                </tr>
            </thead>
            <tbody>
                ${monthlyDemand.map(item => `
                    <tr>
                        <td>${item.month}</td>
                        <td>${item.value}</td>
                        <td class="demand-${item.level}">${item.level.charAt(0).toUpperCase() + item.level.slice(1)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function generateDemandForecast(forecast) {
    if (!forecast) {
        return '<p class="no-data">Previsão de demanda não disponível.</p>';
    }
    return `
        <div class="forecast-card">
            <p>${forecast.description || 'Previsão de demanda para os próximos meses.'}</p>
            <ul>
                <li>**Próximo Mês:** ${forecast.next_month_trend || 'Estável'}</li>
                <li>**Próximos 3 Meses:** ${forecast.three_month_trend || 'Crescimento Moderado'}</li>
                <li>**Próximos 6 Meses:** ${forecast.six_month_trend || 'Potencial de Alta'}</li>
            </ul>
        </div>
    `;
}

function generateCompetitorsHTML(competitors) {
    if (!competitors || competitors.length === 0) {
        return '<p class="no-data">Dados de concorrentes não disponíveis.</p>';
    }
    return competitors.map(comp => `
        <div class="competitor-card">
            <h4>${comp.name}</h4>
            <p>Participação de Mercado: ${comp.market_share}</p>
            <p>Faixa de Preço: ${comp.price_range}</p>
            <p>Força: ${comp.strength}</p>
        </div>
    `).join('');
}

function generateOpportunitiesHTML(opportunities) {
    if (!opportunities || opportunities.length === 0) {
        return '<p class="no-data">Nenhuma oportunidade de mercado identificada.</p>';
    }
    return `<ul>${opportunities.map(opp => `<li>${opp}</li>`).join('')}</ul>`;
}

function generateStrategicInsightsHTML(insights) {
    if (!insights || insights.length === 0) {
        return '<p class="no-data">Nenhum insight estratégico disponível.</p>';
    }
    return insights.map(insight => `
        <div class="insight-card ${insight.priority}">
            <i class="fas fa-${insight.icon}"></i>
            <h4>${insight.title}</h4>
            <p>${insight.description}</p>
        </div>
    `).join('');
}

function generateRecommendationsHTML(recommendations) {
    if (!recommendations || recommendations.length === 0) {
        return '<p class="no-data">Nenhuma recomendação de ação disponível.</p>';
    }
    return recommendations.map(rec => `
        <div class="recommendation-item">
            <h4>${rec.title}</h4>
            <p>${rec.description}</p>
            <span class="timeline">${rec.timeline}</span>
        </div>
    `).join('');
}

// Funções utilitárias
function getDemandLevel(demandIndex) {
    if (!demandIndex) return 'unknown';
    
    const index = parseFloat(demandIndex);
    if (index >= 80) return 'high';
    if (index >= 50) return 'medium';
    if (index >= 20) return 'low';
    return 'very-low';
}

function getMarketPotential(potential) {
    return potential || 'medium';
}

function generateAnalysisId() {
    return 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Componentes de progresso em tempo real
function createRealTimeAnalysisContainer() {
    const container = document.createElement('div');
    container.id = 'realTimeAnalysisContainer';
    container.className = 'real-time-container hidden';
    container.innerHTML = `
        <div class="progress-header">
            <h4>Analisando mercado...</h4>
            <button class="close-progress" onclick="hideRealTimeProgress()">×</button>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
        </div>
        <div class="progress-text" id="progressText">Iniciando...</div>
    `;
    
    document.body.appendChild(container);
}

function showRealTimeProgress() {
    const container = document.getElementById('realTimeAnalysisContainer');
    if (container) {
        container.classList.remove('hidden');
    }
}

function hideRealTimeProgress() {
    const container = document.getElementById('realTimeAnalysisContainer');
    if (container) {
        container.classList.add('hidden');
    }
}

function updateRealTimeProgress(text, percentage) {
    const progressText = document.getElementById('progressText');
    const progressFill = document.getElementById('progressFill');
    
    if (progressText) progressText.textContent = text;
    if (progressFill) progressFill.style.width = percentage + '%';
}

// Sistema de notificações
function initNotificationSystem() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'notification-container';
    document.body.appendChild(container);
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="close-notification" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Auto-complete inteligente
function setupIntelligentAutoComplete() {
    // Implementar sugestões baseadas em histórico e tendências
}

function showIntelligentSuggestions(event) {
    // Implementar sugestões inteligentes
}

// Definir estado de loading avançado
function setAdvancedSearchLoadingState(isLoading) {
    const searchButton = document.getElementById('marketSearchButton');
    const searchInput = document.getElementById('marketSearchInput');
    
    if (isLoading) {
        searchButton.disabled = true;
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analisando...';
        searchInput.disabled = true;
    } else {
        searchButton.disabled = false;
        searchButton.innerHTML = '<i class="fas fa-search"></i> Analisar';
        searchInput.disabled = false;
    }
}

// Exportar funções globais
window.initMarketResearch = initMarketResearch;
window.closeMarketResearchModal = closeMarketResearchModal;
window.exportAdvancedResults = exportAdvancedResults;
window.shareAnalysis = shareAnalysis;

// Manter compatibilidade com funções existentes
window.exportResults = exportAdvancedResults;

console.log('Market Research Enhanced module loaded');

// Chamar initMarketResearch quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initMarketResearch);

// Adicionar estilos para mensagens de erro de input
const style = document.createElement('style');
style.innerHTML = `
    .input-error-message {
        color: #e74c3c;
        font-size: 0.85rem;
        margin-top: 5px;
        display: none;
    }
`;
document.head.appendChild(style);

// Adicionar estilos para o modal
const modalStyle = document.createElement('style');
modalStyle.innerHTML = `
    .market-research-modal.advanced {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
    }
    .market-research-modal.advanced.show {
        opacity: 1;
        visibility: visible;
    }
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
    }
    .modal-content.advanced {
        position: relative;
        background: white;
        border-radius: 20px;
        max-width: 95vw;
        max-height: 95vh;
        width: 1200px;
        margin: 2.5vh auto;
        overflow: hidden;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
    }
    .modal-header.advanced {
        background: linear-gradient(135deg, #2c3e50, #34495e);
        color: white;
        padding: 25px 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 3px solid #ff6b35;
    }
    .header-content h2 {
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 1.8rem;
        font-weight: 700;
    }
    .analysis-meta {
        display: flex;
        gap: 20px;
        font-size: 0.9rem;
        opacity: 0.9;
    }
    .product-name {
        font-weight: 600;
        color: #ff6b35;
    }
    .header-actions {
        display: flex;
        gap: 10px;
        align-items: center;
    }
    .btn-icon {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        padding: 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }
    .btn-icon:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
    }
    .modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 8px;
        border-radius: 8px;
        transition: all 0.2s;
    }
    .modal-close:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    .modal-body.advanced {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    .analysis-tabs {
        display: flex;
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
        padding: 0 30px;
    }
    .tab-btn {
        background: none;
        border: none;
        padding: 15px 25px;
        cursor: pointer;
        font-weight: 600;
        color: #6c757d;
        border-bottom: 3px solid transparent;
        transition: all 0.3s ease;
        font-size: 0.95rem;
    }
    .tab-btn:hover {
        color: #ff6b35;
        background: rgba(255, 107, 53, 0.05);
    }
    .tab-btn.active {
        color: #ff6b35;
        border-bottom-color: #ff6b35;
        background: white;
    }
    .tab-content {
        flex: 1;
        overflow-y: auto;
        padding: 30px;
    }
    .tab-panel {
        display: none;
    }
    .tab-panel.active {
        display: block;
    }
    .overview-container {
        display: flex;
        flex-direction: column;
        gap: 30px;
    }
    .executive-summary h3 {
        color: #2c3e50;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.4rem;
        font-weight: 700;
    }
    .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }
    .summary-card {
        background: white;
        border: 2px solid #ecf0f1;
        border-radius: 15px;
        padding: 25px;
        display: flex;
        align-items: center;
        gap: 15px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    .summary-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #3498db, #2ecc71);
    }
    .summary-card.primary::before {
        background: linear-gradient(90deg, #ff6b35, #f39c12);
    }
    .summary-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        border-color: #ff6b35;
    }
    .card-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #ff6b35, #f39c12);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.2rem;
    }
    .card-content h4 {
        margin: 0 0 5px 0;
        color: #2c3e50;
        font-weight: 600;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .card-content p {
        margin: 0;
        color: #34495e;
        font-weight: 700;
        font-size: 1.1rem;
    }
    .demand-high { color: #27ae60; }
    .demand-medium { color: #f39c12; }
    .demand-low { color: #e67e22; }
    .demand-very-low { color: #e74c3c; }
    .potential-high { color: #27ae60; }
    .potential-medium { color: #f39c12; }
    .potential-low { color: #e74c3c; }
    .context-section {
        background: linear-gradient(135deg, #74b9ff, #0984e3);
        color: white;
        padding: 30px;
        border-radius: 15px;
        margin: 20px 0;
    }
    .context-section h3 {
        color: white;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .context-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .context-text p {
        font-size: 1.1rem;
        line-height: 1.8;
        margin: 0;
    }
    .context-indicators {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
    }
    .indicator {
        background: rgba(255, 255, 255, 0.2);
        padding: 12px 20px;
        border-radius: 25px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        backdrop-filter: blur(10px);
    }
    .price-section {
        background: #f8f9fa;
        padding: 30px;
        border-radius: 15px;
        border: 2px solid #ecf0f1;
    }
    .price-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }
    .price-card {
        background: white;
        border: 2px solid #ecf0f1;
        border-radius: 12px;
        padding: 25px;
        text-align: center;
        position: relative;
        transition: all 0.3s ease;
    }
    .price-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    .price-card.suggested {
        border-color: #ff6b35;
        background: linear-gradient(135deg, #fff5f2, #ffffff);
    }
    .price-card.suggested::before {
        content: '⭐ RECOMENDADO';
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff6b35;
        color: white;
        padding: 5px 15px;
        border-radius: 15px;
        font-size: 0.7rem;
        font-weight: 700;
    }
    .price-label {
        font-size: 0.9rem;
        color: #7f8c8d;
        margin-bottom: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .price-value {
        font-size: 1.8rem;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 10px;
    }
    .price-value.suggested {
        color: #ff6b35;
    }
    .price-trend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    .price-trend.up { color: #27ae60; }
    .price-trend.down { color: #e74c3c; }
    .price-trend.stable { color: #95a5a6; }
    .confidence {
        font-size: 0.8rem;
        color: #7f8c8d;
        font-weight: 600;
    }
    .real-time-container {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        min-width: 300px;
        transition: all 0.3s ease;
    }
    .real-time-container.hidden {
        transform: translateX(350px);
        opacity: 0;
    }
    .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    .progress-header h4 {
        margin: 0;
        color: #2c3e50;
        font-size: 1.1rem;
    }
    .close-progress {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #95a5a6;
        padding: 5px;
    }
    .progress-bar {
        width: 100%;
        height: 8px;
        background: #ecf0f1;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 10px;
    }
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #ff6b35, #f39c12);
        border-radius: 4px;
        transition: width 0.3s ease;
        width: 0%;
    }
    .progress-text {
        font-size: 0.9rem;
        color: #7f8c8d;
        text-align: center;
    }
    .notification-container {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .notification {
        background: white;
        border-radius: 10px;
        padding: 15px 20px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        border-left: 4px solid #3498db;
        animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
        from {
            transform: translateX(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    .notification.success {
        border-left-color: #27ae60;
    }
    .notification.error {
        border-left-color: #e74c3c;
    }
    .notification i {
        font-size: 1.2rem;
    }
    .notification.success i { color: #27ae60; }
    .notification.error i { color: #e74c3c; }
    .notification.info i { color: #3498db; }
    .close-notification {
        background: none;
        border: none;
        font-size: 1.1rem;
        cursor: pointer;
        color: #95a5a6;
        margin-left: auto;
        padding: 5px;
    }
    .modal-footer.advanced {
        padding: 25px 30px;
        border-top: 1px solid #dee2e6;
        background: #f8f9fa;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .footer-info {
        display: flex;
        gap: 20px;
        font-size: 0.9rem;
        color: #6c757d;
    }
    .analysis-id {
        font-family: monospace;
        background: #e9ecef;
        padding: 4px 8px;
        border-radius: 4px;
    }
    .confidence-score {
        font-weight: 600;
    }
    .footer-actions {
        display: flex;
        gap: 15px;
    }
    .btn-primary, .btn-secondary {
        padding: 12px 25px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .btn-primary {
        background: linear-gradient(135deg, #ff6b35, #f39c12);
        color: white;
        box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
    }
    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
    }
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    .btn-secondary:hover {
        background: #5a6268;
        transform: translateY(-2px);
    }
    @media (max-width: 768px) {
        .market-research-page {
            padding: 15px;
        }
        .market-research-header {
            padding: 25px;
        }
        .market-research-header h1 {
            font-size: 2.2rem;
            flex-direction: column;
            gap: 15px;
        }
        .market-search-container {
            padding: 25px;
        }
        .search-form {
            flex-direction: column;
            gap: 20px;
        }
        .modal-content.advanced {
            width: 95vw;
            height: 95vh;
            margin: 2.5vh auto;
        }
        .analysis-tabs {
            overflow-x: auto;
            padding: 0 15px;
        }
        .tab-btn {
            white-space: nowrap;
            padding: 12px 20px;
        }
        .tab-content {
            padding: 20px;
        }
        .summary-grid {
            grid-template-columns: 1fr;
        }
        .price-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        .context-indicators {
            justify-content: center;
        }
        .real-time-container {
            right: 10px;
            left: 10px;
            min-width: auto;
        }
        .notification-container {
            left: 10px;
            right: 10px;
        }
        .notification {
            min-width: auto;
        }
    }
    @media (max-width: 480px) {
        .price-grid {
            grid-template-columns: 1fr;
        }
        .footer-actions {
            flex-direction: column;
            width: 100%;
        }
        .btn-primary, .btn-secondary {
            width: 100%;
            justify-content: center;
        }
    }
    body.dark-theme .market-research-page {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        color: #ecf0f1;
    }
    body.dark-theme .market-research-header,
    body.dark-theme .market-search-container {
        background: #34495e;
        border: 1px solid #4a5568;
    }
    body.dark-theme .market-research-header h1,
    body.dark-theme .search-input-group label {
        color: #ecf0f1;
    }
    body.dark-theme #marketSearchInput {
        background: #2c3e50;
        border-color: #4a5568;
        color: #ecf0f1;
    }
    body.dark-theme #marketSearchInput:focus {
        background: #34495e;
        border-color: #ff6b35;
    }
    body.dark-theme .modal-content.advanced {
        background: #34495e;
    }
    body.dark-theme .analysis-tabs {
        background: #2c3e50;
        border-bottom-color: #4a5568;
    }
    body.dark-theme .tab-btn {
        color: #a0aec0;
    }
    body.dark-theme .tab-btn.active,
    body.dark-theme .tab-btn:hover {
        color: #ff6b35;
        background: #34495e;
    }
    body.dark-theme .summary-card {
        background: #2c3e50;
        border-color: #4a5568;
    }
    body.dark-theme .summary-card h4,
    body.dark-theme .summary-card p {
        color: #ecf0f1;
    }
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .market-research-page > * {
        animation: fadeInUp 0.6s ease-out;
    }
    .market-research-page > *:nth-child(2) {
        animation-delay: 0.1s;
    }
    .market-research-page > *:nth-child(3) {
        animation-delay: 0.2s;
    }
    .loading-shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
        0% {
            background-position: -200% 0;
        }
        100% {
            background-position: 200% 0;
        }
    }
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    button:focus,
    input:focus {
        outline: 2px solid #ff6b35;
        outline-offset: 2px;
    }
    * {
        transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
    }
    @media print {
        .modal-overlay,
        .modal-header,
        .modal-footer,
        .analysis-tabs,
        .real-time-container,
        .notification-container {
            display: none !important;
        }
        .modal-content.advanced {
            position: static;
            width: 100%;
            height: auto;
            max-width: none;
            max-height: none;
            margin: 0;
            box-shadow: none;
            border: 1px solid #000;
        }
        .tab-panel {
            display: block !important;
            page-break-inside: avoid;
        }
    }
`;
document.head.appendChild(modalStyle);

// Chamar initMarketResearch quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initMarketResearch);

