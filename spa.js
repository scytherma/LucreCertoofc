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
                break;
            case 'conexoes':
                pageContent = getConexoesContent();
                break;
            default:
                pageContent = getHomeContent();
        }
        
        contentContainer.innerHTML = pageContent;
        
        // Se for a página da calculadora, reinicializar os event listeners
        if (route === 'calculadora') {
            initCalculatorEvents();
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
        <div class="coming-soon-page">
            <div class="coming-soon-content">
                <i class="fas fa-search"></i>
                <h1>Pesquisa de Mercado</h1>
                <p>Esta funcionalidade está em desenvolvimento e estará disponível em breve!</p>
                <div class="features-preview">
                    <h3>O que você pode esperar:</h3>
                    <ul>
                        <li>Análise de preços da concorrência</li>
                        <li>Tendências de mercado em tempo real</li>
                        <li>Sugestões de produtos em alta</li>
                        <li>Monitoramento de palavras-chave</li>
                        <li>Alertas de oportunidades</li>
                    </ul>
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
    const taxaShopeeValor = (precoVenda * taxaShopee) + SHOPEE_CONFIG.taxaFixaPorItem;
    
    const lucroLiquido = precoVenda - custoTotalProduto - despesasVariaveis - taxaShopeeValor - valorImpostos - valorCustosExtrasPercentuais - SHOPEE_CONFIG.taxaFixaPorItem;
    
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
    if (d        precoVenda = (custoTotalProduto + despesasVariaveis) / denominador;   }

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
    let color = "#ddd"; // Cor padrão

    if (valor <= 5) {
        color = "#ff0000"; // Vermelho
    } else if (valor <= 7) {
        color = "#ff8c00"; // Laranja escuro
    } else if (valor <= 12) {
        color = "#ffa500"; // Laranja claro
    } else if (valor <= 17) {
        color = "#ffff00"; // Amarelo
    } else if (valor <= 25.5) {
        color = "#adff2f"; // Verde lima
    } else if (valor <= 35) {
        color = "#90ee90"; // Verde claro
    } else if (valor <= 40) {
        color = "#00ffff"; // Ciano
    } else if (valor <= 51) {
        color = "#87ceeb"; // Azul claro
    } else if (valor <= 70) {
        color = "#0000ff"; // Azul escuro
    }

    slider.style.setProperty("background", `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #ddd ${percentage}%, #ddd 100%)`, "important");
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

function adicionarCustoExtra(tipo) {
    const containerId = tipo === "ML" ? "custosExtrasContainerML" : "custosExtrasContainer";
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    const custoExtraId = `custo-extra-${Date.now()}`;
    
    const custoExtraHTML = `
        <div class="custo-extra-item" id="${custoExtraId}">
            <div class="input-wrapper">
                <select class="custo-extra-type-selector">
                    <option value="real">R$</option>
                    <option value="percent">%</option>
                </select>
                <input type="text" class="custo-extra-value" placeholder="0,00">
            </div>
            <button type="button" class="remove-custo-extra-btn" onclick="removerCustoExtra(\'${custoExtraId}\', \'${tipo}\')">×</button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', custoExtraHTML);
    
    // Adicionar event listeners para o novo campo
    const novoItem = document.getElementById(custoExtraId);
    const valueInput = novoItem.querySelector('.custo-extra-value');
    
    valueInput.addEventListener('input', function() {
        validarEntradaNumerica(this);
        if (tipo === "ML") {
            calcularPrecoVendaML();
        } else {
            calcularPrecoVendaShopee();
        }
    });
    
    valueInput.addEventListener('blur', function() {
        formatarCampo(this);
        if (tipo === "ML") {
            calcularPrecoVendaML();
        } else {
            calcularPrecoVendaShopee();
        }
    });
    
    const typeSelector = novoItem.querySelector('.custo-extra-type-selector');
    typeSelector.addEventListener('change', function() {
        if (tipo === "ML") {
            calcularPrecoVendaML();
        } else {
            calcularPrecoVendaShopee();
        }
    });
}

function removerCustoExtra(custoExtraId, tipo) {
    const elemento = document.getElementById(custoExtraId);
    if (elemento) {
        elemento.remove();
        if (tipo === "ML") {
            calcularPrecoVendaML();
        } else {
            calcularPrecoVendaShopee();
        }
    }
}




// Lógica para o botão de usuário e dropdown
document.addEventListener("DOMContentLoaded", () => {
    const userIconBtn = document.getElementById("userIconBtn");
    const userDropdownMenu = document.getElementById("userDropdownMenu");

    if (userIconBtn && userDropdownMenu) {
        userIconBtn.addEventListener("click", (event) => {
            event.stopPropagation(); // Impede que o clique se propague para o documento
            userDropdownMenu.classList.toggle("show");
        });

        // Fechar o dropdown se o usuário clicar fora dele
        document.addEventListener("click", (event) => {
            if (!userDropdownMenu.contains(event.target) && !userIconBtn.contains(event.target)) {
                userDropdownMenu.classList.remove("show");
            }
        });
    }
});

