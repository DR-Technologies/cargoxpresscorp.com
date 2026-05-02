import { loginWithEmailPassword, logoutCurrentUser, observeAdminSession } from "./admin-auth.js";
import { openCloudinaryUpload } from "./admin-cloudinary.js";
import { loadAdminSnapshot, publishDraft, resetDraftFromPublished, saveDraft } from "./admin-data.js";
import { createAdminForm } from "./admin-form.js";
import { bindAdminActions, setActionButtonsDisabled } from "./admin-publish.js";
import { validateContentForTemplate } from "../../js/template-registry.js";

const state = {
    user: null,
    draft: null,
    published: null,
    hasUnsavedChanges: false,
    editorSearchQuery: ""
};

const ui = {
    authScreen: document.getElementById("auth-screen"),
    adminShell: document.getElementById("admin-shell"),
    authCard: document.getElementById("auth-card"),
    authMessage: document.getElementById("auth-message"),
    loginForm: document.getElementById("login-form"),
    loginEmail: document.getElementById("login-email"),
    loginPassword: document.getElementById("login-password"),
    sessionCard: document.getElementById("session-card"),
    sessionUser: document.getElementById("session-user"),
    languageButton: document.getElementById("language-button"),
    languageSwitch: document.getElementById("language-switch"),
    userMenuButton: document.getElementById("user-menu-button"),
    logoutButton: document.getElementById("logout-button"),
    reloadButton: document.getElementById("reload-button"),
    resetButton: document.getElementById("reset-button"),
    saveButton: document.getElementById("save-button"),
    publishButton: document.getElementById("publish-button"),
    actionMessage: document.getElementById("action-message"),
    statusBadge: document.getElementById("status-badge"),
    adminApp: document.getElementById("admin-app"),
    accessDenied: document.getElementById("access-denied"),
    contentGrid: document.getElementById("content-grid"),
    editorPanel: document.getElementById("editor-panel"),
    editorToggleButton: document.getElementById("editor-toggle-button"),
    editorSearchInput: document.getElementById("editor-search-input"),
    formRoot: document.getElementById("form-root"),
    previewFrame: document.getElementById("preview-frame")
};

let formController = null;
let currentLanguage = "es";

function setStatus(message, isError) {
    ui.actionMessage.textContent = message || "";
    ui.actionMessage.style.color = isError ? "#ffd5d2" : "";
}

function setEditorFeedback(message, tone) {
    if (!message) {
        updateStatusBadge();
        return;
    }

    ui.statusBadge.textContent = message;
    ui.statusBadge.dataset.tone = tone || "neutral";
}

function setAuthMessage(message, isError) {
    ui.authMessage.textContent = message || "";
    ui.authMessage.style.color = isError ? "#b42318" : "";
}

function setAuthenticatedShell(user) {
    const isSignedIn = Boolean(user);
    ui.authScreen.classList.toggle("hidden", isSignedIn);
    ui.adminShell.classList.toggle("hidden", !isSignedIn);
    ui.sessionCard.classList.toggle("hidden", !isSignedIn);
    ui.adminApp.classList.toggle("hidden", !isSignedIn);
    ui.accessDenied.classList.add("hidden");
    if (user) {
        ui.sessionUser.textContent = user.email || "Usuario sin email";
    }
}

function setDeniedShell(user) {
    ui.authScreen.classList.add("hidden");
    ui.adminShell.classList.remove("hidden");
    ui.sessionCard.classList.remove("hidden");
    ui.adminApp.classList.add("hidden");
    ui.accessDenied.classList.remove("hidden");
    ui.sessionUser.textContent = user.email || "Usuario sin email";
}

function getContentStatus() {
    if (state.published && state.draft && JSON.stringify(state.draft) === JSON.stringify(state.published)) {
        return "Publicado";
    }

    if (state.draft) {
        return "Borrador";
    }

    return "Sin guardar";
}

function updateStatusBadge() {
    ui.statusBadge.textContent = state.hasUnsavedChanges ? "Cambios sin guardar" : getContentStatus();
    ui.statusBadge.dataset.state = getContentStatus().toLowerCase().replace(/\s+/g, "-");
    ui.statusBadge.dataset.tone = state.hasUnsavedChanges ? "warning" : "neutral";
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
    if (!ui.languageSwitch) {
        return;
    }

    var options = ui.languageSwitch.querySelectorAll(".user-menu__switch-option");
    options.forEach(function (option) {
        var isActive = option.textContent.trim() === currentLanguage;
        option.classList.toggle("user-menu__switch-option--active", isActive);
    });
    ui.languageButton.setAttribute("aria-pressed", currentLanguage === "en" ? "true" : "false");
}

