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
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError || !session || !session.access_token) {
        throw new Error('Usuário não autenticado');
    }
    
    const accessToken = session.access_token;
    
    // Atualizar progresso
    updateRealTimeProgress('Iniciando análise...', 10);
    
    // Fazer requisição para Edge Function aprimorada
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
                <div class="price-value">R$ ${priceAnalysis.average_price || 'N/A'}</div>
                <div class="price-trend ${priceAnalysis.average_trend || 'stable'}">
                    <i class="fas fa-arrow-${priceAnalysis.average_trend === 'up' ? 'up' : priceAnalysis.average_trend === 'down' ? 'down' : 'right'}"></i>
                </div>
            </div>
            <div class="price-card">
                <div class="price-label">Preço Mínimo</div>
                <div class="price-value">R$ ${priceAnalysis.min_price || 'N/A'}</div>
            </div>
            <div class="price-card">
                <div class="price-label">Preço Máximo</div>
                <div class="price-value">R$ ${priceAnalysis.max_price || 'N/A'}</div>
            </div>
            <div class="price-card suggested">
                <div class="price-label">Preço Sugerido</div>
                <div class="price-value">R$ ${priceAnalysis.suggested_price || 'N/A'}</div>
                <div class="confidence">Confiança: ${priceAnalysis.confidence || 85}%</div>
            </div>
        </div>
    `;
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

