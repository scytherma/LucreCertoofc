import { supabase } from "./supabase-config.js";

// Funções utilitárias (sem alterações)
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
        } else {
            button.disabled = false;
            button.style.opacity = "1";
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
    }

    const googleButtons = document.querySelectorAll("[data-action='google-login']");
    googleButtons.forEach(button => button.addEventListener("click", handleGoogleLogin));
});

// Login com Google - redireciona localmente
async function handleGoogleLogin() {
    setLoading(true);
    try {
        const redirectUrl = `${window.location.origin}/index.html`; // <<== força a calculadora local
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: redirectUrl }
        });
        if (error) throw error;
    } catch (error) {
        console.error("Erro no login com Google:", error);
        showError("Erro ao fazer login com Google. Tente novamente.");
        setLoading(false);
    }
}

// O restante do código (login, cadastro, logout, checkAuth) permanece igual
