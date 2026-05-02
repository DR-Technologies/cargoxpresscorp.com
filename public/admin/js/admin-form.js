import { getArrayTemplate } from "./admin-data.js";
import { getTemplateDefinitionForContent } from "../../js/template-registry.js";

const EDITOR_STATE_STORAGE_KEY = "cargoxpress-admin-editor-state";

const EDITOR_MODES = [
    { id: "content", label: "Contenido" },
    { id: "design", label: "Diseño" }
];

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function setAtPath(target, path, value) {
    let current = target;
    for (let index = 0; index < path.length - 1; index += 1) {
        current = current[path[index]];
    }
    current[path[path.length - 1]] = value;
}

function removeAtPath(target, path) {
    const parentPath = path.slice(0, -1);
    const key = path[path.length - 1];
    let parent = target;
    parentPath.forEach(function (part) {
        parent = parent[part];
    });
    parent.splice(key, 1);
}

function getValue(target, path) {
    return path.reduce(function (current, part) {
        return current[part];
    }, target);
}

function humanizeKey(key) {
    return String(key)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/\b\w/g, function (letter) {
            return letter.toUpperCase();
        });
}

function shouldHideKey(key) {
    return key.charAt(0) === "_";
}

function isHexColor(value) {
    return /^#([a-f0-9]{3}|[a-f0-9]{6})$/i.test(String(value || ""));
}

function inferInputType(pathString, key, value) {
    if (typeof value === "boolean") {
        return "checkbox";
    }

    if (typeof value !== "string") {
        return "text";
    }

    if (pathString.indexOf("theme.colors.") === 0) {
        return "theme-color";
    }

    if (key === "heroBackgroundImage") {
        return "image-url";
    }

    if ((key === "src" || /image|logo|banner|background/i.test(key)) && !/heroBackground/i.test(key)) {
        return "image-url";
    }

    if (/url|link|href/i.test(key) || /^(https?:|mailto:|tel:|#)/.test(value)) {
        return "url";
    }

    if (/color|brand|accent/i.test(key) && isHexColor(value)) {
        return "color";
    }

    if (/description|subtitle|note|copy|background/i.test(key) || value.length > 120) {
        return "textarea";
    }

    return "text";
}

function isImageObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) && typeof value.src === "string";
}

function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

