import { loginWithEmailPassword, logoutCurrentUser, observeAdminSession } from "../admin/js/admin-auth.js";
import { loadHistoryEntries, restoreHistoryEntry } from "../admin/js/admin-data.js";
import { formatDate } from "../admin/js/admin-history.js";

const state = {
    user: null,
    language: "es"
};

const ui = {
    authScreen: document.getElementById("auth-screen"),
    historyShell: document.getElementById("history-shell"),
    accessDenied: document.getElementById("access-denied"),
    historyApp: document.getElementById("history-app"),
    authMessage: document.getElementById("auth-message"),
    historyMessage: document.getElementById("history-message"),
    loginForm: document.getElementById("login-form"),
    loginEmail: document.getElementById("login-email"),
    loginPassword: document.getElementById("login-password"),
    sessionCard: document.getElementById("session-card"),
    sessionUser: document.getElementById("session-user"),
    userMenuButton: document.getElementById("user-menu-button"),
    languageButton: document.getElementById("language-button"),
    languageSwitch: document.getElementById("language-switch"),
    logoutButton: document.getElementById("logout-button"),
    historyList: document.getElementById("history-list")
};

function setAuthMessage(message, isError) {
    ui.authMessage.textContent = message || "";
    ui.authMessage.style.color = isError ? "#b42318" : "";
}

function setHistoryMessage(message, isError) {
    ui.historyMessage.textContent = message || "";
    ui.historyMessage.style.color = isError ? "#b42318" : "";
}

function setSignedOutShell() {
    ui.authScreen.classList.remove("hidden");
    ui.historyShell.classList.add("hidden");
    ui.accessDenied.classList.add("hidden");
    ui.historyApp.classList.add("hidden");
    closeUserMenu();
}

function setAuthorizedShell() {
    ui.authScreen.classList.add("hidden");
    ui.historyShell.classList.remove("hidden");
    ui.accessDenied.classList.add("hidden");
    ui.historyApp.classList.remove("hidden");
    ui.sessionUser.textContent = state.user && state.user.email ? state.user.email : "Usuario sin email";
}

function setDeniedShell() {
    ui.authScreen.classList.add("hidden");
    ui.historyShell.classList.remove("hidden");
    ui.accessDenied.classList.remove("hidden");
    ui.historyApp.classList.add("hidden");
    ui.sessionUser.textContent = state.user && state.user.email ? state.user.email : "Usuario sin email";
}

function closeUserMenu() {
    ui.sessionCard.classList.add("hidden");
    ui.userMenuButton.setAttribute("aria-expanded", "false");
}

function toggleUserMenu() {
    const willOpen = ui.sessionCard.classList.contains("hidden");
    ui.sessionCard.classList.toggle("hidden", !willOpen);
    ui.userMenuButton.setAttribute("aria-expanded", willOpen ? "true" : "false");
}

function updateLanguageSwitch() {
    const options = ui.languageSwitch.querySelectorAll(".user-menu__switch-option");
    options.forEach(function (option) {
        option.classList.toggle("user-menu__switch-option--active", option.textContent.trim() === state.language);
    });
    ui.languageButton.setAttribute("aria-pressed", state.language === "en" ? "true" : "false");
}

function renderHistory(entries) {
    if (!entries.length) {
        ui.historyList.innerHTML = '<p class="admin-muted">Todavia no hay publicaciones registradas.</p>';
        return;
    }

    ui.historyList.innerHTML = "";
    entries.forEach(function (entry) {
        const item = document.createElement("article");
        item.className = "history-entry";

        const title = document.createElement("h2");
        title.className = "history-entry__title";
        title.textContent = "Publicacion " + formatDate(entry.createdAt);

        const meta = document.createElement("p");
        meta.className = "history-entry__meta";
        meta.textContent = (entry.createdBy && entry.createdBy.email ? entry.createdBy.email : "Usuario desconocido") + " · " + entry.id;

        const actions = document.createElement("div");
        actions.className = "history-entry__actions";

        const restoreButton = document.createElement("button");
        restoreButton.className = "button button-primary";
        restoreButton.type = "button";
        restoreButton.textContent = "Restaurar";
        restoreButton.addEventListener("click", async function () {
            const shouldRestore = window.confirm("¿Seguro que deseas restaurar esta version y publicarla inmediatamente?");
            if (!shouldRestore) {
                return;
            }

            restoreButton.disabled = true;
            setHistoryMessage("Restaurando version...", false);

            try {
                await restoreHistoryEntry(entry.id, state.user);
                setHistoryMessage("Version restaurada y publicada correctamente.", false);
                const freshEntries = await loadHistoryEntries();
                renderHistory(freshEntries);
            } catch (error) {
                setHistoryMessage(error.message || "No se pudo restaurar la version.", true);
            } finally {
                restoreButton.disabled = false;
            }
        });

        actions.appendChild(restoreButton);
        item.appendChild(title);
        item.appendChild(meta);
        item.appendChild(actions);
        ui.historyList.appendChild(item);
    });
}

async function loadHistoryPage() {
    setHistoryMessage("Cargando historial...", false);

    try {
        const entries = await loadHistoryEntries();
        renderHistory(entries);
        setHistoryMessage("", false);
    } catch (error) {
        ui.historyList.innerHTML = "";
        setHistoryMessage(error.message || "No se pudo cargar el historial.", true);
    }
}

function bindEvents() {
    ui.loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        setAuthMessage("Validando credenciales...");

        try {
            await loginWithEmailPassword(ui.loginEmail.value.trim(), ui.loginPassword.value);
            ui.loginPassword.value = "";
            setAuthMessage("");
        } catch (error) {
            setAuthMessage(error.message || "No se pudo iniciar sesión.", true);
        }
    });

    ui.logoutButton.addEventListener("click", async function () {
        try {
            closeUserMenu();
            await logoutCurrentUser();
        } catch (error) {
            setHistoryMessage(error.message || "No se pudo cerrar la sesión.", true);
        }
    });

    ui.languageButton.addEventListener("click", function () {
        state.language = state.language === "es" ? "en" : "es";
        updateLanguageSwitch();
        closeUserMenu();
        setHistoryMessage("Idioma " + state.language.toUpperCase() + " disponible pronto.", false);
    });

    ui.userMenuButton.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleUserMenu();
    });

    document.addEventListener("click", function (event) {
        if (!ui.historyShell.contains(event.target)) {
            return;
        }

        if (!ui.sessionCard.contains(event.target) && event.target !== ui.userMenuButton && !ui.userMenuButton.contains(event.target)) {
            closeUserMenu();
        }
    });
}

function boot() {
    bindEvents();

    try {
        observeAdminSession({
            onSignedOut: function () {
                state.user = null;
                setSignedOutShell();
                setAuthMessage("");
                setHistoryMessage("", false);
            },
            onAuthorized: function (user) {
                state.user = user;
                setAuthorizedShell();
                setAuthMessage("");
                loadHistoryPage();
            },
            onDenied: function (user) {
                state.user = user;
                setDeniedShell();
                setHistoryMessage("El usuario autenticado no tiene permisos de admin.", true);
            },
            onError: function (error) {
                setAuthMessage(error.message || "No se pudo validar la sesión.", true);
            }
        });
    } catch (error) {
        setAuthMessage(error.message || "No se pudo inicializar Firebase Auth.", true);
    }
}

boot();
