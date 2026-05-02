import { loadSiteContent } from "./content-loader.js";
import { render } from "./public-render.js";

document.addEventListener("DOMContentLoaded", async function () {
    var body = document.body;

    try {
        var content = await loadSiteContent();
        if (content) {
            render(content);
            body.classList.remove("site-pending", "site-failed");
            body.classList.add("site-ready");
            return;
        }
    } catch (error) {
        console.error("[CargoXpress] Error inicializando el sitio.", error);
    }

    body.classList.remove("site-pending", "site-ready");
    body.classList.add("site-failed");
});
