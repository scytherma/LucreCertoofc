// Pega o cliente Supabase global
const supabaseClient = window.supabaseClient;

// Handler para cadastro
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const phone = document.getElementById("phone").value.trim();
    const howFoundUs = document.getElementById("howFoundUs").value;
    
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
                // ✅ Redireciona para seu site na Vercel
                emailRedirectTo: "https://lucre-certoofc.vercel.app/"
            }
        });
        if (error) throw error;
        
        if (data.user && !data.user.email_confirmed_at) {
            showSuccess("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
            setTimeout(() => window.location.href = "./login.html", 3000);
        } else {
            showSuccess("Cadastro realizado com sucesso!");
            setTimeout(() => {
                window.location.href = "./index.html";
                if (typeof checkUserSubscriptionStatus === 'function') {
                    checkUserSubscriptionStatus();
                }
            }, 1000);
        }
    } catch (error) {
        console.error("Erro no cadastro:", error);
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

// Handler para login com Google
async function handleGoogleLogin() {
    setLoading(true);
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: {
                // ✅ Redireciona para seu site na Vercel
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
