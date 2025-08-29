// user-dropdown.js - Funcionalidade do dropdown do usuário

// ===== FUNCIONALIDADE DO DROPDOWN DO USUÁRIO =====
document.addEventListener('DOMContentLoaded', () => {
    initUserDropdown();
    initThemeToggle();
    initLogout();
});

function initUserDropdown() {
    const userIconBtn = document.getElementById('userIconBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');

    if (userIconBtn && userDropdownMenu) {
        // Toggle dropdown ao clicar no botão
        userIconBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdownMenu.classList.toggle('show');
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!userIconBtn.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                userDropdownMenu.classList.remove('show');
            }
        });

        // Adicionar event listeners para os itens do menu
        const dropdownItems = userDropdownMenu.querySelectorAll('.dropdown-item:not(.logout-btn):not(.theme-toggle-item)');
        
        if (dropdownItems[0]) {
            dropdownItems[0].addEventListener('click', (e) => {
                e.preventDefault();
                loadPageFromDropdown('configuracoes');
                userDropdownMenu.classList.remove('show');
            });
        }

        if (dropdownItems[1]) {
            dropdownItems[1].addEventListener('click', (e) => {
                e.preventDefault();
                loadPageFromDropdown('ajuda');
                userDropdownMenu.classList.remove('show');
            });
        }

        if (dropdownItems[2]) {
            dropdownItems[2].addEventListener('click', (e) => {
                e.preventDefault();
                loadPageFromDropdown('termos');
                userDropdownMenu.classList.remove('show');
            });
        }
    }
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        // Carregar tema salvo
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.checked = true;
        }

        // Event listener para mudança de tema
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
            }
        });
    }
}

function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                const { error } = await supabaseClient.auth.signOut();
                if (error) {
                    console.error('Erro ao fazer logout:', error);
                    alert('Erro ao fazer logout. Tente novamente.');
                } else {
                    // Limpar dados locais
                    localStorage.removeItem('theme');
                    // Redirecionar para login
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                alert('Erro ao fazer logout. Tente novamente.');
            }
        });
    }
}

// Função para carregar páginas a partir do dropdown
function loadPageFromDropdown(route) {
    const contentContainer = document.getElementById('content-container');
    if (contentContainer) {
        let pageContent = '';

        switch (route) {
            case 'configuracoes':
                pageContent = getConfiguracoesContent();
                break;
            case 'ajuda':
                pageContent = getAjudaContent();
                break;
            case 'termos':
                pageContent = getTermosContent();
                break;
            default:
                return;
        }

        contentContainer.innerHTML = pageContent;
        
        // Atualizar navegação
        const navLinks = document.querySelectorAll('.nav__item');
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Carregar configurações salvas se for a página de configurações
        if (route === 'configuracoes') {
            loadUserSettings();
        }
    }
}

// ===== CONTEÚDO DAS NOVAS PÁGINAS =====

function getConfiguracoesContent() {
    return `
        <div class="page-container">
            <div class="page-header">
                <h1><i class="fas fa-cog"></i> Configurações</h1>
                <p>Gerencie as configurações da sua conta</p>
            </div>

            <div class="settings-container">
                <div class="settings-section">
                    <h2>Informações da Conta</h2>
                    <div class="form-group">
                        <label for="userEmailSettings">E-mail</label>
                        <input type="email" id="userEmailSettings" class="form-input" readonly>
                    </div>
                    <div class="form-group">
                        <label for="userNameSettings">Nome de Usuário</label>
                        <input type="text" id="userNameSettings" class="form-input" placeholder="Digite seu nome">
                    </div>
                </div>

                <div class="settings-section">
                    <h2>Segurança</h2>
                    <div class="form-group">
                        <label for="currentPassword">Senha Atual</label>
                        <input type="password" id="currentPassword" class="form-input" placeholder="Digite sua senha atual">
                    </div>
                    <div class="form-group">
                        <label for="newPassword">Nova Senha</label>
                        <input type="password" id="newPassword" class="form-input" placeholder="Digite a nova senha">
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirmar Nova Senha</label>
                        <input type="password" id="confirmPassword" class="form-input" placeholder="Confirme a nova senha">
                    </div>
                    <button class="btn-primary" onclick="changePassword()">Alterar Senha</button>
                </div>

                <div class="settings-section">
                    <h2>Preferências</h2>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="emailNotifications">
                            <span class="checkmark"></span>
                            Receber notificações por e-mail
                        </label>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="autoSave">
                            <span class="checkmark"></span>
                            Salvar automaticamente os cálculos
                        </label>
                    </div>
                </div>

                <div class="settings-actions">
                    <button class="btn-primary" onclick="saveSettings()">Salvar Configurações</button>
                    <button class="btn-secondary" onclick="resetSettings()">Restaurar Padrões</button>
                </div>
            </div>
        </div>
    `;
}

