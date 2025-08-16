import { supabase } from "./supabase-config.js";

// Funções utilitárias
function showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    const successDiv = document.getElementById("successMessage");
    
    if (successDiv) successDiv.style.display = "none";
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
        setTimeout(() => { errorDiv.style.display = "none"; }, 5000);
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
    }
}

function setLoading(isLoading) {
    const buttons = document.querySelectorAll("button[type='submit'], .auth-button, [data-action='google-login']");
    buttons.forEach(button => {
        if (isLoading) {
            button.disabled = true;
            button.style.opacity = "0.6";
            if (button.textContent.includes("Entrando")) button.textContent = "Entrando...";
            if (button.textContent.includes("Cadastrando")) button.textContent = "Cadastrando...";
            if (button.textContent.includes("Google")) button.textContent = "Entrando com Google...";
        } else {
            button.disabled = false;
            button.style.opacity = "1";
            if (button.textContent.includes("Entrando")) button.textContent = "Entrar";
            if (button.textContent.includes("Cadastrando")) button.textContent = "Cadastrar";
            if (button.textContent.includes("Google")) button.textContent = "Sign in with Google";
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
    const numbers = phone.replace(/\D/g, "");
    if (numbers.length <= 11) return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    return phone;
}

// Event listeners
document.addEventListener("DOMContentLoaded", function() {
    checkAuthStatus();

    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
        const phoneInput = document.getElementById("phone");
        if (phoneInput) phoneInput.addEventListener("input", e => e.target.value = formatPhone(e.target.value));

        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirmPassword");
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener("blur", function() {
                if (passwordInput.value && confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
                    showError("As senhas não conferem");
                    confirmPasswordInput.focus();
                }
            });
        }
    }

    const googleButtons = document.querySelectorAll("[data-action='google-login']");
    googleButtons.forEach(button => button.addEventListener("click", handleGoogleLogin));
});

// Verificar status de autenticação
async function checkAuthStatus() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            if (window.location.pathname.includes("login.html") || window.location.pathname.includes("register.html")) {
                window.location.href = "./index.html";
            } else updateUserInterface(user);
        } else {
            if (window.location.pathname === "/" || window.location.pathname.includes("index.html")) {
                window.location.href = "./login.html";
            }
        }
    } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        if (window.location.pathname === "/" || window.location.pathname.includes("index.html")) {
            window.location.href = "./login.html";
        }
    }
}

function updateUserInterface(user) {
    const userNameElement = document.getElementById("userName");
    if (userNameElement) {
        const displayName = user.user_metadata?.name || user.email.split("@")[0];
        userNameElement.textContent = `Olá, ${displayName}`;
    }
}

// Login com e-mail/senha
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) return showError("Por favor, preencha todos os campos");
    if (!validateEmail(email)) return showError("Por favor, insira um e-mail válido");

    setLoading(true);
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showSuccess("Login realizado com sucesso!");
        setTimeout(() => window.location.href = "./index.html", 1000);
    } catch (error) {
        console.error("Erro no login:", error);
        let msg = "Erro no login. Tente novamente.";
        if (error.message.includes("Invalid login credentials")) msg = "E-mail ou senha incorretos";
        if (error.message.includes("Email not confirmed")) msg = "Por favor, confirme seu e-mail antes de fazer login";
        showError(msg);
    } finally {
        setLoading(false);
    }
}

// Cadastro
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

    setLoading(true);
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name, phone, how_found_us: howFoundUs }, emailRedirectTo: "./login.html" }
        });
        if (error) throw error;
        if (data.user && !data.user.email_confirmed_at) {
            showSuccess("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
            setTimeout(() => window.location.href = "./login.html", 3000);
        } else {
            showSuccess("Cadastro realizado com sucesso!");
            setTimeout(() => window.location.href = "./index.html", 1000);
        }
    } catch (error) {
        console.error("Erro no cadastro:", error);
        let msg = "Erro no cadastro. Tente novamente.";
        if (error.message.includes("User already registered")) msg = "Este e-mail já está cadastrado";
        if (error.message.includes("Password should be at least")) msg = "A senha deve ter pelo menos 6 caracteres";
        showError(msg);
    } finally {
        setLoading(false);
    }
}

// Login com Google
async function handleGoogleLogin() {
    setLoading(true);
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: "https://<SEU-PROJETO>.vercel.app/index.html" } // <<== Substitua pela URL real do Vercel
        });
        if (error) throw error;
    } catch (error) {
        console.error("Erro no login com Google:", error);
        showError("Erro ao fazer login com Google. Tente novamente.");
        setLoading(false);
    }
}

// Logout
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = "./login.html";
    } catch (error) {
        console.error("Erro no logout:", error);
        window.location.href = "./login.html";
    }
}

// Checagem de autenticação para a calculadora
async function checkAuth() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) { updateUserInterface(user); return true; }
        window.location.href = "./login.html";
        return false;
    } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        window.location.href = "./login.html";
        return false;
    }
}

// Listener global de autenticação
supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") updateUserInterface(session.user);
    else if (event === "SIGNED_OUT") {
        if (!window.location.pathname.includes("login.html") && !window.location.pathname.includes("register.html")) {
            window.location.href = "./login.html";
        }
    }
});
