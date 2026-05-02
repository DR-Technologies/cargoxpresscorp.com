import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
    child,
    get,
    getDatabase,
    push,
    ref,
    set,
    update
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

import { firebaseConfig, isFirebaseConfigured } from "../../js/firebase-config.js";
import {
    getArrayTemplateForContent,
    isValidContentForTemplate,
    normalizeContentForTemplate
} from "../../js/template-registry.js";

const PATHS = {
    admins: "admins",
    draft: "siteDraft/current",
    published: "sitePublished/current",
    history: "siteHistory"
};

function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getFirebaseServices() {
    if (!isFirebaseConfigured()) {
        throw new Error("Firebase no esta configurado para el panel admin.");
    }

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    return {
        app: app,
        auth: getAuth(app),
        db: getDatabase(app)
    };
}

function sanitizeForStorage(content) {
    return JSON.parse(JSON.stringify(content));
}

function buildUserMetadata(user) {
    return {
        uid: user.uid,
        email: user.email || ""
    };
}

function withDraftMetadata(content, user) {
    const output = sanitizeForStorage(content);
    const timestamp = Date.now();
    output._meta = Object.assign({}, output._meta || {}, {
        updatedAt: timestamp,
        updatedBy: buildUserMetadata(user)
    });
    return output;
}

function withPublishedMetadata(content, user) {
    const output = sanitizeForStorage(content);
    const timestamp = Date.now();
    output._meta = Object.assign({}, output._meta || {}, {
        updatedAt: timestamp,
        updatedBy: buildUserMetadata(user),
        publishedAt: timestamp,
        publishedBy: buildUserMetadata(user)
    });
    return output;
}

async function getAdminFlag(uid) {
    const services = getFirebaseServices();
    const snapshot = await get(ref(services.db, PATHS.admins + "/" + uid));
    return snapshot.val() === true;
}

async function readPath(path) {
    const services = getFirebaseServices();
    const snapshot = await get(ref(services.db, path));
    return snapshot.exists() ? snapshot.val() : null;
}

async function loadAdminSnapshot() {
    const [draft, published] = await Promise.all([
        readPath(PATHS.draft).catch(function () { return null; }),
        readPath(PATHS.published).catch(function () { return null; })
    ]);

    const draftContent = isValidContentForTemplate(draft) ? normalizeContentForTemplate(draft) : null;
    const publishedContent = isValidContentForTemplate(published) ? normalizeContentForTemplate(published) : null;

    return {
        draft: draftContent,
        published: publishedContent,
        active: draftContent || publishedContent || null
    };
}

async function saveDraft(content, user) {
    const services = getFirebaseServices();
    const payload = withDraftMetadata(normalizeContentForTemplate(content), user);
    await set(ref(services.db, PATHS.draft), payload);
    return payload;
}

async function publishDraft(content, user) {
    const services = getFirebaseServices();
    const publishedPayload = withPublishedMetadata(normalizeContentForTemplate(content), user);
    const historyRef = push(child(ref(services.db), PATHS.history));
    const updates = {};

    updates[PATHS.published] = publishedPayload;
    updates[PATHS.draft] = publishedPayload;
    updates[PATHS.history + "/" + historyRef.key] = {
        id: historyRef.key,
        createdAt: Date.now(),
        createdBy: buildUserMetadata(user),
        content: publishedPayload
    };

    await update(ref(services.db), updates);
    return publishedPayload;
}

async function resetDraftFromPublished(user) {
    const snapshot = await loadAdminSnapshot();
    const source = snapshot.published;
    if (!source) {
        throw new Error("No existe una version publicada para restaurar.");
    }
    return saveDraft(source, user);
}

async function restoreHistoryEntry(historyId, user) {
    const services = getFirebaseServices();
    const historyEntry = await readPath(PATHS.history + "/" + historyId);

    if (!historyEntry || !isValidContentForTemplate(historyEntry.content)) {
        throw new Error("La version historica seleccionada no es valida.");
    }

    const publishedPayload = withPublishedMetadata(normalizeContentForTemplate(historyEntry.content), user);
    const historyRef = push(child(ref(services.db), PATHS.history));
    const updates = {};

    updates[PATHS.published] = publishedPayload;
    updates[PATHS.draft] = publishedPayload;
    updates[PATHS.history + "/" + historyRef.key] = {
        id: historyRef.key,
        createdAt: Date.now(),
        createdBy: buildUserMetadata(user),
        restoredFrom: historyId,
        content: publishedPayload
    };

    await update(ref(services.db), updates);
    return publishedPayload;
}

async function loadHistoryEntries() {
    const history = await readPath(PATHS.history);
    if (!history || !isObject(history)) {
        return [];
    }

    return Object.keys(history).map(function (key) {
        const entry = history[key];
        return Object.assign({ id: key }, entry);
    }).sort(function (left, right) {
        return (right.createdAt || 0) - (left.createdAt || 0);
    });
}

function getArrayTemplate(path, currentValue, content) {
    return getArrayTemplateForContent(path, currentValue, content);
}

export {
    PATHS,
    getAdminFlag,
    getArrayTemplate,
    getFirebaseServices,
    loadAdminSnapshot,
    loadHistoryEntries,
    publishDraft,
    resetDraftFromPublished,
    restoreHistoryEntry,
    saveDraft
};
