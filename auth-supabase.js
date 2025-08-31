// Pega o cliente Supabase global (já configurado em supabase-config.js)
const supabaseClient = window.supabaseClient;

// --------------------
// Funções auxiliares
// --------------------
function showError(message) {
    const errorMessage = document.getElementById("errorMessage");
    if (errorMessage) {
        errorMessage.innerText = message;
        errorMessage.style.display = "block";
    }
}

function showSuccess(message) {
    const successMessage = document.getElementById("successMessage");
    if (successMessage) {
        successMessage.innerText = message;
        successMessage.style.display = "block";
    }
}

function setLoading(isLoading) {
    const button = document.querySelector(".auth-button");
    if (button) {
        button.disabled = isLoading;
        button.innerText = isLoading ? "Carregando..." : "Entrar";
    }
}

function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// --------------------
// LOGIN
// --------------------
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) return showError("Preencha todos os campos");

    setLoading(true);

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;

        showSuccess("Login realizado com sucesso!");
        setTimeout(() => {
            window.location.href = "./index.html";
        }, 1000);
    } catch (error) {
        console.error("Erro no login:", error);
        showError("E-mail ou senha incorretos");
    } finally {
        setLoading(false);
    }
}

// --------------------
// CADASTRO
// --------------------
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;
    const phone = document.getElementById("phone")?.value.trim();
    const howFoundUs = document.getElementById("howFoundUs")?.value;

    if (!name || !email || !password || !confirmPassword) return showError("Por favor, preencha todos os campos obrigatórios");
    if (!validateEmail(email)) return showError("Por favor, insira um e-mail válido");
    if (!validatePassword(password)) return showError("A senha deve ter pelo menos 6 caracteres");
    if (password !== confirmPassword) return showError("As senhas não conferem");

    setLoading(true);

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: { name, phone, how_found_us: howFoundUs },
                emailRedirectTo: "https://lucre-certoofc.vercel.app/"
            }
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
        let errorMessage = "Erro no cadastro. Tente novamente.";
        if (error.message.includes("User already registered")) {
            errorMessage = "Este e-mail já está cadastrado";
        }
        showError(errorMessage);
    } finally {
        setLoading(false);
    }
}

// --------------------
// LOGIN COM GOOGLE
// --------------------
async function handleGoogleLogin() {
    setLoading(true);
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: "https://lucre-certoofc.vercel.app/"
            }
        });
        if (error) throw error;
    } catch (error) {
        console.error("Erro no login com Google:", error);
        showError("Erro ao fazer login com Google. Tente novamente.");
        setLoading(false);
    }
}

// --------------------
// RESET DE SENHA
// --------------------
async function handleResetPassword(e) {
    e.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    if (!email) return showError("Digite seu e-mail");

    setLoading(true);

    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: "https://lucre-certoofc.vercel.app/reset-password.html"
        });
        if (error) throw error;

        showSuccess("E-mail de recuperação enviado!");
    } catch (error) {
        console.error("Erro no reset de senha:", error);
        showError("Erro ao enviar e-mail de recuperação");
    } finally {
        setLoading(false);
    }
}

// --------------------
// EVENT LISTENERS
// --------------------
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);

    const registerForm = document.getElementById("registerForm");
    if (registerForm) registerForm.addEventListener("submit", handleRegister);

    const resetForm = document.getElementById("resetForm");
    if (resetForm) resetForm.addEventListener("submit", handleResetPassword);

    const googleBtn = document.querySelector("[data-action='google-login']");
    if (googleBtn) googleBtn.addEventListener("click", handleGoogleLogin);
});
