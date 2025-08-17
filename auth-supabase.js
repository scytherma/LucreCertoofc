import { supabase, getURL } from "./supabase-config.js";
// Funções de autenticação com Supabase

// Funções utilitárias
function showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    const successDiv = document.getElementById("successMessage");

    if (successDiv) successDiv.style.display = "none";
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
        setTimeout(() => { errorDiv.style.display = "none"; }, 5000);
        
        // Auto-hide após 5 segundos
        setTimeout(() => {
            errorDiv.style.display = "none";
        }, 5000);
    }
}

function showSuccess(message) {
    const errorDiv = document.getElementById("errorMessage");
    const successDiv = document.getElementById("successMessage");

    if (errorDiv) errorDiv.style.display = "none";
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = "block";
        setTimeout(() => { successDiv.style.display = "none"; }, 3000);
        
        // Auto-hide após 3 segundos
        setTimeout(() => {
            successDiv.style.display = "none";
        }, 3000);
    }
}

function setLoading(isLoading) {
    const buttons = document.querySelectorAll("button[type=\'submit\
'], .auth-button, [data-action=\'google-login\
']");
    const form = document.querySelector(".auth-form");
    const buttons = document.querySelectorAll("button[type=\"submit\"], .auth-button");
    
    buttons.forEach(button => {
        button.disabled = isLoading;
        button.style.opacity = isLoading ? "0.6" : "1";
        if (isLoading) {
            button.disabled = true;
            button.style.opacity = "0.6";
            if (button.textContent.includes("Cadastrar")) {
                button.textContent = "Cadastrando...";
            } else if (button.textContent.includes("Entrar")) {
                button.textContent = "Entrando...";
            } else if (button.textContent.includes("Sign in with Google")) {
                button.textContent = "Entrando com Google...";
            }
        } else {
            button.disabled = false;
            button.style.opacity = "1";
            if (button.textContent.includes("Cadastrando")) {
                button.textContent = "Cadastrar";
            } else if (button.textContent.includes("Entrando")) {
                button.textContent = "Entrar";
            } else if (button.textContent.includes("Entrando com Google")) {
                button.textContent = "Sign in with Google";
            }
        }
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function formatPhone(phone) {
    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, "");
    if (numbers.length <= 11) return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    
    // Aplica a máscara (xx) xxxxx-xxxx
    if (numbers.length <= 11) {
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return phone;
}

// Event listeners
document.addEventListener("DOMContentLoaded", async function() {
    await checkAuthStatus();
// Event listeners para formulários
document.addEventListener("DOMContentLoaded", function() {
    // Verificar se usuário já está logado
    checkAuthStatus();

    // Formulário de login
    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    // Formulário de cadastro
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
        
        // Máscara para telefone
        const phoneInput = document.getElementById("phone");
        if (phoneInput) phoneInput.addEventListener("input", e => e.target.value = formatPhone(e.target.value));
        if (phoneInput) {
            phoneInput.addEventListener("input", function(e) {
                e.target.value = formatPhone(e.target.value);
            });
        }
        
        // Validação de confirmação de senha
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirmPassword");
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener("blur", function() {
                if (passwordInput.value && confirmPasswordInput.value) {
                    if (passwordInput.value !== confirmPasswordInput.value) {
                        showError("As senhas não conferem");
                        confirmPasswordInput.focus();
                    }
                }
            });
        }
    }

    const googleButtons = document.querySelectorAll("[data-action=\'google-login\
']");
    googleButtons.forEach(button => button.addEventListener("click", handleGoogleLogin));
    // Botões do Google
    const googleButtons = document.querySelectorAll("[data-action=\"google-login\"]");
    googleButtons.forEach(button => {
        button.addEventListener("click", handleGoogleLogin);
    });
});

// Verificar status de autenticação (corrigido para OAuth)
// Função para obter URL correta baseada no ambiente
export const getURL = () => {
    let url = window.location.origin;
    if (url.includes("localhost")) {
        url = "http://localhost:3000";
    }
    url = url.startsWith("http") ? url : `https://${url}`;
    url = url.endsWith("/") ? url : `${url}/`;
    return url;
};

// Verificar status de autenticação
async function checkAuthStatus() {
    setLoading(true);
    try {
        // Finaliza login via OAuth se houver query params
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("access_token") || urlParams.has("code")) {
            await supabase.auth.getSessionFromUrl();
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
            if (window.location.pathname.includes("login.html") || window.location.pathname.includes("register.html")) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
            // Usuário logado
            if (window.location.pathname.includes("/login.html") || window.location.pathname.includes("/register.html")) {
                window.location.href = getURL() + "index.html";
            } else {
                updateUserInterface(session.user);
                // Atualizar interface do usuário
                updateUserInterface(user);
            }
        } else {
            if (window.location.pathname === "/" || window.location.pathname.includes("index.html")) {
            // Usuário não logado
            if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
                window.location.href = getURL() + "login.html";
            }
        }
    } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        if (window.location.pathname === "/" || window.location.pathname.includes("index.html")) {
        if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
            window.location.href = getURL() + "login.html";
        }
    } finally {
        setLoading(false);
    }
}

// Atualizar interface do usuário
function updateUserInterface(user) {
    const userNameElement = document.getElementById("userName");
    const dropdownUserNameElement = document.getElementById("dropdownUserName");
    if (userNameElement) {
        const displayName = user.user_metadata?.name || user.email.split("@")[0];
        userNameElement.textContent = `Olá, ${displayName}`;
    }
    if (dropdownUserNameElement) {
        const displayName = user.user_metadata?.name || user.email.split("@")[0];
        dropdownUserNameElement.textContent = displayName;
    }

    // Mostrar elementos do usuário logado
    document.getElementById("user-header").style.display = "flex";
    document.getElementById("main-content").style.display = "block";
    document.getElementById("loading-screen").style.display = "none";
}

// Login com e-mail/senha
// Handler para login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) return showError("Por favor, preencha todos os campos");
    if (!validateEmail(email)) return showError("Por favor, insira um e-mail válido");

    
    // Validações
    if (!email || !password) {
        showError("Por favor, preencha todos os campos");
        return;
    }
    
    if (!validateEmail(email)) {
        showError("Por favor, insira um e-mail válido");
        return;
    }
    
    setLoading(true);
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            throw error;
        }
        
        showSuccess("Login realizado com sucesso!");
        setTimeout(() => window.location.href = getURL() + "index.html", 1000);
        
        setTimeout(() => {
            window.location.href = getURL() + "index.html";
        }, 1000);
        
    } catch (error) {
        console.error("Erro no login:", error);
        let msg = "Erro no login. Tente novamente.";
        if (error.message.includes("Invalid login credentials")) msg = "E-mail ou senha incorretos";
        if (error.message.includes("Email not confirmed")) msg = "Por favor, confirme seu e-mail antes de fazer login";
        showError(msg);
        
        let errorMessage = "Erro no login. Tente novamente.";
        if (error.message.includes("Invalid login credentials")) {
            errorMessage = "E-mail ou senha incorretos";
        } else if (error.message.includes("Email not confirmed")) {
            errorMessage = "Por favor, confirme seu e-mail antes de fazer login";
        }
        
        showError(errorMessage);
    } finally {
        setLoading(false);
    }
}