function getAjudaContent() {
    return `
        <div class="page-container">
            <div class="page-header">
                <h1><i class="fas fa-question-circle"></i> Central de Ajuda</h1>
                <p>Encontre respostas para suas dúvidas</p>
            </div>

            <div class="help-container">
                <div class="search-section">
                    <div class="search-box">
                        <input type="text" placeholder="Pesquisar na ajuda..." class="search-input">
                        <button class="search-btn"><i class="fas fa-search"></i></button>
                    </div>
                </div>

                <div class="faq-section">
                    <h2>Perguntas Frequentes</h2>
                    
                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFaq(this)">
                            <h3>Como usar a calculadora de precificação?</h3>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <p>Para usar a calculadora de precificação:</p>
                            <ol>
                                <li>Acesse a aba "Calculadora" no menu lateral</li>
                                <li>Escolha entre Shopee ou Mercado Livre</li>
                                <li>Preencha o custo do produto</li>
                                <li>Adicione impostos e despesas variáveis</li>
                                <li>Ajuste a margem de lucro desejada</li>
                                <li>O preço de venda será calculado automaticamente</li>
                            </ol>
                        </div>
                    </div>

                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFaq(this)">
                            <h3>Como alterar o tema da interface?</h3>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <p>Para alterar o tema:</p>
                            <ol>
                                <li>Clique no ícone do usuário no canto superior direito</li>
                                <li>No menu dropdown, use o botão "Claro/Escuro"</li>
                                <li>O tema será alterado e salvo automaticamente</li>
                            </ol>
                        </div>
                    </div>

                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFaq(this)">
                            <h3>Como adicionar custos extras?</h3>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <p>Para adicionar custos extras:</p>
                            <ol>
                                <li>Na seção "Custos Extras", clique no botão "+"</li>
                                <li>Escolha entre valor em R$ ou porcentagem (%)</li>
                                <li>Digite o valor do custo extra</li>
                                <li>Para remover, clique no "X" ao lado do campo</li>
                            </ol>
                        </div>
                    </div>

                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFaq(this)">
                            <h3>Como funciona o multiplicador de produtos?</h3>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <p>O multiplicador permite calcular o custo de múltiplos produtos:</p>
                            <ol>
                                <li>Digite o custo unitário do produto</li>
                                <li>Use as setas ▲▼ para aumentar/diminuir a quantidade</li>
                                <li>O custo total será calculado automaticamente</li>
                                <li>Útil para produtos vendidos em kits ou pacotes</li>
                            </ol>
                        </div>
                    </div>
                </div>

                <div class="contact-section">
                    <h2>Precisa de mais ajuda?</h2>
                    <div class="contact-options">
                        <div class="contact-card">
                            <i class="fas fa-envelope"></i>
                            <h3>E-mail</h3>
                            <p>suporte@lucrecerto.com</p>
                            <span class="response-time">Resposta em até 24h</span>
                        </div>
                        <div class="contact-card">
                            <i class="fab fa-whatsapp"></i>
                            <h3>WhatsApp</h3>
                            <p>(11) 99999-9999</p>
                            <span class="response-time">Resposta imediata</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getTermosContent() {
    return `
        <div class="page-container">
            <div class="page-header">
                <h1><i class="fas fa-file-contract"></i> Termos de Uso</h1>
                <p>Última atualização: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div class="terms-container">
                <div class="terms-section">
                    <h2>1. Aceitação dos Termos</h2>
                    <p>Ao acessar e usar o Lucre Certo, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.</p>
                </div>

                <div class="terms-section">
                    <h2>2. Descrição do Serviço</h2>
                    <p>O Lucre Certo é uma plataforma de calculadora de precificação que ajuda vendedores a calcular preços de venda para diferentes plataformas de e-commerce, incluindo Shopee e Mercado Livre.</p>
                    <p>Nossos serviços incluem:</p>
                    <ul>
                        <li>Calculadora de precificação para múltiplas plataformas</li>
                        <li>Cálculo de taxas e impostos</li>
                        <li>Análise de margem de lucro</li>
                        <li>Ferramentas de gestão de anúncios (em desenvolvimento)</li>
                    </ul>
                </div>

                <div class="terms-section">
                    <h2>3. Conta de Usuário</h2>
                    <p>Para usar certas funcionalidades do serviço, você deve criar uma conta. Você é responsável por:</p>
                    <ul>
                        <li>Manter a confidencialidade de sua senha</li>
                        <li>Todas as atividades que ocorrem em sua conta</li>
                        <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                    </ul>
                </div>

                <div class="terms-section">
                    <h2>4. Uso Aceitável</h2>
                    <p>Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos. É proibido:</p>
                    <ul>
                        <li>Usar o serviço para qualquer propósito ilegal ou não autorizado</li>
                        <li>Interferir ou interromper o serviço ou servidores</li>
                        <li>Tentar obter acesso não autorizado ao sistema</li>
                        <li>Transmitir vírus ou código malicioso</li>
                    </ul>
                </div>

                <div class="terms-section">
                    <h2>5. Privacidade</h2>
                    <p>Sua privacidade é importante para nós. Coletamos e usamos informações pessoais de acordo com nossa Política de Privacidade. Ao usar nosso serviço, você concorda com a coleta e uso de informações conforme descrito.</p>
                </div>

                <div class="terms-section">
                    <h2>6. Limitação de Responsabilidade</h2>
                    <p>O Lucre Certo é fornecido "como está" sem garantias de qualquer tipo. Não nos responsabilizamos por:</p>
                    <ul>
                        <li>Erros ou imprecisões nos cálculos</li>
                        <li>Perdas financeiras decorrentes do uso do serviço</li>
                        <li>Interrupções ou indisponibilidade do serviço</li>
                        <li>Danos diretos, indiretos ou consequenciais</li>
                    </ul>
                </div>

                <div class="terms-section">
                    <h2>7. Modificações</h2>
                    <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação. O uso continuado do serviço após as alterações constitui aceitação dos novos termos.</p>
                </div>

                <div class="terms-section">
                    <h2>8. Rescisão</h2>
                    <p>Podemos encerrar ou suspender sua conta e acesso ao serviço imediatamente, sem aviso prévio, por qualquer motivo, incluindo violação destes termos.</p>
                </div>

                <div class="terms-section">
                    <h2>9. Lei Aplicável</h2>
                    <p>Estes termos são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos tribunais competentes do Brasil.</p>
                </div>

                <div class="terms-section">
                    <h2>10. Contato</h2>
                    <p>Se você tiver dúvidas sobre estes termos, entre em contato conosco:</p>
                    <ul>
                        <li>E-mail: legal@lucrecerto.com</li>
                        <li>Telefone: (11) 99999-9999</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// ===== FUNÇÕES AUXILIARES PARA AS NOVAS PÁGINAS =====

function toggleFaq(element) {
    const faqItem = element.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
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

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Por favor, preencha todos os campos de senha.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('A nova senha e a confirmação não coincidem.');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('A nova senha deve ter pelo menos 6 caracteres.');
        return;
    }
    
    // Aqui você implementaria a lógica para alterar a senha via Supabase
    alert('Funcionalidade de alteração de senha será implementada em breve.');
}

