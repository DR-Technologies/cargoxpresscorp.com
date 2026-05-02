const LOCAL_SITE_CONTENT_URL = new URL("../content/site-content.json", import.meta.url);

async function loadLocalContentModel() {
    const response = await fetch(LOCAL_SITE_CONTENT_URL);
    if (!response.ok) {
        throw new Error("No se pudo cargar el contenido local (" + response.status + ").");
    }

    return response.json();
}

export { LOCAL_SITE_CONTENT_URL, loadLocalContentModel };