function updateMetaLabels() {
    updateStatusBadge();
}

function formatValidationMessage(validation) {
    const visibleIssues = validation.issues.slice(0, 8).map(function (issue) {
        return "- " + issue.label + ": " + issue.message;
    });
    const remaining = validation.issues.length - visibleIssues.length;
    if (remaining > 0) {
        visibleIssues.push("- " + remaining + " error(es) adicional(es).");
    }

    return "Revisa estos campos antes de publicar:\n\n" + visibleIssues.join("\n");
}

function postPreview() {
    if (!state.draft || !ui.previewFrame.contentWindow) {
        return;
    }

    ui.previewFrame.contentWindow.postMessage({
        type: "preview:update",
        content: state.draft
    }, window.location.origin);
}

function ensureForm() {
    if (!state.draft) {
        ui.formRoot.innerHTML = '<p class="admin-muted">Todavia no existe contenido inicial en Firebase RTDB.</p>';
        postPreview();
        updateMetaLabels();
        return;
    }

    if (formController) {
        formController.render();
        postPreview();
        updateMetaLabels();
        return;
    }

    formController = createAdminForm(ui.formRoot, {
        searchQuery: state.editorSearchQuery,
        getContent: function () {
            return state.draft;
        },
        setContent: function (content) {
            state.draft = content;
            state.hasUnsavedChanges = true;
            updateStatusBadge();
            setStatus("");
            postPreview();
        },
        onUpload: async function (pathString) {
            setStatus("Subiendo imagen a Cloudinary...");
            setEditorFeedback("Subiendo imagen...", "progress");
            const url = await openCloudinaryUpload({ folder: "cargoxpress/" + pathString.replace(/\./g, "-") });
            setStatus("");
            setEditorFeedback("Imagen lista", "success");
            return url;
        },
        onMessage: function (message, isError) {
            setStatus(message, isError);
            setEditorFeedback(message, isError ? "error" : "neutral");
        },
        onFeedback: function (message, isError) {
            setEditorFeedback(message, isError ? "error" : "neutral");
        }
    });

    formController.render();
    postPreview();
    updateMetaLabels();
}

async function loadAdminApp() {
    setActionButtonsDisabled([ui.saveButton, ui.publishButton, ui.reloadButton, ui.resetButton], true);
    setStatus("Cargando contenido...");
    setEditorFeedback("Cargando contenido...", "progress");

    try {
        const snapshot = await loadAdminSnapshot();
        state.draft = snapshot.active;
        state.published = snapshot.published;
        state.hasUnsavedChanges = false;
        ensureForm();
        setStatus("");
        setEditorFeedback(state.draft ? "Contenido listo" : "Sin contenido inicial", state.draft ? "neutral" : "warning");
    } catch (error) {
        setStatus(error.message || "No se pudo cargar el contenido.", true);
        setEditorFeedback("Error cargando contenido", "error");
    } finally {
        setActionButtonsDisabled([ui.saveButton, ui.publishButton, ui.reloadButton, ui.resetButton], false);
    }
}

async function handleSave() {
    if (!state.draft) {
        setEditorFeedback("No hay contenido para guardar.", "warning");
        return;
    }

    setActionButtonsDisabled([ui.saveButton, ui.publishButton], true);
    setStatus("Guardando borrador...");
    setEditorFeedback("Guardando...", "progress");

    try {
        state.draft = await saveDraft(state.draft, state.user);
        state.hasUnsavedChanges = false;
        updateMetaLabels();
        postPreview();
        setStatus("");
        setEditorFeedback("Borrador guardado", "success");
    } catch (error) {
        setStatus(error.message || "No se pudo guardar el borrador.", true);
        setEditorFeedback("Error al guardar", "error");
    } finally {
        setActionButtonsDisabled([ui.saveButton, ui.publishButton], false);
    }
}

async function handlePublish() {
    if (!state.draft) {
        setEditorFeedback("No hay contenido para publicar.", "warning");
        return;
    }

    const validation = validateContentForTemplate(state.draft);
    if (!validation.valid) {
        setEditorFeedback(validation.issues.length + " campo(s) requieren revision", "error");
        window.alert(formatValidationMessage(validation));
        return;
    }

    const shouldPublish = window.confirm("¿Seguro que deseas publicar este contenido?");
    if (!shouldPublish) {
        setEditorFeedback("Publicación cancelada.", "neutral");
        return;
    }

    setActionButtonsDisabled([ui.saveButton, ui.publishButton], true);
    setStatus("Publicando...");
    setEditorFeedback("Publicando...", "progress");

    try {
        const published = await publishDraft(state.draft, state.user);
        state.draft = published;
        state.published = published;
        state.hasUnsavedChanges = false;
        ensureForm();
        postPreview();
        updateMetaLabels();
        setStatus("");
        setEditorFeedback("Publicado correctamente", "success");
    } catch (error) {
        setStatus(error.message || "No se pudo publicar.", true);
        setEditorFeedback("Error al publicar", "error");
    } finally {
        setActionButtonsDisabled([ui.saveButton, ui.publishButton], false);
    }
}