function resolvePreviewSource(value) {
    if (!value) {
        return "";
    }

    if (/^(https?:)?\/\//i.test(value) || /^data:/i.test(value) || /^blob:/i.test(value)) {
        return value;
    }

    const normalized = String(value).replace(/^\.?\/*/, "");
    const withFolder = normalized.indexOf("images/") === 0 ? normalized : "images/" + normalized.replace(/^images\//, "");
    return new URL(withFolder, window.location.origin + "/").toString();
}

function loadEditorState() {
    try {
        const raw = localStorage.getItem(EDITOR_STATE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        return {};
    }
}

function saveEditorState(state) {
    try {
        localStorage.setItem(EDITOR_STATE_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        // Ignore storage write issues and keep the editor functional.
    }
}

function matchesOmitPattern(relativePath, pattern) {
    const relativeString = relativePath.join(".");
    const patternParts = pattern.split(".");
    if (patternParts.length !== relativePath.length) {
        return false;
    }

    return patternParts.every(function (part, index) {
        return part === "*" || part === relativePath[index];
    });
}

function shouldOmitRelativePath(relativePath, omitList) {
    return omitList.some(function (pattern) {
        return matchesOmitPattern(relativePath, pattern);
    });
}

function shouldIncludeRelativePath(relativePath, includeList) {
    if (!includeList || !includeList.length) {
        return true;
    }

    return includeList.some(function (pattern) {
        return matchesOmitPattern(relativePath, pattern);
    });
}

function normalizePathForLookup(path) {
    return path.filter(function (segment) {
        return !/^\d+$/.test(String(segment));
    });
}

function normalizeSearchText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function valueToSearchText(value) {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value !== "object") {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value.map(valueToSearchText).join(" ");
    }

    return Object.keys(value).map(function (key) {
        return key + " " + valueToSearchText(value[key]);
    }).join(" ");
}

function getSectionInfo(sectionSchema) {
    return {
        title: sectionSchema.title,
        subtitle: sectionSchema.subtitle,
        icon: sectionSchema.icon || "bi bi-folder2-open"
    };
}

function getEntryMode(entry) {
    return entry.mode || "content";
}

function getSectionMode(sectionSchema) {
    const entries = sectionSchema.entries || [];
    return entries.length && entries.every(function (entry) {
        return getEntryMode(entry) === "design";
    }) ? "design" : "content";
}

function getVisibleEntries(sectionSchema, mode) {
    return (sectionSchema.entries || []).filter(function (entry) {
        return getEntryMode(entry) === mode;
    });
}

function buildModeSections(sectionSchemas, mode) {
    const groups = [];

    sectionSchemas.forEach(function (sectionSchema) {
        const entries = getVisibleEntries(sectionSchema, mode);
        if (!entries.length) {
            return;
        }

        if (mode === "design") {
            entries.forEach(function (entry) {
                groups.push(Object.assign({}, sectionSchema, {
                    id: "design-" + sectionSchema.id + "-" + entry.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-"),
                    title: entry.title,
                    subtitle: sectionSchema.title,
                    icon: sectionSchema.icon,
                    entries: [entry]
                }));
            });
            return;
        }

        groups.push(Object.assign({}, sectionSchema, {
            entries: entries
        }));
    });

    return groups;
}

function sortKeysByPreferredOrder(keys, preferredOrder) {
    if (!preferredOrder || !preferredOrder.length) {
        return keys;
    }

    const orderIndex = new Map();
    preferredOrder.forEach(function (key, index) {
        orderIndex.set(key, index);
    });

    return keys.slice().sort(function (left, right) {
        const leftRank = orderIndex.has(left) ? orderIndex.get(left) : Number.MAX_SAFE_INTEGER;
        const rightRank = orderIndex.has(right) ? orderIndex.get(right) : Number.MAX_SAFE_INTEGER;

        if (leftRank !== rightRank) {
            return leftRank - rightRank;
        }

        return left.localeCompare(right);
    });
}

function buildFieldShell(labelText, pathString) {
    const shell = createElement("label", "editor-field");
    const meta = createElement("div", "editor-field__meta");
    const label = createElement("span", "editor-field__label", labelText);
    meta.appendChild(label);
    shell.appendChild(meta);
    return shell;
}

function createPrimitiveField(options) {
    const pathString = options.path.join(".");
    const key = options.path[options.path.length - 1];
    const inputType = options.forceInputType || inferInputType(pathString, key, options.value);
    const labelText = options.label || options.nestedTitleResolver && options.nestedTitleResolver(options.path) || humanizeKey(key);

    if (inputType === "checkbox") {
        const wrapper = createElement("label", "editor-field editor-field--checkbox");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = Boolean(options.value);
        input.addEventListener("change", function () {
            options.onChange(options.path, input.checked);
        });

        const content = createElement("div", "editor-field__checkbox-copy");
        content.appendChild(createElement("span", "editor-field__label", labelText));
        content.appendChild(createElement("span", "editor-field__hint", "Activa u oculta este elemento."));

        wrapper.appendChild(input);
        wrapper.appendChild(content);
        return wrapper;
    }

    if (inputType === "theme-color" || inputType === "color") {
        const shell = buildFieldShell(labelText, pathString);
        let mode = inputType === "color" || isHexColor(options.value) ? "color" : "css";
        let draftHexValue = isHexColor(options.value) ? options.value : "";
        let draftCssValue = options.value || "";
        let lastCommittedHex = isHexColor(options.value) ? options.value : "#000000";
        const modeToolbar = createElement("div", "editor-field__toolbar editor-field__toolbar--tight");
        const colorModeButton = createElement("button", "button button-small button-chip", "Color");
        const cssModeButton = createElement("button", "button button-small button-chip", "CSS");
        colorModeButton.type = "button";
        cssModeButton.type = "button";
        const row = createElement("div", "color-field");
        const text = document.createElement("input");
        text.type = "text";
        text.className = "color-field__input";
        text.value = draftHexValue;
        text.placeholder = "#000000";

        const pickerWrap = createElement("div", "color-field__picker-wrap");
        const swatch = createElement("span", "color-field__swatch");
        const picker = document.createElement("input");
        picker.type = "color";
        picker.className = "color-field__preview";
        picker.value = draftHexValue || lastCommittedHex;

        const code = document.createElement("textarea");
        code.className = "editor-input color-field__code";
        code.value = draftCssValue;
        code.placeholder = "Escribe aqui un valor CSS. Ejemplo: linear-gradient(...)";

        function commitColor(nextValue) {
            if (!isHexColor(nextValue)) {
                return;
            }

            draftHexValue = nextValue;
            draftCssValue = nextValue;
            lastCommittedHex = nextValue;
            text.value = nextValue;
            code.value = nextValue;
            picker.value = nextValue;
            swatch.style.background = nextValue;
            options.onChange(options.path, nextValue);
        }

        function commitCss(nextValue) {
            if (!String(nextValue || "").trim()) {
                return;
            }

            draftCssValue = nextValue;
            code.value = nextValue;
            options.onChange(options.path, nextValue);
        }

        function syncModeState() {
            row.style.display = mode === "color" ? "grid" : "none";
            code.style.display = mode === "css" ? "block" : "none";
            colorModeButton.classList.toggle("is-active", mode === "color");
            cssModeButton.classList.toggle("is-active", mode === "css");
            if (mode === "color") {
                text.value = draftHexValue;
                picker.value = draftHexValue || lastCommittedHex;
                swatch.style.background = draftHexValue || lastCommittedHex;
            } else {
                code.value = draftCssValue;
            }
        }

        colorModeButton.addEventListener("click", function () {
            if (mode === "color") {
                return;
            }

            mode = "color";
            syncModeState();
        });

        cssModeButton.addEventListener("click", function () {
            if (mode === "css") {
                return;
            }

            mode = "css";
            syncModeState();
        });

        picker.addEventListener("input", function () {
            draftHexValue = picker.value;
            text.value = picker.value;
            swatch.style.background = picker.value;
        });

        picker.addEventListener("change", function () {
            commitColor(picker.value);
        });

        text.addEventListener("input", function () {
            draftHexValue = text.value;
            if (isHexColor(text.value)) {
                picker.value = text.value;
                swatch.style.background = text.value;
            }
        });

        code.addEventListener("input", function () {
            draftCssValue = code.value;
        });

        text.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                commitColor(text.value);
            }
        });

        text.addEventListener("blur", function () {
            commitColor(text.value);
        });

        code.addEventListener("keydown", function (event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                commitCss(code.value);
            }
        });

        code.addEventListener("blur", function () {
            commitCss(code.value);
        });

        modeToolbar.appendChild(colorModeButton);
        modeToolbar.appendChild(cssModeButton);
        shell.appendChild(modeToolbar);
        row.appendChild(text);
        pickerWrap.appendChild(swatch);
        pickerWrap.appendChild(picker);
        row.appendChild(pickerWrap);
        shell.appendChild(row);
        shell.appendChild(code);
        syncModeState();
        return shell;
    }

    const shell = buildFieldShell(labelText, pathString);
    let input;

    if (inputType === "textarea") {
        input = document.createElement("textarea");
        input.value = options.value || "";
    } else {
        input = document.createElement("input");
        input.type = inputType === "image-url" ? "url" : inputType;
        input.value = options.value || "";
    }

    input.className = "editor-input";
    input.addEventListener("input", function () {
        options.onChange(options.path, input.value);
    });

    shell.appendChild(input);

    if (inputType === "image-url") {
        const toolbar = createElement("div", "editor-field__toolbar");

        const uploadButton = createElement("button", "button button-primary button-small", "Subir imagen");
        uploadButton.type = "button";
        uploadButton.addEventListener("click", async function () {
            const uploadedUrl = await options.onUpload(pathString);
            if (uploadedUrl) {
                input.value = uploadedUrl;
                preview.src = resolvePreviewSource(uploadedUrl);
                preview.hidden = false;
                options.onChange(options.path, uploadedUrl);
            }
        });

        const clearButton = createElement("button", "button button-small button-danger-subtle", "Limpiar");
        clearButton.type = "button";
        clearButton.addEventListener("click", function () {
            input.value = "";
            preview.src = "";
            preview.hidden = true;
            options.onChange(options.path, "");
        });

        toolbar.appendChild(uploadButton);
        toolbar.appendChild(clearButton);
        shell.appendChild(toolbar);

        const preview = document.createElement("img");
        preview.className = "image-preview";
        preview.alt = labelText;
        preview.src = resolvePreviewSource(options.value || "");
        preview.hidden = !options.value;
        shell.appendChild(preview);

        input.addEventListener("input", function () {
            preview.src = resolvePreviewSource(input.value);
            preview.hidden = !input.value;
        });
    }

    return shell;
}

function createImageObjectField(options) {
    const wrapper = createElement("section", "nested-group nested-group--image");
    const header = createElement("div", "nested-group__header");
    header.appendChild(createElement("div", "nested-group__title", options.title || options.nestedTitleResolver && options.nestedTitleResolver(options.path) || humanizeKey(options.path[options.path.length - 1])));
    wrapper.appendChild(header);

    const children = createElement("div", "nested-group__body");
    sortKeysByPreferredOrder(Object.keys(options.value), options.childOrder).forEach(function (key) {
        if (shouldHideKey(key) || options.shouldHide && options.shouldHide(options.path.concat(key))) {
            return;
        }

        children.appendChild(createNode(Object.assign({}, options, {
            path: options.path.concat(key),
            value: options.value[key]
        })));
    });
    wrapper.appendChild(children);
    return wrapper;
}

function createArrayField(options) {
    const pathString = options.path.join(".");
    const key = options.path[options.path.length - 1];
    const arrayControl = options.arrayControl || {};
    const canAddItems = pathString !== "layout.sectionOrder" && arrayControl.allowAdd !== false;
    const canRemoveItems = pathString !== "layout.sectionOrder" && arrayControl.allowRemove !== false;
    const wrapper = createElement("section", "nested-group nested-group--array");
    const header = createElement("div", "nested-group__header nested-group__header--array");
    const titleWrap = createElement("div", "nested-group__title-wrap");
    const title = options.title || options.nestedTitleResolver && options.nestedTitleResolver(options.path) || humanizeKey(key);
    titleWrap.appendChild(createElement("div", "nested-group__title", title));
    titleWrap.appendChild(createElement("div", "nested-group__subtitle", options.value.length + " elemento(s)"));

        const actions = createElement("div", "button-row");
        if (canAddItems) {
            const addButton = createElement("button", "button button-small", "Agregar");
            addButton.type = "button";
            addButton.addEventListener("click", function () {
                options.onArrayAdd(options.path, getArrayTemplate(pathString, options.value, options.content));
            });
            actions.appendChild(addButton);
        }

    header.appendChild(titleWrap);
    header.appendChild(actions);
    wrapper.appendChild(header);

    const list = createElement("div", "array-items");
    if (!options.value.length) {
        list.appendChild(createElement("p", "editor-empty-state", "Sin elementos."));
        wrapper.appendChild(list);
        return wrapper;
    }

    options.value.forEach(function (itemValue, index) {
        const itemPath = options.path.concat(index);
        const item = createElement("article", "array-item");
        const itemHeader = createElement("div", "array-item-header");
        const titleBlock = createElement("div", "array-item-title-block");
        titleBlock.appendChild(createElement("div", "array-item-title", humanizeKey(key) + " " + (index + 1)));

        const controls = createElement("div", "button-row");

        const upButton = createElement("button", "button button-icon", "");
        upButton.type = "button";
        upButton.innerHTML = '<i class="bi bi-arrow-up"></i>';
        upButton.disabled = index === 0;
        upButton.setAttribute("aria-label", "Mover arriba");
        upButton.addEventListener("click", function () {
            options.onArrayMove(options.path, index, -1);
        });

        const downButton = createElement("button", "button button-icon", "");
        downButton.type = "button";
        downButton.innerHTML = '<i class="bi bi-arrow-down"></i>';
        downButton.disabled = index === options.value.length - 1;
        downButton.setAttribute("aria-label", "Mover abajo");
        downButton.addEventListener("click", function () {
            options.onArrayMove(options.path, index, 1);
        });

        controls.appendChild(upButton);
        controls.appendChild(downButton);

        if (canRemoveItems) {
            const removeButton = createElement("button", "button button-icon button-danger-subtle", "");
            removeButton.type = "button";
            removeButton.innerHTML = '<i class="bi bi-trash3"></i>';
            removeButton.setAttribute("aria-label", "Eliminar");
            removeButton.addEventListener("click", function () {
                options.onArrayRemove(itemPath);
            });
            controls.appendChild(removeButton);
        }

        itemHeader.appendChild(titleBlock);
        itemHeader.appendChild(controls);
        item.appendChild(itemHeader);

        if (pathString === "layout.sectionOrder") {
            item.appendChild(createElement("span", "code-chip", String(itemValue)));
        } else if (itemValue && typeof itemValue === "object" && !Array.isArray(itemValue)) {
            const body = createElement("div", "group-children");
            sortKeysByPreferredOrder(Object.keys(itemValue), options.childOrder).forEach(function (childKey) {
                if (shouldHideKey(childKey) || options.shouldHide && options.shouldHide(itemPath.concat(childKey))) {
                    return;
                }

                body.appendChild(createNode(Object.assign({}, options, {
                    path: itemPath.concat(childKey),
                    value: itemValue[childKey],
                    label: options.itemFieldLabels && options.itemFieldLabels[childKey]
                })));
            });
            item.appendChild(body);
        } else {
            item.appendChild(createNode(Object.assign({}, options, {
                path: itemPath,
                value: itemValue
            })));
        }

        list.appendChild(item);
    });

    wrapper.appendChild(list);
    return wrapper;
}

function createObjectField(options) {
    const wrapper = createElement("section", "nested-group");
    const title = options.title || options.nestedTitleResolver && options.nestedTitleResolver(options.path) || humanizeKey(options.path[options.path.length - 1] || "Contenido");
    const header = createElement("div", "nested-group__header");
    header.appendChild(createElement("div", "nested-group__title", title));
    if (options.subtitle) {
        header.appendChild(createElement("div", "nested-group__subtitle", options.subtitle));
    }
    wrapper.appendChild(header);

    const body = createElement("div", "nested-group__body");
    sortKeysByPreferredOrder(Object.keys(options.value), options.childOrder).forEach(function (key) {
        if (shouldHideKey(key) || options.shouldHide && options.shouldHide(options.path.concat(key))) {
            return;
        }

        body.appendChild(createNode(Object.assign({}, options, {
            path: options.path.concat(key),
            value: options.value[key]
        })));
    });
    wrapper.appendChild(body);
    return wrapper;
}

function getChildOption(childKey, entry, propertyName) {
    const collection = entry[propertyName];
    return collection ? collection[childKey] : undefined;
}

function getNestedTitle(entry, absolutePath) {
    if (!entry.nestedTitles) {
        return undefined;
    }

    const relativePath = normalizePathForLookup(absolutePath.slice(entry.path.length)).join(".");
    return entry.nestedTitles[relativePath];
}

function getNestedOrder(entry, absolutePath) {
    if (!entry.nestedOrders) {
        return undefined;
    }

    const relativePath = normalizePathForLookup(absolutePath.slice(entry.path.length)).join(".");
    return entry.nestedOrders[relativePath];
}

function getArrayControl(entry, absolutePath) {
    if (!entry.arrayControls) {
        return undefined;
    }

    const relativePath = normalizePathForLookup(absolutePath.slice(entry.path.length)).join(".");
    return entry.arrayControls[relativePath];
}

function createNode(options) {
    if (Array.isArray(options.value)) {
        return createArrayField(options);
    }

    if (isImageObject(options.value)) {
        return createImageObjectField(options);
    }

    if (options.value && typeof options.value === "object") {
        return createObjectField(options);
    }

    return createPrimitiveField(options);
}

function createAdminForm(root, config) {
    const templateDefinition = getTemplateDefinitionForContent(config.getContent());
    const sectionSchemas = templateDefinition.editableSchema.sections;
    const savedEditorState = loadEditorState();
    let activeMode = savedEditorState.activeMode || "content";
    let activeSectionId = savedEditorState.activeSectionId || {};
    let searchQuery = config.searchQuery || "";

    function persistEditorState() {
        saveEditorState({
            activeMode: activeMode,
            activeSectionId: activeSectionId
        });
    }

    function update(mutator, options) {
        const nextContent = deepClone(config.getContent());
        mutator(nextContent);
        config.setContent(nextContent);
        if (options && options.rerender) {
            render();
        }
    }

    async function handleUpload(pathString) {
        try {
            return await config.onUpload(pathString);
        } catch (error) {
            config.onMessage(error.message || "No se pudo subir la imagen.", true);
            return null;
        }
    }

    function getEntryValue(content, path) {
        try {
            return getValue(content, path);
        } catch (error) {
            return undefined;
        }
    }

    function createEntryShouldHide(entryPath, omitList, includeList) {
        return function (absolutePath) {
            if (absolutePath.length <= entryPath.length) {
                return false;
            }

            const relativePath = absolutePath.slice(entryPath.length);
            return shouldOmitRelativePath(relativePath, omitList) || !shouldIncludeRelativePath(relativePath, includeList);
        };
    }

    function getEntrySearchText(entry) {
        const value = getEntryValue(config.getContent(), entry.path);
        return normalizeSearchText([
            entry.title,
            entry.label,
            entry.subtitle,
            entry.path.join("."),
            valueToSearchText(value)
        ].join(" "));
    }

    function sectionMatchesSearch(sectionSchema) {
        const query = normalizeSearchText(searchQuery).trim();
        if (!query) {
            return true;
        }

        const sectionText = normalizeSearchText([
            sectionSchema.title,
            sectionSchema.subtitle,
            sectionSchema.id
        ].join(" "));

        return sectionText.indexOf(query) !== -1 || sectionSchema.entries.some(function (entry) {
            return getEntrySearchText(entry).indexOf(query) !== -1;
        });
    }

    function getModeSections(mode) {
        return buildModeSections(sectionSchemas, mode);
    }

    function getCurrentModeSections() {
        return getModeSections(activeMode);
    }

    function getFilteredSections() {
        const query = normalizeSearchText(searchQuery).trim();
        let sections = getCurrentModeSections().filter(sectionMatchesSearch);

        if (!query || sections.length) {
            return sections;
        }

        const fallbackMode = EDITOR_MODES.find(function (mode) {
            return mode.id !== activeMode && getModeSections(mode.id).some(sectionMatchesSearch);
        });

        if (!fallbackMode) {
            return sections;
        }

        activeMode = fallbackMode.id;
        persistEditorState();
        sections = getCurrentModeSections().filter(sectionMatchesSearch);
        return sections;
    }

    function ensureActiveSection(sections) {
        if (!sections.length) {
            return null;
        }

        const currentId = activeSectionId[activeMode];
        const existing = sections.find(function (sectionSchema) {
            return sectionSchema.id === currentId;
        });

        if (existing) {
            return existing;
        }

        activeSectionId[activeMode] = sections[0].id;
        persistEditorState();
        return sections[0];
    }

    function createSharedHandlers() {
        return {
            onUpload: handleUpload,
            onFeedback: config.onFeedback,
            onChange: function (path, nextValue) {
                update(function (draft) {
                    setAtPath(draft, path, nextValue);
                });
            },
            onArrayAdd: function (path, template) {
                update(function (draft) {
                    getValue(draft, path).push(template);
                }, { rerender: true });
            },
            onArrayRemove: function (path) {
                update(function (draft) {
                    removeAtPath(draft, path);
                }, { rerender: true });
            },
            onArrayMove: function (path, index, offset) {
                update(function (draft) {
                    const array = getValue(draft, path);
                    const item = array.splice(index, 1)[0];
                    array.splice(index + offset, 0, item);
                }, { rerender: true });
            }
        };
    }

    function createEntryNode(entry, sharedHandlers) {
        const value = getEntryValue(config.getContent(), entry.path);
        if (value === undefined && entry.optional) {
            return null;
        }

        const omitList = entry.omit || [];
        const includeList = entry.include || [];
        const shouldHide = createEntryShouldHide(entry.path, omitList, includeList);
        const key = entry.path[entry.path.length - 1];

        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return createNode(Object.assign({}, sharedHandlers, {
                path: entry.path,
                value: value,
                label: entry.label || humanizeKey(key),
                shouldHide: shouldHide
            }));
        }

        if (isImageObject(value)) {
            return createImageObjectField(Object.assign({}, sharedHandlers, {
                path: entry.path,
                value: value,
                title: entry.title,
                shouldHide: shouldHide
            }));
        }

        if (Array.isArray(value)) {
            return createArrayField(Object.assign({}, sharedHandlers, {
                path: entry.path,
                value: value,
                content: config.getContent(),
                title: entry.title,
                childOrder: entry.childOrder || getNestedOrder(entry, entry.path),
                arrayControl: getArrayControl(entry, entry.path),
                itemFieldLabels: entry.itemFieldLabels,
                nestedTitleResolver: function (absolutePath) {
                    return getNestedTitle(entry, absolutePath);
                },
                shouldHide: shouldHide
            }));
        }

        if (entry.unwrap) {
            const fragment = document.createDocumentFragment();
            sortKeysByPreferredOrder(Object.keys(value), entry.childOrder).forEach(function (childKey) {
                if (shouldHideKey(childKey) || shouldHide(entry.path.concat(childKey))) {
                    return;
                }

                fragment.appendChild(createNode(Object.assign({}, sharedHandlers, {
                    path: entry.path.concat(childKey),
                    value: value[childKey],
                    title: getChildOption(childKey, entry, "childTitles"),
                    subtitle: getChildOption(childKey, entry, "childSubtitles"),
                    label: getChildOption(childKey, entry, "childLabels"),
                    childOrder: getNestedOrder(entry, entry.path.concat(childKey)),
                    arrayControl: getArrayControl(entry, entry.path.concat(childKey)),
                    nestedTitleResolver: function (absolutePath) {
                        return getNestedTitle(entry, absolutePath);
                    },
                    shouldHide: shouldHide
                })));
            });
            return fragment;
        }

        return createObjectField(Object.assign({}, sharedHandlers, {
            path: entry.path,
            value: value,
            title: entry.title,
            subtitle: entry.subtitle,
            childOrder: entry.childOrder || getNestedOrder(entry, entry.path),
            nestedTitleResolver: function (absolutePath) {
                return getNestedTitle(entry, absolutePath);
            },
            shouldHide: shouldHide
        }));
    }

    function createSectionNavItem(sectionSchema, isActive) {
        const meta = getSectionInfo(sectionSchema);
        const item = createElement("button", "editor-section-nav__item", "");
        item.type = "button";
        item.title = meta.title;
        item.setAttribute("aria-label", meta.title);
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-current", isActive ? "true" : "false");

        const icon = createElement("span", "editor-section-nav__icon");
        icon.innerHTML = '<i class="' + meta.icon + '"></i>';

        item.appendChild(icon);
        item.addEventListener("click", function () {
            activeSectionId[activeMode] = sectionSchema.id;
            persistEditorState();
            render();
        });

        return item;
    }

    function createModeTabs() {
        const tabs = createElement("div", "editor-mode-tabs");
        EDITOR_MODES.forEach(function (mode) {
            const button = createElement("button", "editor-mode-tab", mode.label);
            const isActive = mode.id === activeMode;
            button.type = "button";
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", isActive ? "true" : "false");
            button.addEventListener("click", function () {
                if (activeMode === mode.id) {
                    return;
                }

                activeMode = mode.id;
                persistEditorState();
                render();
            });
            tabs.appendChild(button);
        });

        return tabs;
    }

    function createSectionDetail(sectionSchema) {
        const detail = createElement("section", "editor-section-detail");
        const meta = getSectionInfo(sectionSchema);
        const header = createElement("div", "editor-section-detail__header");
        header.appendChild(createElement("h2", "editor-section-detail__title", meta.title));
        header.appendChild(createElement("p", "editor-section-detail__subtitle", meta.subtitle));
        detail.appendChild(header);

        const body = createElement("div", "editor-section-detail__body");
        const sharedHandlers = createSharedHandlers();
        sectionSchema.entries.forEach(function (entry) {
            const node = createEntryNode(entry, sharedHandlers);
            if (node) {
                body.appendChild(node);
            }
        });
        detail.appendChild(body);
        return detail;
    }

    function render() {
        root.innerHTML = "";
        const filteredSections = getFilteredSections();
        const activeSection = ensureActiveSection(filteredSections);
        root.appendChild(createModeTabs());
        const layout = createElement("div", "editor-workspace");

        const rail = createElement("aside", "editor-section-nav");
        const list = createElement("div", "editor-section-nav__list");
        filteredSections.forEach(function (sectionSchema) {
            list.appendChild(createSectionNavItem(sectionSchema, activeSection && activeSection.id === sectionSchema.id));
        });
        rail.appendChild(list);
        layout.appendChild(rail);

        const content = createElement("div", "editor-workspace__content");
        if (activeSection) {
            content.appendChild(createSectionDetail(activeSection));
        } else {
            content.appendChild(createElement("p", "editor-empty-state editor-empty-state--search", "No se encontraron campos."));
        }
        layout.appendChild(content);

        root.appendChild(layout);
    }

    function setSearchQuery(nextQuery) {
        searchQuery = nextQuery || "";
        render();
    }

    return {
        render: render,
        setSearchQuery: setSearchQuery
    };
}

export { createAdminForm };