// Cadastro
// Handler para cadastro
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const phone = document.getElementById("phone").value.trim();
    const howFoundUs = document.getElementById("howFoundUs")?.value || "";

    if (!name || !email || !password || !confirmPassword) return showError("Por favor, preencha todos os campos obrigatórios");
    if (!validateEmail(email)) return showError("Por favor, insira um e-mail válido");
    if (!validatePassword(password)) return showError("A senha deve ter pelo menos 6 caracteres");
    if (password !== confirmPassword) return showError("As senhas não conferem");

    const howFoundUs = document.getElementById("howFoundUs").value;
    
    // Validações
    if (!name || !email || !password || !confirmPassword) {
        showError("Por favor, preencha todos os campos obrigatórios");
        return;
    }
    
    if (!validateEmail(email)) {
        showError("Por favor, insira um e-mail válido");
        return;
    }
    
    if (!validatePassword(password)) {
        showError("A senha deve ter pelo menos 6 caracteres");
        return;
    }
    
    if (password !== confirmPassword) {
        showError("As senhas não conferem");
        return;
    }
    
    setLoading(true);
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name, phone, how_found_us: howFoundUs }, emailRedirectTo: getURL() + "login.html" }
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    phone: phone,
                    how_found_us: howFoundUs
                },
                emailRedirectTo: getURL()
            }
        });
        if (error) throw error;
        
        if (error) {
            throw error;
        }
        
        if (data.user && !data.user.email_confirmed_at) {
            showSuccess("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
            setTimeout(() => window.location.href = getURL() + "login.html", 3000);
            
            setTimeout(() => {
                window.location.href = getURL() + "login.html";
            }, 3000);
        } else {
            showSuccess("Cadastro realizado com sucesso!");
            setTimeout(() => window.location.href = getURL() + "index.html", 1000);
            
            setTimeout(() => {
                window.location.href = getURL() + "index.html";
            }, 1000);
        }
        
    } catch (error) {
        console.error("Erro no cadastro:", error);
        let msg = "Erro no cadastro. Tente novamente.";
        if (error.message.includes("User already registered")) msg = "Este e-mail já está cadastrado";
        if (error.message.includes("Password should be at least")) msg = "A senha deve ter pelo menos 6 caracteres";
        showError(msg);
        
        let errorMessage = "Erro no cadastro. Tente novamente.";
        if (error.message.includes("User already registered")) {
            errorMessage = "Este e-mail já está cadastrado";
        } else if (error.message.includes("Password should be at least")) {
            errorMessage = "A senha deve ter pelo menos 6 caracteres";
        }
        
        showError(errorMessage);
    } finally {
        setLoading(false);
    }
}

