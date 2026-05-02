import { DOM_HOOKS } from "./dom-hooks.js";

function getByPath(source, path) {
    return path.split(".").reduce(function (value, key) {
        return value && value[key] !== undefined ? value[key] : undefined;
    }, source);
}

function resolveImageSource(source) {
    if (!source) {
        return source;
    }

    if (/^(https?:)?\/\//i.test(source) || /^data:/i.test(source) || /^blob:/i.test(source)) {
        return source;
    }

    var normalized = String(source).replace(/^\.?\/*/, "");
    if (normalized.indexOf("images/") !== 0) {
        normalized = "images/" + normalized.replace(/^images\//, "");
    }

    return new URL(normalized, window.location.origin + "/").toString();
}

function setTextContent(root, content) {
    root.querySelectorAll(DOM_HOOKS.text).forEach(function (node) {
        var value = getByPath(content, node.dataset.text);
        if (value !== undefined) {
            node.textContent = value;
        }
    });
}

function setImages(root, content) {
    root.querySelectorAll(DOM_HOOKS.image).forEach(function (node) {
        var image = getByPath(content, node.dataset.image);
        if (image && image.src) {
            node.src = resolveImageSource(image.src);
        }
        if (image && image.alt) {
            node.alt = image.alt;
        }
    });
}

function setLinks(root, content) {
    root.querySelectorAll(DOM_HOOKS.link).forEach(function (node) {
        var value = getByPath(content, node.dataset.link);
        if (value) {
            node.href = value;
        }
    });
}

function applyTheme(content) {
    var colors = content.theme && content.theme.colors;
    if (!colors) {
        return;
    }

    var rootStyle = document.documentElement.style;

    function setVariable(name, value) {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            rootStyle.setProperty(name, value);
        }
    }

    setVariable("--brand", colors.brand);
    setVariable("--accent", colors.accent);
    setVariable("--bg", colors.background);
    setVariable("--text", colors.text);
    setVariable("--muted-text", colors.mutedText);
    setVariable("--button-color", colors.button);
    setVariable("--button-text", colors.buttonText);
    setVariable("--highlight-text", colors.highlightText);
    setVariable("--navbar-background", colors.navbarBackground);
    setVariable("--navbar-brand-text", colors.navbarBrandText);
    setVariable("--navbar-link-text", colors.navbarLinkText);
    setVariable("--card-background", colors.cardBackground);
    setVariable("--section-one-background", colors.sectionOneBackground);
    setVariable("--section-two-background", colors.sectionTwoBackground);
    setVariable("--section-three-background", colors.sectionThreeBackground);
    setVariable("--footer-background", colors.footerBackground);
    setVariable("--footer-text", colors.footerText);
    setVariable("--hero-background", colors.heroBackground);
}

function applySectionVisibility(content) {
    var sections = document.querySelectorAll(DOM_HOOKS.section);
    sections.forEach(function (section) {
        var key = section.dataset.section;
        var isVisible = content.layout.visibility[key];
        section.hidden = isVisible === false;
    });
}

function applySectionOrder(content) {
    var root = document.querySelector(DOM_HOOKS.layoutRoot);
    if (!root) {
        return;
    }

    content.layout.sectionOrder.forEach(function (sectionKey) {
        var section = root.querySelector('[data-section="' + sectionKey + '"]');
        if (section) {
            root.appendChild(section);
        }
    });
}

function setDocumentMeta(content) {
    if (content.meta && content.meta.title) {
        document.title = content.meta.title;
    }
}

export {
    applySectionOrder,
    applySectionVisibility,
    applyTheme,
    getByPath,
    resolveImageSource,
    setDocumentMeta,
    setImages,
    setLinks,
    setTextContent
};
