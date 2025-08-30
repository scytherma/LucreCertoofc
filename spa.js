// spa.js - Sistema de Single Page Application

document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('content-container');
    const navLinks = document.querySelectorAll('.nav__item');

    // Função para carregar o conteúdo da página
    function loadPage(route) {
        let pageContent = '';

        switch (route) {
            case 'home':
                pageContent = getHomeContent();
                break;
            case 'calculadora':
                pageContent = getCalculadoraContent();
                break;
            case 'gerenciar':
                pageContent = getGerenciarContent();
                break;
            case 'fechamento':
                pageContent = getFechamentoContent();
                break;
            case 'pesquisa':
                pageContent = getPesquisaContent();
                setTimeout(() => {
                    initMarketResearch();
                }, 0);
                break;
            case 'dre':
                pageContent = getDreContent();
                break;
            case 'conexoes':
                pageContent = getConexoesContent();
                break;
            case 'planos':
                pageContent = getPlanosContent();
                // Adicionar event listeners para os botões de plano após o carregamento do conteúdo
                setTimeout(() => {
                    const planButtons = document.querySelectorAll(".plan-btn-page");
                    planButtons.forEach(button => {
                        const planId = button.getAttribute("data-plan");
                        if (planId && typeof window.selectPlan === 'function') {
                            button.addEventListener('click', () => {
                                window.selectPlan(planId);
                            });
                        }
                    });
                }, 0);
                break;
            default:
                pageContent = getHomeContent();
        }

        contentContainer.innerHTML = pageContent;

        // Se for a página da calculadora, reinicializar os event listeners
        if (route === 'calculadora') {
            initCalculatorEvents();
            applyAccessControls();
        }
        
        // Se for a página DRE, inicializar a calculadora DRE
        if (route === 'dre') {
            setupDREPage();
        }
    }

    // Função para atualizar a classe 'active' nos links da navegação
    function updateActiveClass(route) {
        navLinks.forEach(link => {
            if (link.getAttribute('data-route') === route) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Manipulador de cliques para os links da navegação
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const route = link.getAttribute('data-route');
            loadPage(route);
            updateActiveClass(route);
        });
    });

    // Carrega a página inicial (Home)
    loadPage('home');
    updateActiveClass('home');
});