// Login com Google - redireciona localmente
// Handler para login com Google
async function handleGoogleLogin() {
    setLoading(true);
    
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: getURL() }
            options: {
                redirectTo: getURL()
            }
        });
        if (error) throw error;
        
        if (error) {
            throw error;
        }
        
        // O redirecionamento será automático
        
    } catch (error) {
        console.error("Erro no login com Google:", error);
        showError("Erro ao fazer login com Google. Tente novamente.");
        setLoading(false);
    }
}

// Logout
// Função para logout
export async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        const { error } = await supabaseClient.auth.signOut();
        
        if (error) {
            throw error;
        }
        
        window.location.href = getURL() + "login.html";
        
    } catch (error) {
        console.error("Erro no logout:", error);
        // Mesmo com erro, redirecionar para login
        window.location.href = getURL() + "login.html";
    }
}

// Função para verificar autenticação (para usar na calculadora)
export async function checkAuth() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) { updateUserInterface(user); return true; }
        window.location.href = getURL() + "login.html";
        return false;
    } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        window.location.href = getURL() + "login.html";
        return false;
    }
export function checkAuth() {
    return new Promise(async (resolve) => {
        try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            
            if (user) {
                updateUserInterface(user);
                resolve(true);
            } else {
                window.location.href = getURL() + "login.html";
                resolve(false);
            }
        } catch (error) {
            console.error("Erro ao verificar autenticação:", error);
            window.location.href = getURL() + "login.html";
            resolve(false);
        }
    });
}

// Listener global de autenticação
supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") updateUserInterface(session.user);
    else if (event === "SIGNED_OUT") {
        if (!window.location.pathname.includes("login.html") && !window.location.pathname.includes("register.html")) {
// Listener para mudanças de autenticação
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
        console.log("Usuário logado:", session.user);
        updateUserInterface(session.user);
    } else if (event === "SIGNED_OUT") {
        console.log("Usuário deslogado");
        if (window.location.pathname !== "/login.html" && window.location.pathname !== "/register.html") {
            window.location.href = getURL() + "login.html";
        }
    }
});
