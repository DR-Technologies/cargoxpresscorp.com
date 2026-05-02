import { render } from "../../js/public-render.js";

window.addEventListener("message", function (event) {
    if (event.data && event.data.type === "preview:update" && event.data.content) {
        render(event.data.content);
    }
});

window.parent.postMessage({ type: "preview:ready" }, window.location.origin);