// Conteúdo da página Home
function getHomeContent() {
    return `
        <div class="page-container">
            <div class="welcome-section">
                <h1>Olá, bem-vindo ao Lucre Certo!</h1>
                <p>Utilize nossas ferramentas para potencializar suas vendas e maximizar seus lucros.</p>
            </div>

            <div class="updates-section">
                <h2>Atualizações</h2>
                
                <div class="update-item">
                    <div class="update-version">2.0.0</div>
                    <div class="update-content">
                        <ul>
                            <li>Nova interface com sidebar animada para melhor navegação</li>
                            <li>Sistema de Single Page Application (SPA) para transições mais rápidas</li>
                            <li>Página inicial com informações sobre atualizações e melhorias</li>
                            <li>Design responsivo aprimorado para dispositivos móveis</li>
                        </ul>
                    </div>
                </div>

                <div class="update-item">
                    <div class="update-version">1.5.0</div>
                    <div class="update-content">
                        <ul>
                            <li>Calculadora para Mercado Livre com taxas específicas por categoria</li>
                            <li>Sistema de multiplicadores para cálculo de múltiplos produtos</li>
                            <li>Melhorias na interface da calculadora de precificação</li>
                            <li>Correção de bugs menores</li>
                        </ul>
                    </div>
                </div>

                <div class="update-item">
                    <div class="update-version">1.4.0</div>
                    <div class="update-content">
                        <ul>
                            <li>Adicionado sistema de autenticação com Supabase</li>
                            <li>Tema claro/escuro para melhor experiência do usuário</li>
                            <li>Sistema de custos extras dinâmicos</li>
                            <li>Melhorias na responsividade mobile</li>
                        </ul>
                    </div>
                </div>

                <div class="update-item">
                    <div class="update-version">1.3.0</div>
                    <div class="update-content">
                        <ul>
                            <li>Calculadora da Shopee com programa de frete grátis</li>
                            <li>Sistema de abas para diferentes plataformas</li>
                            <li>Cálculos automáticos de margem de lucro</li>
                            <li>Interface moderna e intuitiva</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="future-features-section">
                <h2>Próximas Funcionalidades</h2>
                <div class="feature-grid">
                    <div class="feature-card">
                        <i class="fas fa-list-check"></i>
                        <h3>Gerenciar Anúncios</h3>
                        <p>Sistema completo para gerenciar seus anúncios em diferentes plataformas</p>
                        <span class="status coming-soon">Em breve</span>
                    </div>
                    <div class="feature-card">
                        <i class="fas fa-calendar-check"></i>
                        <h3>Fechamento de Mês</h3>
                        <p>Relatórios detalhados de vendas e lucros mensais</p>
                        <span class="status coming-soon">Em breve</span>
                    </div>
                    <div class="feature-card">
                        <i class="fas fa-search"></i>
                        <h3>Pesquisa de Mercado</h3>
                        <p>Análise competitiva e tendências de mercado</p>
                        <span class="status coming-soon">Em breve</span>
                    </div>
                    <div class="feature-card">
                        <i class="fas fa-plug"></i>
                        <h3>Conexões</h3>
                        <p>Integração com APIs das principais plataformas de e-commerce</p>
                        <span class="status coming-soon">Em breve</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Conteúdo da página Calculadora (conteúdo original)
function getCalculadoraContent() {
    return `
        <div class="container">
            <!-- Sistema de Abas -->
            <div class="tabs-container">
                <div class="tabs-header">
                    <button class="tab-button active" data-tab="shopee">Calculadora Shopee</button>
                    <button class="tab-button" data-tab="mercadolivre">Calculadora Mercado Livre</button>
                    <button class="tab-button disabled" data-tab="shein">Calculadora Shein</button>
                </div>
            </div>

            <!-- Conteúdo da Aba Shopee -->
            <div class="tab-content active" id="shopee-tab">
                <div class="calculator-wrapper">
                    <!-- Seção de Entrada de Dados -->
                    <div class="input-section">
                        <!-- Toggle Programa de Frete Grátis -->
                        <div class="frete-section">
                            <h2>PROGRAMA DE FRETE GRÁTIS DA SHOPEE</h2>
                            <div class="toggle-container">
                                <label class="toggle">
                                    <input type="checkbox" id="freteGratis" checked>
                                    <span class="slider"></span>
                                </label>
                                <span class="toggle-label">Sim</span>
                            </div>
                        </div>

                        <!-- Custo do Produto -->
                        <div class="input-group">
                            <div class="label-container">
                                <label for="custoProduto">CUSTO DO PRODUTO</label>
                                <span class="help-icon" title="Preço de custo do produto. Clique no + para adicionar mais de um produto.">?</span>
                            </div>
                            <div class="input-wrapper">
                                <span class="currency">R$</span>
                                <input type="text" id="custoProduto" placeholder="0,00">
                                <div class="multiplier-container">
                                    <span class="multiplier">1x</span>
                                    <div class="multiplier-arrows">
                                        <button type="button" class="arrow-up">▲</button>
                                        <button type="button" class="arrow-down">▼</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Impostos -->
                        <div class="input-group">
                            <div class="label-container">
                                <label for="impostos">IMPOSTOS</label>
                                <span class="help-icon" title="Porcentagem de imposto">?</span>
                            </div>
                            <div class="input-wrapper">
                                <span class="currency">%</span>
                                <input type="text" id="impostos" placeholder="0">
                            </div>
                        </div>

                        <!-- Despesas Variáveis -->
                        <div class="input-group">
                            <div class="label-container">
                                <label for="despesasVariaveis">DESPESAS VARIÁVEIS</label>
                                <span class="help-icon" title="Valor gasto com o anúncio. Ex: frete, embalagem, etiqueta, etc.">?</span>
                            </div>
                            <div class="input-wrapper">
                                <span class="currency">R$</span>
                                <input type="text" id="despesasVariaveis" placeholder="0,00">
                            </div>
                        </div>

                        <!-- Custos Extras Dinâmicos -->
                        <div class="input-group">
                            <div class="label-container">
                                <label>CUSTOS EXTRAS</label>
                                <span class="help-icon" title="Adicione valores que considerar importante para a precificação do anúncio clicando no +. Selecione entre R$ e %.">?</span>
                                <button type="button" class="add-custo-extra-btn">+</button>
                            </div>
                            <div id="custosExtrasContainer">
                                <!-- Campos de custo extra serão adicionados aqui via JavaScript -->
                            </div>
                        </div>
                    </div>

                    <!-- Seção de Resultados -->
                    <div class="results-section">
                        <!-- Resultados Principais -->
                        <div class="main-results">
                            <div class="result-item">
                                <span class="result-label">Preço de Venda</span>
                                <span class="result-value primary" id="precoVenda">R$ 5,00</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Lucro por Venda</span>
                                <span class="result-value primary" id="lucroPorVenda">R$ 0,00</span>
                            </div>
                        </div>

                        <!-- Grid de Resultados Secundários -->
                        <div class="secondary-results">
                            <div class="result-box">
                                <span class="result-label">Taxa da Shopee</span>
                                <span class="result-value" id="taxaShopee">R$5,00</span>
                            </div>
                            <div class="result-box">
                                <span class="result-label">Valor dos Impostos</span>
                                <span class="result-value" id="valorImpostos">R$0,00</span>
                            </div>
                            <div class="result-box">
                                <span class="result-label">Custo Total do Produto</span>
                                <span class="result-value" id="custoTotal">R$0,00</span>
                            </div>
                            <div class="result-box">
                                <span class="result-label">Retorno sobre Produto</span>
                                <span class="result-value" id="retornoProduto">0%</span>
                            </div>
                            <div class="result-box">
                                <span class="result-label">Markup %</span>
                                <span class="result-value" id="markupPercent">0%</span>
                            </div>
                            <div class="result-box">
                                <span class="result-label">Markup X</span>
                                <span class="result-value" id="markupX">0X</span>
                            </div>
                        </div>

                        <!-- Margem de Lucro -->
                        <div class="margin-section">
                            <h3>MARGEM DE LUCRO</h3>
                            <div class="margin-slider-container">
                                <input type="range" id="margemLucro" min="0" max="70" value="0" class="margin-slider" step="0.5">
                                <span class="margin-value" id="margemValue">0%</span>
                            </div>
                        </div>
                        <button type="button" id="limparCamposBtn" class="limpar-campos-btn">Limpar Campos</button>
                    </div>
                </div>
            </div>

            <!-- Conteúdo da Aba Mercado Livre -->
            <div class="tab-content" id="mercadolivre-tab">
                <div class="calculator-wrapper">
                    <!-- Seção de Entrada de Dados -->
                    <div class="input-section">
                        <!-- Custo do Produto -->
                        <div class="input-group">
                            <div class="label-container">
                                <label for="custoProdutoML">CUSTO DO PRODUTO</label>
                                <span class="help-icon" title="Preço de custo do produto">?</span>
                            </div>
                            <div class="input-wrapper">
                                <span class="currency">R$</span>
                                <input type="text" id="custoProdutoML" placeholder="0,00">
                                <div class="multiplier-container">
                                    <span class="multiplier" id="multiplierML">1x</span>
                                    <div class="multiplier-arrows">
                                        <button type="button" class="arrow-up" data-target="ML">▲</button>
                                        <button type="button" class="arrow-down" data-target="ML">▼</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Impostos -->
                        <div class="input-group">
                            <div class="label-container">
                                <label for="impostosML">IMPOSTOS</label>
                                <span class="help-icon" title="Porcentagem de imposto">?</span>
                            </div>
                            <div class="input-wrapper">
                                <span class="currency">%</span>
                                <input type="text" id="impostosML" placeholder="0">
                            </div>
                        </div>

                        <!-- Despesas Variáveis -->
                        <div class="input-group">
                            <div class="label-container">
                                <label for="despesasVariaveisML">DESPESAS VARIÁVEIS</label>
                                <span class="help-icon" title="Valor gasto com embalagem, etiqueta, etc.">?</span>
                            </div>
                            <div class="input-wrapper">
                                <span class="currency">R$</span>
                                <input type="text" id="despesasVariaveisML" placeholder="0,00">
                            </div>
                        </div>

                        <!-- Taxa do Mercado Livre -->
                        <div class="input-group">
                            <div class="label-container">
                                <label for="taxaMercadoLivreSelect">TAXA DO MERCADO LIVRE</label>
                                <span class="help-icon" title="Selecione a categoria e tipo de anúncio">?</span>
                            </div>
                            <div class="input-wrapper">
                                <span class="currency">%</span>
                                <select id="taxaMercadoLivreSelect" class="select-input">
                                    <option value="12">Geral - Clássico (12%)</option>
                                    <option value="15">Geral - Premium (15%)</option>
                                    <option value="14">Eletrônicos - Clássico (14%)</option>
                                    <option value="17">Eletrônicos - Premium (17%)</option>
                                    <option value="16">Moda e Beleza - Clássico (16%)</option>
                                    <option value="19">Moda e Beleza - Premium (19%)</option>
                                    <option value="12">Casa e Jardim - Clássico (12%)</option>
                                    <option value="15">Casa e Jardim - Premium (15%)</option>
                                    <option value="13">Esportes - Clássico (13%)</option>
                                    <option value="16">Esportes - Premium (16%)</option>
                                    <option value="10">Livros - Clássico (10%)</option>
                                    <option value="13">Livros - Premium (13%)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Taxa de Frete -->
                        <div class="input-group">
                            <div class="label-container">
                                <label for="taxaFreteSelect">TAXA DE FRETE</label>
                                <span class="help-icon" title="Selecione baseado no peso e valor do produto">?</span>
                            </div>
                            <div class="input-wrapper">
                            <span class="currency">R$</span>
                            <select id="taxaFreteSelect" class="select-input">
                                <optgroup label="Produtos < R$ 79, usados">
                                    <option value="39.90">Até 300g (R$ 39,90)</option>
                                    <option value="42.90">300g a 500g (R$ 42,90)</option>
                                    <option value="44.90">500g a 1kg (R$ 44,90)</option>
                                    <option value="46.90">1kg a 2kg (R$ 46,90)</option>
                                    <option value="49.90">2kg a 3kg (R$ 49,90)</option>
                                    <option value="53.90">3kg a 4kg (R$ 53,90)</option>
                                    <option value="56.90">4kg a 5kg (R$ 56,90)</option>
                                    <option value="88.90">5kg a 9kg (R$ 88,90)</option>
                                </optgroup>
                                <optgroup label="Produtos R$ 79 a R$ 99,99">
                                    <option value="11.97">Até 300g (R$ 11,97)</option>
                                    <option value="12.87">300g a 500g (R$ 12,87)</option>
                                    <option value="13.47">500g a 1kg (R$ 13,47)</option>
                                    <option value="14.07">1kg a 2kg (R$ 14,07)</option>
                                    <option value="14.97">2kg a 3kg (R$ 14,97)</option>
                                    <option value="16.17">3kg a 4kg (R$ 16,17)</option>
                                    <option value="17.07">4kg a 5kg (R$ 17,07)</option>
                                    <option value="26.67">5kg a 9kg (R$ 26,67)</option>
                                </optgroup>
                                <optgroup label="Produtos R$ 100 a R$ 119,99">
                                    <option value="13.97">Até 300g (R$ 13,97)</option>
                                    <option value="15.02">300g a 500g (R$ 15,02)</option>
                                    <option value="15.72">500g a 1kg (R$ 15,72)</option>
                                    <option value="16.42">1kg a 2kg (R$ 16,42)</option>
                                    <option value="17.47">2kg a 3kg (R$ 17,47)</option>
                                    <option value="18.87">3kg a 4kg (R$ 18,87)</option>
                                    <option value="19.92">4kg a 5kg (R$ 19,92)</option>
                                </optgroup>
                                <optgroup label="Produtos R$ 120 a R$ 149,99">
                                    <option value="15.96">Até 300g (R$ 15,96)</option>
                                    <option value="17.16">300g a 500g (R$ 17,16)</option>
                                    <option value="17.96">500g a 1kg (R$ 17,96)</option>
                                    <option value="18.76">1kg a 2kg (R$ 18,76)</option>
                                    <option value="19.96">2kg a 3kg (R$ 19,96)</option>
                                </optgroup>
                                <optgroup label="Produtos R$ 150 a R$ 199,99">
                                    <option value="17.96">Até 300g (R$ 17,96)</option>
                                    <option value="19.31">300g a 500g (R$ 19,31)</option>
                                    <option value="20.21">500g a 1kg (R$ 20,21)</option>
                                    <option value="21.11">1kg a 2kg (R$ 21,11)</option>
                                    <option value="22.46">2kg a 3kg (R$ 22,46)</option>
                                </optgroup>
                                <optgroup label="Produtos > R$ 200">
                                    <option value="19.95">Até 300g (R$ 19,95)</option>
                                    <option value="21.45">300g a 500g (R$ 21,45)</option>
                                    <option value="22.45">500g a 1kg (R$ 22,45)</option>
                                    <option value="23.45">1kg a 2kg (R$ 23,45)</option>
                                    <option value="24.95">2kg a 3kg (R$ 24,95)</option>
                                </optgroup>
                                <optgroup label="Frete Grátis (R$ 19 a R$ 78,99)">
                                    <option value="0">Frete Grátis - ML paga (R$ 0,00)</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>

                        <!-- Custos Extras Dinâmicos -->
                        <div class="input-group">
                            <div class="label-container">
                                <label>CUSTOS EXTRAS</label>
                                <span class="help-icon" title="Adicione valores que considerar importante para a precificação do anúncio clicando no +. Selecione entre R$ e %.">?</span>
                                <button type="button" class="add-custo-extra-btn" data-target="ML">+</button>
                            </div>
                            <div id="custosExtrasContainerML">
                                <!-- Campos de custo extra serão adicionados aqui via JavaScript -->
                            </div>
                        </div>
                    </div>

                    <!-- Seção de Resultados -->
                    <div class="results-section">
                        <!-- Resultados Principais -->
                        <div class="main-results">
                            <div class="result-item">
                                <span class="result-label">Preço de Venda</span>
                                <span class="result-value primary" id="precoVendaML">R$ 5,00</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Lucro por Venda</span>
                                <span class="result-value primary" id="lucroPorVendaML">R$ 0,00</span>
                            </div>
                        </div>

                        <!-- Grid de Resultados Secundários -->
                        <div class="secondary-results">
                            <div class="result-box">
                                <span class="result-label">Taxa do ML</span>
                                <span class="result-value" id="taxaMercadoLivre">R$5,00</span>
                            </div>

                            <div class="result-box">
                                <span class="result-label">Valor dos Impostos</span>
                                <span class="result-value" id="valorImpostosML">R$0,00</span>
                            </div>
                            <div class="result-box">
                                <span class="result-label">Custo Total do Produto</span>
                                <span class="result-value" id="custoTotalML">R$0,00</span>
                            </div>
                            <div class="result-box">
                                <span class="result-label">Retorno sobre Produto</span>
                                <span class="result-value" id="retornoProdutoML">0%</span>
                            </div>
                            <div class="result-box">
                                <span class="result-label">Markup %</span>
                                <span class="result-value" id="markupPercentML">0%</span>
                            </div>
                            <div class="result-box">
                                <span class="result-label">Markup X</span>
                                <span class="result-value" id="markupXML">0X</span>
                            </div>
                        </div>

                        <!-- Margem de Lucro -->
                        <div class="margin-section">
                            <h3>MARGEM DE LUCRO</h3>
                            <div class="margin-slider-container">
                                <input type="range" id="margemLucroML" min="0" max="70" value="0" class="margin-slider" step="0.5">
                                <span class="margin-value" id="margemValueML">0%</span>
                            </div>
                        </div>
                        <button type="button" id="limparCamposBtnML" class="limpar-campos-btn">Limpar Campos</button>
                    </div>
                </div>
            </div>

            <!-- Conteúdo da Aba Shein -->
            <div class="tab-content" id="shein-tab">
                <div class="coming-soon-container">
                    <div class="coming-soon-content">
                        <i class="fas fa-tools"></i>
                        <h2>Calculadora Shein</h2>
                        <p>Esta funcionalidade está em desenvolvimento e estará disponível em breve!</p>
                        <div class="features-preview">
                            <h3>O que você pode esperar:</h3>
                            <ul>
                                <li>Cálculo específico para taxas da Shein</li>
                                <li>Consideração de impostos de importação</li>
                                <li>Análise de margem para produtos internacionais</li>
                                <li>Interface otimizada para dropshipping</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Páginas "Em breve"
function getGerenciarContent() {
    return `
        <div class="coming-soon-page">
            <div class="coming-soon-content">
                <i class="fas fa-list-check"></i>
                <h1>Gerenciar Anúncios</h1>
                <p>Esta funcionalidade está em desenvolvimento e estará disponível em breve!</p>
                <div class="features-preview">
                    <h3>O que você pode esperar:</h3>
                    <ul>
                        <li>Visualização de todos os seus anúncios em um só lugar</li>
                        <li>Edição rápida de preços e descrições</li>
                        <li>Análise de performance por anúncio</li>
                        <li>Sincronização com múltiplas plataformas</li>
                        <li>Relatórios detalhados de vendas</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function getFechamentoContent() {
    return `
        <div class="coming-soon-page">
            <div class="coming-soon-content">
                <i class="fas fa-calendar-check"></i>
                <h1>Fechamento de Mês</h1>
                <p>Esta funcionalidade está em desenvolvimento e estará disponível em breve!</p>
                <div class="features-preview">
                    <h3>O que você pode esperar:</h3>
                    <ul>
                        <li>Relatórios mensais automatizados</li>
                        <li>Análise de lucros e despesas</li>
                        <li>Gráficos de performance</li>
                        <li>Comparativo entre meses</li>
                        <li>Exportação para Excel/PDF</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function getPesquisaContent() {
    return `
        <div class="market-research-page">
            <!-- Header da Pesquisa de Mercado -->
            <div class="market-research-header">
                <h1>
                    <i class="fas fa-search icon"></i>
                    Pesquisa de Mercado
                </h1>
                <p>Descubra tendências, analise a concorrência e encontre oportunidades de negócio com nossa ferramenta de inteligência de mercado.</p>
            </div>

            <!-- Container de Pesquisa -->
            <div class="market-search-container">
                <form class="search-form" onsubmit="return false;">
                    <div class="search-input-group">
                        <label for="marketSearchInput">Digite o produto ou termo que deseja analisar:</label>
                        <div class="search-input-wrapper">
                            <input 
                                type="text" 
                                id="marketSearchInput" 
                                placeholder="Ex: Blusa cacharrel manga longa feminina"
                                maxlength="100"
                                autocomplete="off"
                            >
                            <i class="fas fa-search search-input-icon"></i>
                            <button type="button" id="clearSearchButton" title="Limpar">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="search-button-group">
                        <button type="button" id="marketSearchButton">
                            <i class="fas fa-search"></i>
                            Analisar
                        </button>
                    </div>
                </form>
                
                <!-- Indicador de Loading -->
                <div id="searchLoadingIndicator">
                    <div class="loading-spinner"></div>
                    Analisando dados de mercado...
                </div>
            </div>

            <!-- Seção de Recursos -->
            <div class="features-section">
                <h2>O que nossa análise inclui:</h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <h3>Análise de Preços</h3>
                        <p>Preços médios, mínimos e máximos da concorrência, com sugestão de precificação otimizada para seu produto.</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-trending-up"></i>
                        </div>
                        <h3>Tendências de Mercado</h3>
                        <p>Dados do Google Trends e análise de sazonalidade para identificar os melhores momentos para vender.</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-bullseye"></i>
                        </div>
                        <h3>Índice de Demanda</h3>
                        <p>Medição da demanda atual do produto baseada em múltiplas fontes de dados e comportamento do consumidor.</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <h3>Insights Inteligentes</h3>
                        <p>Recomendações personalizadas geradas por IA para otimizar sua estratégia de vendas e marketing.</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <h3>Análise Geográfica</h3>
                        <p>Dados demográficos e climáticos que podem influenciar a demanda do seu produto por região.</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <h3>Dados em Tempo Real</h3>
                        <p>Informações atualizadas dos principais marketplaces e fontes de dados do mercado brasileiro.</p>
                    </div>
                </div>
            </div>

            <!-- Seção de Histórico (será mostrada dinamicamente) -->
            <div class="history-section" id="searchHistorySection">
                <h2>
                    <i class="fas fa-history"></i>
                    Pesquisas Recentes
                </h2>
                <div class="history-list" id="searchHistoryList">
                    <!-- Histórico será inserido dinamicamente -->
                </div>
            </div>
        </div>
    `;
}

function getConexoesContent() {
    return `
        <div class="coming-soon-page">
            <div class="coming-soon-content">
                <i class="fas fa-plug"></i>
                <h1>Conexões</h1>
                <p>Esta funcionalidade está em desenvolvimento e estará disponível em breve!</p>
                <div class="features-preview">
                    <h3>O que você pode esperar:</h3>
                    <ul>
                        <li>Integração com APIs do Mercado Livre</li>
                        <li>Conexão com Shopee Seller Center</li>
                        <li>Sincronização automática de produtos</li>
                        <li>Atualização de preços em massa</li>
                        <li>Gestão centralizada de inventário</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Configurações da Shopee
const SHOPEE_CONFIG = {
    taxaComissaoPadrao: 0.14, // 14%
    taxaComissaoFreteGratis: 0.20, // 20%
    taxaTransacao: 0.00, // 0%
    taxaFixaPorItem: 4.00, // R$4,00 por item vendido
};

// Multiplicadores
let multiplicadorCustoShopee = 1;
let multiplicadorCustoML = 1;

// Função para reinicializar os event listeners da calculadora
function initCalculatorEvents() {
    // Sistema de abas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('disabled')) return;

            const targetTab = button.getAttribute('data-tab');

            // Remove active de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Adiciona active ao botão clicado e seu conteúdo correspondente
            button.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });

    // Inicializar calculadoras
    initializeShopeeCalculator();
    initializeMercadoLivreCalculator();
}

// ===== CALCULADORA SHOPEE =====
function initializeShopeeCalculator() {
    const elements = {
        freteGratis: document.getElementById("freteGratis"),
        custoProduto: document.getElementById("custoProduto"),
        impostos: document.getElementById("impostos"),
        despesasVariaveis: document.getElementById("despesasVariaveis"),
        margemLucro: document.getElementById("margemLucro"),
        custosExtrasContainer: document.getElementById("custosExtrasContainer"),
        addCustoExtraBtn: document.querySelector(".add-custo-extra-btn:not([data-target])"),
        limparCamposBtn: document.getElementById("limparCamposBtn"),

        // Resultados
        precoVenda: document.getElementById("precoVenda"),
        lucroPorVenda: document.getElementById("lucroPorVenda"),
        taxaShopee: document.getElementById("taxaShopee"),
        valorImpostos: document.getElementById("valorImpostos"),
        custoTotal: document.getElementById("custoTotal"),
        retornoProduto: document.getElementById("retornoProduto"),
        markupPercent: document.getElementById("markupPercent"),
        markupX: document.getElementById("markupX"),
        margemValue: document.getElementById("margemValue")
    };

    // Event Listeners
    if (elements.margemLucro) {
        elements.margemLucro.addEventListener("input", function() {
            atualizarMargemValue(elements.margemValue, this.value);
            atualizarCorMargem(this, this.value);
            calcularPrecoVendaShopee();
        });
    }

    // Botões do multiplicador
    const arrowUp = document.querySelector(".arrow-up:not([data-target])");
    const arrowDown = document.querySelector(".arrow-down:not([data-target])");

    if (arrowUp) {
        arrowUp.addEventListener("click", () => {
            multiplicadorCustoShopee = Math.max(1, multiplicadorCustoShopee + 1);
            const multiplierEl = document.querySelector(".multiplier:not([id])");
            if (multiplierEl) multiplierEl.textContent = `${multiplicadorCustoShopee}x`;
            calcularPrecoVendaShopee();
        });
    }

    if (arrowDown) {
        arrowDown.addEventListener("click", () => {
            multiplicadorCustoShopee = Math.max(1, multiplicadorCustoShopee - 1);
            const multiplierEl = document.querySelector(".multiplier:not([id])");
            if (multiplierEl) multiplierEl.textContent = `${multiplicadorCustoShopee}x`;
            calcularPrecoVendaShopee();
        });
    }

    // Validação de inputs numéricos
    [elements.custoProduto, elements.despesasVariaveis].forEach(element => {
        if (element) {
            element.addEventListener("input", function() {
                validarEntradaNumerica(this);
                calcularPrecoVendaShopee();
            });

            element.addEventListener("blur", function() {
                formatarCampo(this);
                calcularPrecoVendaShopee();
            });
        }
    });

    // Validação especial para impostos
    if (elements.impostos) {
        elements.impostos.addEventListener("input", function() {
            validarEntradaNumerica(this);
            calcularPrecoVendaShopee();
        });

        elements.impostos.addEventListener("blur", function() {
            let valorString = this.value.replace(",", ".");
            let valor = parseFloat(valorString);

            if (isNaN(valor) || valor < 0) {
                this.value = "0,00";
            } else if (valor > 100) {
                this.value = "100,00";
            } else {
                this.value = valor.toFixed(2).replace(".", ",");
            }
            calcularPrecoVendaShopee();
        });
    }

    // Toggle frete grátis
    if (elements.freteGratis) {
        elements.freteGratis.addEventListener("change", calcularPrecoVendaShopee);
    }

    // Botão adicionar custo extra
    if (elements.addCustoExtraBtn) {
        elements.addCustoExtraBtn.addEventListener("click", () => adicionarCustoExtra("Shopee"));
    }

    // Botão limpar campos
    if (elements.limparCamposBtn) {
        elements.limparCamposBtn.addEventListener("click", resetarCalculadoraShopee);
    }

    // Cálculo inicial
    atualizarMargemValue(elements.margemValue, 0);
    calcularPrecoVendaShopee();
}

function calcularPrecoVendaShopee() {
    const custoProdutoValue = document.getElementById("custoProduto")?.value || "0";
    const custoProdutoBase = parseFloat(custoProdutoValue.replace(",", ".")) || 0;
    const custoProduto = custoProdutoBase * multiplicadorCustoShopee;

    const impostosValue = document.getElementById("impostos")?.value || "0";
    const impostosPercent = parseFloat(impostosValue.replace(",", ".")) || 0;

    const despesasValue = document.getElementById("despesasVariaveis")?.value || "0";
    const despesasVariaveis = parseFloat(despesasValue.replace(",", ".")) || 0;

    const margemDesejada = parseFloat(document.getElementById("margemLucro")?.value) || 0;
    const freteGratis = document.getElementById("freteGratis")?.checked || false;

    // Determinar taxa da Shopee baseada no programa de frete grátis
    const taxaShopee = freteGratis ? SHOPEE_CONFIG.taxaComissaoFreteGratis : SHOPEE_CONFIG.taxaComissaoPadrao;

    // Separar custos extras em valores reais e percentuais
    let custosExtrasReais = 0;
    let custosExtrasPercentuais = 0;

    document.querySelectorAll("#custosExtrasContainer .custo-extra-item").forEach(item => {
        const valueInput = item.querySelector(".custo-extra-value");
        const typeSelector = item.querySelector(".custo-extra-type-selector");

        const valor = parseFloat(valueInput.value.replace(",", ".")) || 0;
        const tipo = typeSelector.value;

        if (tipo === "real") {
            custosExtrasReais += valor;
        } else if (tipo === "percent") {
            custosExtrasPercentuais += (valor / 100);
        }
    });

    const custoTotalProduto = custoProduto + custosExtrasReais;

    const denominador = (1 - taxaShopee - (margemDesejada / 100) - (impostosPercent / 100) - custosExtrasPercentuais);
    let precoVenda = 0;
    if (denominador > 0) {
        precoVenda = (custoTotalProduto + despesasVariaveis + SHOPEE_CONFIG.taxaFixaPorItem) / denominador;
    }

    const valorImpostos = precoVenda * (impostosPercent / 100);
    const valorCustosExtrasPercentuais = precoVenda * custosExtrasPercentuais;
    const taxaShopeeValor = precoVenda * taxaShopee + SHOPEE_CONFIG.taxaFixaPorItem;

    const lucroLiquido = precoVenda - custoTotalProduto - despesasVariaveis - taxaShopeeValor - valorImpostos - valorCustosExtrasPercentuais;

    const retornoProduto = custoTotalProduto > 0 ? (lucroLiquido / custoTotalProduto) * 100 : 0;
    const markupPercent = custoTotalProduto > 0 ? ((precoVenda - custoTotalProduto) / custoTotalProduto) * 100 : 0;
    const markupX = custoTotalProduto > 0 ? precoVenda / custoTotalProduto : 0;

    // Atualizar interface
    atualizarResultadosShopee({
        precoVenda,
        lucroLiquido,
        taxaShopeeValor,
        valorImpostos,
        custoTotalProduto,
        retornoProduto,
        markupPercent,
        markupX
    });
}

function atualizarResultadosShopee(resultados) {
    const precoVendaEl = document.getElementById("precoVenda");
    const lucroPorVendaEl = document.getElementById("lucroPorVenda");
    const taxaShopeeEl = document.getElementById("taxaShopee");
    const valorImpostosEl = document.getElementById("valorImpostos");
    const custoTotalEl = document.getElementById("custoTotal");
    const retornoProdutoEl = document.getElementById("retornoProduto");
    const markupPercentEl = document.getElementById("markupPercent");
    const markupXEl = document.getElementById("markupX");

    if (precoVendaEl) precoVendaEl.textContent = formatarReal(resultados.precoVenda);
    if (lucroPorVendaEl) lucroPorVendaEl.textContent = formatarReal(resultados.lucroLiquido);
    if (taxaShopeeEl) taxaShopeeEl.textContent = formatarReal(resultados.taxaShopeeValor);
    if (valorImpostosEl) valorImpostosEl.textContent = formatarReal(resultados.valorImpostos);
    if (custoTotalEl) custoTotalEl.textContent = formatarReal(resultados.custoTotalProduto);
    if (retornoProdutoEl) retornoProdutoEl.textContent = formatarPercentual(resultados.retornoProduto);
    if (markupPercentEl) markupPercentEl.textContent = formatarPercentual(resultados.markupPercent);
    if (markupXEl) markupXEl.textContent = `${resultados.markupX.toFixed(2)}X`;

    // Atualizar cor do lucro
    if (lucroPorVendaEl) {
        if (resultados.lucroLiquido > 0) {
            lucroPorVendaEl.style.color = "#4CAF50";
        } else if (resultados.lucroLiquido < 0) {
            lucroPorVendaEl.style.color = "#f44336";
        } else {
            lucroPorVendaEl.style.color = "#ff6b35";
        }
    }
}

function resetarCalculadoraShopee() {
    const custoProdutoEl = document.getElementById("custoProduto");
    const impostosEl = document.getElementById("impostos");
    const despesasVariaveisEl = document.getElementById("despesasVariaveis");
    const margemLucroEl = document.getElementById("margemLucro");
    const freteGratisEl = document.getElementById("freteGratis");
    const margemValueEl = document.getElementById("margemValue");
    const custosExtrasContainerEl = document.getElementById("custosExtrasContainer");
    const multiplierEl = document.querySelector(".multiplier:not([id])");

    if (custoProdutoEl) custoProdutoEl.value = "";
    if (impostosEl) impostosEl.value = "";
    if (despesasVariaveisEl) despesasVariaveisEl.value = "";
    if (margemLucroEl) margemLucroEl.value = 0;
    if (freteGratisEl) freteGratisEl.checked = true;
    if (custosExtrasContainerEl) custosExtrasContainerEl.innerHTML = '';
    if (multiplierEl) multiplierEl.textContent = "1x";

    multiplicadorCustoShopee = 1;

    atualizarMargemValue(margemValueEl, 0);
    calcularPrecoVendaShopee();
}

// ===== CALCULADORA MERCADO LIVRE =====
function initializeMercadoLivreCalculator() {
    const elements = {
        custoProduto: document.getElementById("custoProdutoML"),
        impostos: document.getElementById("impostosML"),
        despesasVariaveis: document.getElementById("despesasVariaveisML"),
        taxaMercadoLivreSelect: document.getElementById("taxaMercadoLivreSelect"),
        taxaFreteSelect: document.getElementById("taxaFreteSelect"),
        margemLucro: document.getElementById("margemLucroML"),
        custosExtrasContainer: document.getElementById("custosExtrasContainerML"),
        addCustoExtraBtn: document.querySelector(".add-custo-extra-btn[data-target='ML']"),
        limparCamposBtn: document.getElementById("limparCamposBtnML"),

        // Resultados
        precoVenda: document.getElementById("precoVendaML"),
        lucroPorVenda: document.getElementById("lucroPorVendaML"),
        taxaMercadoLivre: document.getElementById("taxaMercadoLivre"),
        valorImpostos: document.getElementById("valorImpostosML"),
        custoTotal: document.getElementById("custoTotalML"),
        retornoProduto: document.getElementById("retornoProdutoML"),
        markupPercent: document.getElementById("markupPercentML"),
        markupX: document.getElementById("markupXML"),
        margemValue: document.getElementById("margemValueML")
    };

    // Event Listeners
    if (elements.margemLucro) {
        elements.margemLucro.addEventListener("input", function() {
            atualizarMargemValue(elements.margemValue, this.value);
            atualizarCorMargem(this, this.value);
            calcularPrecoVendaML();
        });
    }

    // Botões do multiplicador
    const arrowUpML = document.querySelector(".arrow-up[data-target='ML']");
    const arrowDownML = document.querySelector(".arrow-down[data-target='ML']");

    if (arrowUpML) {
        arrowUpML.addEventListener("click", () => {
            multiplicadorCustoML = Math.max(1, multiplicadorCustoML + 1);
            const multiplierEl = document.getElementById("multiplierML");
            if (multiplierEl) multiplierEl.textContent = `${multiplicadorCustoML}x`;
            calcularPrecoVendaML();
        });
    }

    if (arrowDownML) {
        arrowDownML.addEventListener("click", () => {
            multiplicadorCustoML = Math.max(1, multiplicadorCustoML - 1);
            const multiplierEl = document.getElementById("multiplierML");
            if (multiplierEl) multiplierEl.textContent = `${multiplicadorCustoML}x`;
            calcularPrecoVendaML();
        });
    }

    // Validação de inputs numéricos
    [elements.custoProduto, elements.despesasVariaveis].forEach(element => {
        if (element) {
            element.addEventListener("input", function() {
                validarEntradaNumerica(this);
                calcularPrecoVendaML();
            });

            element.addEventListener("blur", function() {
                formatarCampo(this);
                calcularPrecoVendaML();
            });
        }
    });

    // Validação especial para impostos
    if (elements.impostos) {
        elements.impostos.addEventListener("input", function() {
            validarEntradaNumerica(this);
            calcularPrecoVendaML();
        });

        elements.impostos.addEventListener("blur", function() {
            let valorString = this.value.replace(",", ".");
            let valor = parseFloat(valorString);

            if (isNaN(valor) || valor < 0) {
                this.value = "0,00";
            } else if (valor > 100) {
                this.value = "100,00";
            } else {
                this.value = valor.toFixed(2).replace(".", ",");
            }
            calcularPrecoVendaML();
        });
    }

    // Selects
    if (elements.taxaMercadoLivreSelect) {
        elements.taxaMercadoLivreSelect.addEventListener("change", calcularPrecoVendaML);
    }

    if (elements.taxaFreteSelect) {
        elements.taxaFreteSelect.addEventListener("change", calcularPrecoVendaML);
    }

    // Botão adicionar custo extra
    if (elements.addCustoExtraBtn) {
        elements.addCustoExtraBtn.addEventListener("click", () => adicionarCustoExtra("ML"));
    }

    // Botão limpar campos
    if (elements.limparCamposBtn) {
        elements.limparCamposBtn.addEventListener("click", resetarCalculadoraML);
    }

    // Cálculo inicial
    atualizarMargemValue(elements.margemValue, 0);
    calcularPrecoVendaML();
}

function calcularPrecoVendaML() {
    const custoProdutoValue = document.getElementById("custoProdutoML")?.value || "0";
    const custoProdutoBase = parseFloat(custoProdutoValue.replace(",", ".")) || 0;
    const custoProduto = custoProdutoBase * multiplicadorCustoML;

    const impostosValue = document.getElementById("impostosML")?.value || "0";
    const impostosPercent = parseFloat(impostosValue.replace(",", ".")) || 0;

    const despesasValue = document.getElementById("despesasVariaveisML")?.value || "0";
    const despesasVariaveis = parseFloat(despesasValue.replace(",", ".")) || 0;

    const margemDesejada = parseFloat(document.getElementById("margemLucroML")?.value) || 0;

    // Obter taxa do Mercado Livre selecionada
    const taxaMLPercent = parseFloat(document.getElementById("taxaMercadoLivreSelect")?.value) || 12;
    const taxaML = taxaMLPercent / 100;

    // Obter taxa de frete selecionada
    const taxaFrete = parseFloat(document.getElementById("taxaFreteSelect")?.value) || 0;

    // Separar custos extras em valores reais e percentuais
    let custosExtrasReais = 0;
    let custosExtrasPercentuais = 0;

    document.querySelectorAll("#custosExtrasContainerML .custo-extra-item").forEach(item => {
        const valueInput = item.querySelector(".custo-extra-value");
        const typeSelector = item.querySelector(".custo-extra-type-selector");

        const valor = parseFloat(valueInput.value.replace(",", ".")) || 0;
        const tipo = typeSelector.value;

        if (tipo === "real") {
            custosExtrasReais += valor;
        } else if (tipo === "percent") {
            custosExtrasPercentuais += (valor / 100);
        }
    });

    const custoTotalProduto = custoProduto + custosExtrasReais;

    const denominador = (1 - taxaML - (margemDesejada / 100) - (impostosPercent / 100) - custosExtrasPercentuais);
    let precoVenda = 0;
    if (denominador > 0) {
        precoVenda = (custoTotalProduto + despesasVariaveis + taxaFrete) / denominador;
    }

    const valorImpostos = precoVenda * (impostosPercent / 100);
    const valorCustosExtrasPercentuais = precoVenda * custosExtrasPercentuais;
    const taxaMLValor = (precoVenda * taxaML) + taxaFrete;

    const lucroLiquido = precoVenda - custoTotalProduto - despesasVariaveis - taxaMLValor - valorImpostos - valorCustosExtrasPercentuais;

    const retornoProduto = custoTotalProduto > 0 ? (lucroLiquido / custoTotalProduto) * 100 : 0;
    const markupPercent = custoTotalProduto > 0 ? ((precoVenda - custoTotalProduto) / custoTotalProduto) * 100 : 0;
    const markupX = custoTotalProduto > 0 ? precoVenda / custoTotalProduto : 0;

    // Atualizar interface
    atualizarResultadosML({
        precoVenda,
        lucroLiquido,
        taxaMLValor,
        valorImpostos,
        custoTotalProduto,
        retornoProduto,
        markupPercent,

        markupX
    });
}

function atualizarResultadosML(resultados) {
    const precoVendaEl = document.getElementById("precoVendaML");
    const lucroPorVendaEl = document.getElementById("lucroPorVendaML");
    const taxaMercadoLivreEl = document.getElementById("taxaMercadoLivre");
    const valorImpostosEl = document.getElementById("valorImpostosML");
    const custoTotalEl = document.getElementById("custoTotalML");
    const retornoProdutoEl = document.getElementById("retornoProdutoML");
    const markupPercentEl = document.getElementById("markupPercentML");
    const markupXEl = document.getElementById("markupXML");


    if (precoVendaEl) precoVendaEl.textContent = formatarReal(resultados.precoVenda);
    if (lucroPorVendaEl) lucroPorVendaEl.textContent = formatarReal(resultados.lucroLiquido);
    if (taxaMercadoLivreEl) taxaMercadoLivreEl.textContent = formatarReal(resultados.taxaMLValor);
    if (valorImpostosEl) valorImpostosEl.textContent = formatarReal(resultados.valorImpostos);
    if (custoTotalEl) custoTotalEl.textContent = formatarReal(resultados.custoTotalProduto);
    if (retornoProdutoEl) retornoProdutoEl.textContent = formatarPercentual(resultados.retornoProduto);
    if (markupPercentEl) markupPercentEl.textContent = formatarPercentual(resultados.markupPercent);
    if (markupXEl) markupXEl.textContent = `${resultados.markupX.toFixed(2)}X`;


    // Atualizar cor do lucro
    if (lucroPorVendaEl) {
        if (resultados.lucroLiquido > 0) {
            lucroPorVendaEl.style.color = "#4CAF50";
        } else if (resultados.lucroLiquido < 0) {
            lucroPorVendaEl.style.color = "#f44336";
        } else {
            lucroPorVendaEl.style.color = "#ff6b35";
        }
    }
}

function resetarCalculadoraML() {
    const custoProdutoEl = document.getElementById("custoProdutoML");
    const impostosEl = document.getElementById("impostosML");
    const despesasVariaveisEl = document.getElementById("despesasVariaveisML");
    const margemLucroEl = document.getElementById("margemLucroML");
    const taxaMercadoLivreSelectEl = document.getElementById("taxaMercadoLivreSelect");
    const taxaFreteSelectEl = document.getElementById("taxaFreteSelect");
    const margemValueEl = document.getElementById("margemValueML");
    const custosExtrasContainerEl = document.getElementById("custosExtrasContainerML");
    const multiplierEl = document.getElementById("multiplierML");

    if (custoProdutoEl) custoProdutoEl.value = "";
    if (impostosEl) impostosEl.value = "";
    if (despesasVariaveisEl) despesasVariaveisEl.value = "";
    if (margemLucroEl) margemLucroEl.value = 0;
    if (taxaMercadoLivreSelectEl) taxaMercadoLivreSelectEl.selectedIndex = 0;
    if (taxaFreteSelectEl) taxaFreteSelectEl.selectedIndex = 0;
    if (custosExtrasContainerEl) custosExtrasContainerEl.innerHTML = '';
    if (multiplierEl) multiplierEl.textContent = "1x";

    multiplicadorCustoML = 1;

    atualizarMargemValue(margemValueEl, 0);
    calcularPrecoVendaML();
}

// ===== FUNÇÕES AUXILIARES =====
function formatarReal(valor) {
    return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function formatarPercentual(valor) {
    return `${valor.toFixed(2).replace(".", ",")}%`;
}

function atualizarMargemValue(element, valor) {
    if (element) {
        element.textContent = `${valor}%`;
    }
}

function atualizarCorMargem(slider, valor) {
    if (!slider) return;

    const percentage = (valor - slider.min) / (slider.max - slider.min) * 100;
    let cor = '#ddd'; // cor padrão

    // Definir cor baseada nas faixas especificadas pelo usuário
    if (valor >= 0 && valor <= 5) {
        cor = '#ff0000'; // vermelho
    } else if (valor >= 5.5 && valor <= 7) {
        cor = '#ff8c00'; // laranja escuro
    } else if (valor >= 7.5 && valor <= 12) {
        cor = '#ffa500'; // laranja claro
    } else if (valor >= 12.5 && valor <= 17) {
        cor = '#ffff00'; // amarelo
    } else if (valor >= 17.5 && valor <= 25.5) {
        cor = '#32cd32'; // verde lima
    } else if (valor >= 26 && valor <= 35) {
        cor = '#90ee90'; // verde claro
    } else if (valor >= 35.5 && valor <= 40) {
        cor = '#00ffff'; // ciano
    } else if (valor >= 40.5 && valor <= 51) {
        cor = '#87ceeb'; // azul claro
    } else if (valor >= 51.5 && valor <= 70) {
        cor = '#0000cd'; // azul escuro
    }

    // Aplicar o gradiente com a cor determinada
    slider.style.background = `linear-gradient(to right, ${cor} 0%, ${cor} ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;

    // Atualizar também as variáveis CSS customizadas para o thumb
    slider.style.setProperty('--track-color', cor);
    slider.style.setProperty('--track-fill', `${percentage}%`);
}

function validarEntradaNumerica(input) {
    let valor = input.value;

    // Remove caracteres não numéricos exceto vírgula e ponto
    valor = valor.replace(/[^0-9.,]/g, '');

    // Substitui múltiplas vírgulas/pontos por apenas um
    valor = valor.replace(/[.,]+/g, ',');

    // Garante que só há uma vírgula
    const partes = valor.split(',');
    if (partes.length > 2) {
        valor = partes[0] + ',' + partes.slice(1).join('');
    }

    // Limita casas decimais a 2
    if (partes.length === 2 && partes[1].length > 2) {
        valor = partes[0] + ',' + partes[1].substring(0, 2);
    }

    input.value = valor;
}

function formatarCampo(input) {
    let valor = parseFloat(input.value.replace(",", ".")) || 0;
    input.value = valor.toFixed(2).replace(".", ",");
}

function adicionarCustoExtra(target) {
    const id = `custoExtra-${Date.now()}`;
    const custoExtraWrapper = document.createElement("div");
    custoExtraWrapper.classList.add("custo-extra-wrapper");
    custoExtraWrapper.dataset.id = id;
    custoExtraWrapper.innerHTML = `
        <div class="custo-extra-item">
            <select class="custo-extra-type-selector">
                <option value="real">R$</option>
                <option value="percent">%</option>
            </select>
            <input type="text" class="custo-extra-value" placeholder="0,00">
        </div>
        <button type="button" class="remove-custo-extra-btn">X</button>
    `;

    const container = target === "ML" ? 
        document.getElementById("custosExtrasContainerML") : 
        document.getElementById("custosExtrasContainer");

    container.appendChild(custoExtraWrapper);

    // Adicionar listeners para o novo campo
    const inputElement = custoExtraWrapper.querySelector(".custo-extra-value");
    const typeSelector = custoExtraWrapper.querySelector(".custo-extra-type-selector");
    const removeButton = custoExtraWrapper.querySelector(".remove-custo-extra-btn");

    inputElement.addEventListener("input", function() {
        validarEntradaNumerica(this);
        if (target === "ML") {
            calcularPrecoVendaML();
        } else {
            calcularPrecoVendaShopee();
        }
    });

    inputElement.addEventListener("blur", function() {
        formatarCampo(this);
        if (target === "ML") {
            calcularPrecoVendaML();
        } else {
            calcularPrecoVendaShopee();
        }
    });

    typeSelector.addEventListener("change", function() {
        if (target === "ML") {
            calcularPrecoVendaML();
        } else {
            calcularPrecoVendaShopee();
        }
    });

    removeButton.addEventListener("click", function() {
        custoExtraWrapper.remove();
        if (target === "ML") {
            calcularPrecoVendaML();
        } else {
            calcularPrecoVendaShopee();
        }
    });
}


// Função para gerar o conteúdo da página de planos
function getPlanosContent() {
    return `
        <div class="page-container">
            <div class="page-header">
                <h1><i class="fas fa-crown"></i> Planos e Preços</h1>
                <p>Escolha o plano ideal para o seu negócio</p>
            </div>

            <div class="plans-page-container">
                <div class="plans-grid-page">
                    <div class="plan-card-page">
                        <div class="plan-header">
                            <div class="plan-name">Gratuito</div>
                            <div class="plan-price">R$ 0</div>
                            <div class="plan-period">3 dias de teste</div>
                        </div>
                        <div class="plan-features">
                            <h4>O que está incluído:</h4>
                            <ul>
                                <li><i class="fas fa-check"></i> Calculadora básica</li>
                                <li><i class="fas fa-check"></i> 100 cálculos por mês</li>
                                <li><i class="fas fa-check"></i> Suporte por email</li>
                                <li><i class="fas fa-times" style="color: #dc3545;"></i> Todas as ferramentas</li>
                                <li><i class="fas fa-times" style="color: #dc3545;"></i> Precificação ilimitada</li>
                            </ul>
                        </div>
                        <button class="plan-btn-page" data-plan="free">Começar Teste</button>
                    </div>

                    <div class="plan-card-page popular">
                        <div class="plan-badge-popular">Mais Popular</div>
                        <div class="plan-header">
                            <div class="plan-name">Mensal</div>
                            <div class="plan-price">R$ 27,90</div>
                            <div class="plan-period">por mês</div>
                        </div>
                        <div class="plan-features">
                            <h4>O que está incluído:</h4>
                            <ul>
                                <li><i class="fas fa-check"></i> Todas as ferramentas liberadas</li>
                                <li><i class="fas fa-check"></i> Precificação ilimitada</li>
                                <li><i class="fas fa-check"></i> Calculadoras avançadas</li>
                                <li><i class="fas fa-check"></i> Relatórios detalhados</li>
                                <li><i class="fas fa-check"></i> Suporte prioritário</li>
                            </ul>
                        </div>
                        <button class="plan-btn-page primary" data-plan="monthly">Escolher Mensal</button>
                    </div>

                    <div class="plan-card-page">
                        <div class="plan-header">
                            <div class="plan-name">Trimestral</div>
                            <div class="plan-price">R$ 72,00</div>
                            <div class="plan-period">por trimestre</div>
                            <div class="plan-savings">Economize R$ 11,70</div>
                        </div>
                        <div class="plan-features">
                            <h4>O que está incluído:</h4>
                            <ul>
                                <li><i class="fas fa-check"></i> Todas as ferramentas liberadas</li>
                                <li><i class="fas fa-check"></i> Precificação ilimitada</li>
                                <li><i class="fas fa-check"></i> Calculadoras avançadas</li>
                                <li><i class="fas fa-check"></i> Relatórios detalhados</li>
                                <li><i class="fas fa-check"></i> Suporte prioritário</li>
                            </ul>
                        </div>
                        <button class="plan-btn-page primary" data-plan="quarterly">Escolher Trimestral</button>
                    </div>

                    <div class="plan-card-page best-value">
                        <div class="plan-badge-best">Melhor Custo-Benefício</div>
                        <div class="plan-header">
                            <div class="plan-name">Anual</div>
                            <div class="plan-price">R$ 229,00</div>
                            <div class="plan-period">por ano</div>
                            <div class="plan-savings">Economize R$ 105,80</div>
                        </div>
                        <div class="plan-features">
                            <h4>O que está incluído:</h4>
                            <ul>
                                <li><i class="fas fa-check"></i> Todas as ferramentas liberadas</li>
                                <li><i class="fas fa-check"></i> Precificação ilimitada</li>
                                <li><i class="fas fa-check"></i> Calculadoras avançadas</li>
                                <li><i class="fas fa-check"></i> Relatórios detalhados</li>
                                <li><i class="fas fa-check"></i> Suporte prioritário</li>
                                <li><i class="fas fa-star" style="color: #ffd700;"></i> Acesso antecipado a novas funcionalidades</li>
                            </ul>
                        </div>
                        <button class="plan-btn-page primary" data-plan="yearly">Escolher Anual</button>
                    </div>
                </div>

                <div class="plans-benefits">
                    <h2>Por que escolher o Lucre Certo?</h2>
                    <div class="benefits-grid">
                        <div class="benefit-item">
                            <i class="fas fa-calculator"></i>
                            <h3>Cálculos Precisos</h3>
                            <p>Algoritmos avançados para cálculos de precificação precisos em todas as plataformas</p>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-chart-line"></i>
                            <h3>Relatórios Detalhados</h3>
                            <p>Análises completas de margem de lucro e performance de vendas</p>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-headset"></i>
                            <h3>Suporte Especializado</h3>
                            <p>Equipe dedicada para ajudar você a maximizar seus resultados</p>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-sync-alt"></i>
                            <h3>Atualizações Constantes</h3>
                            <p>Novas funcionalidades e melhorias adicionadas regularmente</p>
                        </div>
                    </div>
                </div>

                <div class="faq-plans">
                    <h2>Perguntas Frequentes</h2>
                    <div class="faq-item-plans">
                        <div class="faq-question-plans" onclick="toggleFaqPlans(this)">
                            <h3>Posso cancelar minha assinatura a qualquer momento?</h3>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer-plans">
                            <p>Sim, você pode cancelar sua assinatura a qualquer momento. Não há taxas de cancelamento e você continuará tendo acesso até o final do período pago.</p>
                        </div>
                    </div>
                    
                    <div class="faq-item-plans">
                        <div class="faq-question-plans" onclick="toggleFaqPlans(this)">
                            <h3>Como funciona o período de teste gratuito?</h3>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer-plans">
                            <p>O período de teste de 3 dias é totalmente gratuito e não requer cartão de crédito. Você terá acesso limitado às funcionalidades básicas para avaliar a plataforma.</p>
                        </div>
                    </div>
                    
                    <div class="faq-item-plans">
                        <div class="faq-question-plans" onclick="toggleFaqPlans(this)">
                            <h3>Quais formas de pagamento são aceitas?</h3>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer-plans">
                            <p>Aceitamos cartões de crédito (Visa, Mastercard, Elo), PIX e boleto bancário. Todos os pagamentos são processados de forma segura.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Função para alternar FAQ dos planos
function toggleFaqPlans(element) {
    const faqItem = element.parentElement;
    const answer = faqItem.querySelector('.faq-answer-plans');
    const icon = element.querySelector('i');

    faqItem.classList.toggle('active');

    if (faqItem.classList.contains('active')) {
        answer.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
    } else {
        answer.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}

// Função para selecionar um plano na página (atualizada)
function selectPlanPage(planType, price) {
    // Mapear os tipos de plano para os IDs corretos
    const planMapping = {
        'mensal': 'monthly',
        'trimestral': 'quarterly', 
        'anual': 'yearly'
    };

    const planId = planMapping[planType];
    if (planId && typeof selectPlan === 'function') {
        selectPlan(planId);
    } else {
        // Fallback para o comportamento anterior se a função não estiver disponível
        alert(`Você selecionou o plano ${planType.toUpperCase()}!\n\nPreço: R$ ${price.toFixed(2)}\n\nRedirecionando para o pagamento...\n\nEm breve você terá acesso a:\n• Todas as ferramentas liberadas\n• Precificação ilimitada\n• Suporte prioritário`);
    }
}


// Conteúdo da página DRE
function getDreContent() {
    return `
        <div class="dre-container">
            <div class="page-header">
                <h1><i class="fas fa-chart-line"></i> Demonstração do Resultado do Exercício (DRE)</h1>
                <p>Calcule e visualize o resultado financeiro da sua empresa de forma profissional</p>
            </div>

            <div class="dre-calculator-wrapper">
                <!-- Seção de Entrada de Dados -->
                <div class="dre-input-section">
                    <h2>Dados de Entrada</h2>
                    
                    <!-- Receitas -->
                    <div class="dre-section">
                        <h3><i class="fas fa-money-bill-wave"></i> Receitas</h3>
                        
                        <div class="input-group">
                            <label for="receitaBruta">Receita Operacional Bruta</label>
                            <div class="input-wrapper">
                                <span class="currency">R$</span>
                                <input type="text" id="receitaBruta" placeholder="0,00" class="dre-input">
                            </div>
                        </div>
                    </div>

                    <!-- Deduções -->
                    <div class="dre-section">
                        <h3><i class="fas fa-minus-circle"></i> Deduções da Receita Bruta</h3>
                        
                        <div class="input-group">
                            <label for="impostosSobreVendas">Impostos sobre Vendas (ICMS, PIS, COFINS)</label>
                            <div class="input-wrapper">
                                <span class="currency">R$</span>
                                <input type="text" id="impostosSobreVendas" placeholder="0,00" class="dre-input">
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label for="devolucoes">Devoluções e Abatimentos</label>
                            <div class="input-wrapper">
                                <span class="currency">R$</span>
                                <input type="text" id="devolucoes" placeholder="0,00" class="dre-input">
                            </div>
                        </div>
                    </div>

                    <!-- Custos -->
                    <div class="dre-section">
                        <h3><i class="fas fa-box"></i> Custos dos Produtos/Serviços</h3>
                        
                        <div class="input-group">
                            <label for="cmv">Custo da Mercadoria Vendida (CMV)</label>
                            <div class="input-wrapper">
                                <span class="currency">R$</span>
                                <input type="text" id="cmv" placeholder="0,00" class="dre-input">
                            </div>
                        </div>
                    </div>

                    <!-- Despesas Operacionais -->
                    <div class="dre-section">
                        <h3><i class="fas fa-cogs"></i> Despesas Operacionais</h3>
                        
                        <div class="input-group">
                            <label for="despesasAdministrativas">Despesas Administrativas</label>
                            <div class="input-wrapper">
                                <span class="currency">R$</span>
                                <input type="text" id="despesasAdministrativas" placeholder="0,00" class="dre-input">
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label for="despesasVendas">Despesas com Vendas</label>
                            <div class="input-wrapper">
                                <span class="currency">R$</span>
                                <input type="text" id="despesasVendas" placeholder="0,00" class="dre-input">
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label for="despesasFinanceiras">Despesas Financeiras</label>
                            <div class="input-wrapper">
                                <span class="currency">R$</span>
                                <input type="text" id="despesasFinanceiras" placeholder="0,00" class="dre-input">
                            </div>
                        </div>
                    </div>

                    <!-- Impostos sobre o Lucro -->
                    <div class="dre-section">
                        <h3><i class="fas fa-percentage"></i> Impostos sobre o Lucro</h3>
                        
                        <div class="input-group">
                            <label for="irpjCsll">IRPJ e CSLL</label>
                            <div class="input-wrapper">
                                <span class="currency">R$</span>
                                <input type="text" id="irpjCsll" placeholder="0,00" class="dre-input">
                            </div>
                        </div>
                    </div>

                    <div class="dre-actions">
                        <button type="button" id="calcularDre" class="btn-primary">
                            <i class="fas fa-calculator"></i> Calcular DRE
                        </button>
                        <button type="button" id="limparDre" class="btn-secondary">
                            <i class="fas fa-eraser"></i> Limpar Campos
                        </button>
                    </div>
                </div>

                <!-- Seção de Resultados -->
                <div class="dre-results-section">
                    <h2>Demonstração do Resultado</h2>
                    
                    <div class="dre-table">
                        <div class="dre-row">
                            <span class="dre-label">Receita Operacional Bruta</span>
                            <span class="dre-value" id="resultReceitaBruta">R$ 0,00</span>
                        </div>
                        
                        <div class="dre-row deduction">
                            <span class="dre-label">(-) Deduções da Receita Bruta</span>
                            <span class="dre-value" id="resultDeducoes">R$ 0,00</span>
                        </div>
                        
                        <div class="dre-row subtotal">
                            <span class="dre-label">(=) Receita Operacional Líquida</span>
                            <span class="dre-value" id="resultReceitaLiquida">R$ 0,00</span>
                        </div>
                        
                        <div class="dre-row deduction">
                            <span class="dre-label">(-) Custo da Mercadoria Vendida</span>
                            <span class="dre-value" id="resultCmv">R$ 0,00</span>
                        </div>
                        
                        <div class="dre-row subtotal">
                            <span class="dre-label">(=) Lucro Bruto</span>
                            <span class="dre-value" id="resultLucroBruto">R$ 0,00</span>
                        </div>
                        
                        <div class="dre-row deduction">
                            <span class="dre-label">(-) Despesas Operacionais</span>
                            <span class="dre-value" id="resultDespesasOperacionais">R$ 0,00</span>
                        </div>
                        
                        <div class="dre-row subtotal">
                            <span class="dre-label">(=) Resultado Operacional</span>
                            <span class="dre-value" id="resultOperacional">R$ 0,00</span>
                        </div>
                        
                        <div class="dre-row deduction">
                            <span class="dre-label">(-) IRPJ e CSLL</span>
                            <span class="dre-value" id="resultIrpjCsll">R$ 0,00</span>
                        </div>
                        
                        <div class="dre-row final-result">
                            <span class="dre-label">(=) Resultado Líquido do Exercício</span>
                            <span class="dre-value" id="resultLiquido">R$ 0,00</span>
                        </div>
                    </div>

                    <!-- Indicadores -->
                    <div class="dre-indicators">
                        <h3>Indicadores de Performance</h3>
                        <div class="indicators-grid">
                            <div class="indicator-card">
                                <span class="indicator-label">Margem Bruta</span>
                                <span class="indicator-value" id="margemBruta">0%</span>
                            </div>
                            <div class="indicator-card">
                                <span class="indicator-label">Margem Operacional</span>
                                <span class="indicator-value" id="margemOperacional">0%</span>
                            </div>
                            <div class="indicator-card">
                                <span class="indicator-label">Margem Líquida</span>
                                <span class="indicator-value" id="margemLiquida">0%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Área para Gráficos -->
                    <div class="dre-charts">
                        <h3>Análise Visual</h3>
                        <div class="charts-container">
                            <div class="chart-wrapper">
                                <h4>Composição das Despesas</h4>
                                <canvas id="despesasChart" width="400" height="300"></canvas>
                            </div>
                            <div class="chart-wrapper">
                                <h4>Estrutura da DRE</h4>
                                <canvas id="estruturaChart" width="400" height="300"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