function saveSettings() {
    const emailNotifications = document.getElementById('emailNotifications').checked;
    const autoSave = document.getElementById('autoSave').checked;
    const userName = document.getElementById('userNameSettings').value;
    
    // Salvar configurações no localStorage
    localStorage.setItem('emailNotifications', emailNotifications);
    localStorage.setItem('autoSave', autoSave);
    localStorage.setItem('userName', userName);
    
    alert('Configurações salvas com sucesso!');
}

function resetSettings() {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
        // Limpar configurações do localStorage
        localStorage.removeItem('emailNotifications');
        localStorage.removeItem('autoSave');
        localStorage.removeItem('userName');
        
        // Resetar campos
        document.getElementById('emailNotifications').checked = false;
        document.getElementById('autoSave').checked = false;
        document.getElementById('userNameSettings').value = '';
        
        alert('Configurações restauradas para os valores padrão.');
    }
}

function loadUserSettings() {
    // Carregar e-mail do usuário atual
    const userEmailEl = document.getElementById('userEmailSettings');
    if (userEmailEl) {
        userEmailEl.value = document.getElementById('userName').textContent || '';
    }
    
    // Carregar configurações salvas
    const emailNotifications = localStorage.getItem('emailNotifications') === 'true';
    const autoSave = localStorage.getItem('autoSave') === 'true';
    const userName = localStorage.getItem('userName') || '';
    
    const emailNotificationsEl = document.getElementById('emailNotifications');
    const autoSaveEl = document.getElementById('autoSave');
    const userNameEl = document.getElementById('userNameSettings');
    
    if (emailNotificationsEl) emailNotificationsEl.checked = emailNotifications;
    if (autoSaveEl) autoSaveEl.checked = autoSave;
    if (userNameEl) userNameEl.value = userName;
}