async function handleReset() {
    const shouldReset = window.confirm("¿Seguro que deseas reemplazar el borrador con la versión publicada?");
    if (!shouldReset) {
        setEditorFeedback("Reset cancelado.", "neutral");
        return;
    }

    setActionButtonsDisabled([ui.saveButton, ui.publishButton, ui.resetButton], true);
    setStatus("Restaurando borrador desde publicado...");
    setEditorFeedback("Restaurando borrador...", "progress");

    try {
        state.draft = await resetDraftFromPublished(state.user);
        state.hasUnsavedChanges = false;
        ensureForm();
        postPreview();
        updateMetaLabels();
        setStatus("");
        setEditorFeedback("Borrador restaurado", "success");
    } catch (error) {
        setStatus(error.message || "No se pudo restaurar el borrador.", true);
        setEditorFeedback("Error al restaurar", "error");
    } finally {
        setActionButtonsDisabled([ui.saveButton, ui.publishButton, ui.resetButton], false);
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
            setStatus("");
        } catch (error) {
            setStatus(error.message || "No se pudo cerrar la sesión.", true);
        }
    });

    ui.languageButton.addEventListener("click", function () {
        currentLanguage = currentLanguage === "es" ? "en" : "es";
        updateLanguageSwitch();
        closeUserMenu();
        setEditorFeedback("Idioma " + currentLanguage.toUpperCase() + " disponible pronto.", "neutral");
    });

    ui.userMenuButton.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleUserMenu();
    });

    ui.editorSearchInput.addEventListener("input", function () {
        state.editorSearchQuery = ui.editorSearchInput.value;
        if (formController) {
            formController.setSearchQuery(state.editorSearchQuery);
        }
    });

    document.addEventListener("click", function (event) {
        if (!ui.adminShell.contains(event.target)) {
            return;
        }

        if (!ui.sessionCard.contains(event.target) && event.target !== ui.userMenuButton && !ui.userMenuButton.contains(event.target)) {
            closeUserMenu();
        }
    });

    bindAdminActions({
        saveButton: ui.saveButton,
        publishButton: ui.publishButton,
        reloadButton: ui.reloadButton,
        resetButton: ui.resetButton,
        historyRefreshButton: null,
        onSave: handleSave,
        onPublish: handlePublish,
        onReload: loadAdminApp,
        onReset: handleReset,
        onHistoryRefresh: function () {}
    });

    ui.editorToggleButton.addEventListener("click", function () {
        const isCollapsed = ui.editorPanel.classList.toggle("is-collapsed");
        ui.contentGrid.classList.toggle("is-editor-collapsed", isCollapsed);
        ui.editorToggleButton.innerHTML = isCollapsed
            ? '<i class="bi bi-layout-sidebar"></i>'
            : '<i class="bi bi-layout-sidebar-inset"></i>';
        ui.editorToggleButton.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
        ui.editorToggleButton.setAttribute("aria-label", isCollapsed ? "Expandir editor" : "Colapsar editor");
    });

    ui.previewFrame.addEventListener("load", postPreview);

    window.addEventListener("message", function (event) {
        if (event.origin !== window.location.origin) {
            return;
        }

        if (event.data && event.data.type === "preview:ready") {
            postPreview();
        }
    });
}

function boot() {
    bindEvents();
    updateLanguageSwitch();

    try {
        observeAdminSession({
            onSignedOut: function () {
                state.user = null;
                setAuthenticatedShell(null);
                closeUserMenu();
                state.hasUnsavedChanges = false;
                setAuthMessage("");
                updateStatusBadge();
                setStatus("");
                setEditorFeedback("", "neutral");
            },
            onAuthorized: function (user) {
                state.user = user;
                setAuthenticatedShell(user);
                closeUserMenu();
                setAuthMessage("");
                loadAdminApp();
            },
            onDenied: function (user) {
                state.user = user;
                setDeniedShell(user);
                closeUserMenu();
                setStatus("El usuario autenticado no tiene permisos de admin.", true);
                setEditorFeedback("Acceso denegado", "error");
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
