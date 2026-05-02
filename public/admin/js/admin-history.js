function formatDate(value) {
    if (!value) {
        return "Sin fecha";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Sin fecha";
    }

    return date.toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function renderHistory(root, viewer, entries) {
    if (!entries.length) {
        root.innerHTML = '<p class="admin-muted">Todavia no hay publicaciones registradas.</p>';
        viewer.textContent = "Selecciona un snapshot del historial para verlo aquí.";
        return;
    }

    root.innerHTML = "";
    entries.forEach(function (entry) {
        const item = document.createElement("article");
        item.className = "history-item";

        const title = document.createElement("h3");
        title.textContent = "Publicacion " + formatDate(entry.createdAt);

        const meta = document.createElement("p");
        meta.className = "history-meta";
        meta.textContent = (entry.createdBy && entry.createdBy.email ? entry.createdBy.email : "Usuario desconocido") + " · " + entry.id;

        const actions = document.createElement("div");
        actions.className = "button-row";

        const viewButton = document.createElement("button");
        viewButton.className = "button";
        viewButton.type = "button";
        viewButton.textContent = "Ver snapshot JSON";
        viewButton.addEventListener("click", function () {
            viewer.textContent = JSON.stringify(entry.content || {}, null, 2);
        });

        actions.appendChild(viewButton);
        item.appendChild(title);
        item.appendChild(meta);
        item.appendChild(actions);
        root.appendChild(item);
    });

    viewer.textContent = JSON.stringify(entries[0].content || {}, null, 2);
}

export { formatDate, renderHistory };
