import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, get, ref } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";
import { isValidContentForTemplate, normalizeContentForTemplate } from "./template-registry.js";

const RTDB_PUBLISHED_PATH = "sitePublished/current";

async function loadRemoteSiteContent() {
    if (!isFirebaseConfigured()) {
        return null;
    }

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    const snapshot = await get(ref(database, RTDB_PUBLISHED_PATH));

    if (!snapshot.exists()) {
        return null;
    }

    const remoteContent = snapshot.val();
    if (isValidContentForTemplate(remoteContent)) {
        return normalizeContentForTemplate(remoteContent);
    }

    console.warn("[CargoXpress] El contenido remoto existe en Firebase RTDB pero no tiene la estructura esperada.");
    return null;
}

async function loadSiteContent() {
    try {
        const remoteContent = await loadRemoteSiteContent();
        if (remoteContent) {
            return remoteContent;
        }

        console.error("[CargoXpress] No existe contenido publicado valido en Firebase RTDB.");
        return null;
    } catch (error) {
        console.error("[CargoXpress] No se pudo cargar contenido desde Firebase RTDB.", error);
        return null;
    }
}

export { RTDB_PUBLISHED_PATH, loadSiteContent };
