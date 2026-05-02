import { DOM_HOOKS } from "../dom-hooks.js";

const TEMPLATE_ID = "cargoxpress-single-page-v1";

const OPTIONAL_DEFAULTS = {
    templateId: TEMPLATE_ID,
    templateType: "single-page",
    theme: {
        colors: {
            brand: "#1F2340",
            accent: "#C1121F",
            background: "#F7F8FA",
            text: "#0F172A",
            mutedText: "rgba(15, 23, 42, .7)",
            button: "#1F2340",
            buttonText: "#ffffff",
            highlightText: "#1F2340",
            navbarBackground: "rgba(255, 255, 255, .9)",
            navbarBrandText: "#000000",
            navbarLinkText: "rgba(0, 0, 0, .65)",
            cardBackground: "#ffffff",
            sectionOneBackground: "transparent",
            sectionTwoBackground: "transparent",
            sectionThreeBackground: "transparent",
            footerBackground: "#ffffff",
            footerText: "rgba(15, 23, 42, .7)",
            heroBackground: "radial-gradient(1200px 600px at 20% 10%, rgba(31, 35, 64, .18), transparent), radial-gradient(900px 500px at 90% 20%, rgba(193, 18, 31, .12), transparent), #fff"
        }
    },
    socials: [],
    media: {
        heroBackgroundImage: "",
        banners: [],
        serviceImages: []
    }
};

const ARRAY_TEMPLATES = {
    socials: {
        label: "",
        url: "",
        icon: "bi bi-instagram"
    },
    "media.banners": {
        src: "",
        alt: "",
        link: ""
    },
    "media.serviceImages": {
        src: "",
        alt: "",
        label: ""
    }
};

const EDITABLE_SECTIONS = [
    {
        id: "branding",
        title: "Branding",
        subtitle: "Logo, nombre de marca, meta y colores globales.",
        icon: "bi bi-badge-ad",
        entries: [
            { path: ["branding"], title: "Branding", unwrap: true },
            { path: ["navbar", "brandName"], label: "Brand Name" },
            { path: ["meta"], title: "Meta" },
            {
                path: ["theme", "colors"],
                title: "Textos",
                mode: "design",
                include: ["text", "mutedText", "highlightText"],
                nestedTitles: {
                    text: "Texto Principal",
                    mutedText: "Texto Secundario",
                    highlightText: "Texto Destacado"
                },
                childOrder: ["text", "mutedText", "highlightText"]
            },
            {
                path: ["theme", "colors"],
                title: "Botones",
                mode: "design",
                include: ["button", "buttonText"],
                nestedTitles: {
                    button: "Fondo Botones",
                    buttonText: "Texto Botones"
                },
                childOrder: ["button", "buttonText"]
            },
            {
                path: ["theme", "colors"],
                title: "Fondos",
                mode: "design",
                include: ["cardBackground", "heroBackground", "sectionOneBackground", "sectionTwoBackground", "sectionThreeBackground"],
                nestedTitles: {
                    cardBackground: "Fondo Cards",
                    heroBackground: "Fondo Hero",
                    sectionOneBackground: "Fondo Seccion 1",
                    sectionTwoBackground: "Fondo Seccion 2",
                    sectionThreeBackground: "Fondo Seccion 3"
                },
                childOrder: ["cardBackground", "heroBackground", "sectionOneBackground", "sectionTwoBackground", "sectionThreeBackground"]
            },
            {
                path: ["theme", "colors"],
                title: "NavBar",
                mode: "design",
                include: ["navbarBackground", "navbarBrandText", "navbarLinkText"],
                nestedTitles: {
                    navbarBackground: "Fondo NavBar",
                    navbarBrandText: "Texto Marca",
                    navbarLinkText: "Texto Links"
                },
                childOrder: ["navbarBackground", "navbarBrandText", "navbarLinkText"]
            },
            {
                path: ["theme", "colors"],
                title: "Footer",
                mode: "design",
                include: ["footerBackground", "footerText"],
                nestedTitles: {
                    footerBackground: "Fondo Footer",
                    footerText: "Texto Footer"
                },
                childOrder: ["footerBackground", "footerText"]
            }
        ]
    },
    {
        id: "navbar",
        title: "NavBar",
        subtitle: "Enlaces de navegación y CTA principal.",
        icon: "bi bi-menu-button-wide",
        entries: [
            {
                path: ["navbar"],
                title: "NavBar",
                omit: ["brandName", "brandLink"],
                unwrap: true,
                childTitles: {
                    items: "Menu"
                },
                childOrder: ["items", "cta"]
            }
        ]
    },
    {
        id: "hero",
        title: "Hero",
        subtitle: "Contenido principal de apertura.",
        icon: "bi bi-stars",
        entries: [
            {
                path: ["hero"],
                title: "Hero",
                unwrap: true,
                childTitles: {
                    badge: "Badge",
                    title: "Title",
                    subtitle: "Subtitle",
                    primaryCta: "Primary Cta",
                    secondaryCta: "Secondary Cta",
                    contactCard: "Contact Card",
                    stats: "Stats"
                },
                childOrder: ["badge", "title", "subtitle", "primaryCta", "secondaryCta", "contactCard", "stats"],
                nestedTitles: {
                    "contactCard.title": "Title",
                    "contactCard.subtitle": "Subtitle",
                    "contactCard.button": "Button"
                },
                nestedOrders: {
                    contactCard: ["title", "subtitle", "button"]
                },
                arrayControls: {
                    stats: {
                        allowAdd: false,
                        allowRemove: false
                    }
                }
            }
        ]
    },
    {
        id: "section-1",
        title: "Sección 1",
        subtitle: "Bloque principal actualmente usado para Servicios.",
        icon: "bi bi-grid-1x2",
        entries: [
            {
                path: ["howItWorks"],
                title: "Sección 1",
                unwrap: true,
                childTitles: {
                    heading: "Heading",
                    subheading: "Subheading",
                    steps: "Steps",
                    note: "Note",
                    cta: "Cta"
                },
                childOrder: ["heading", "subheading", "steps", "note", "cta"],
                nestedTitles: {
                    "steps.icon": "Icon",
                    "steps.title": "Title",
                    "steps.description": "Description"
                },
                nestedOrders: {
                    steps: ["icon", "title", "description"]
                },
                arrayControls: {
                    steps: {
                        allowAdd: false,
                        allowRemove: false
                    }
                }
            }
        ]
    },
    {
        id: "section-2",
        title: "Sección 2",
        subtitle: "Bloque principal actualmente usado para Beneficios.",
        icon: "bi bi-grid-1x2",
        entries: [
            {
                path: ["benefits"],
                title: "Sección 2",
                unwrap: true,
                childTitles: {
                    heading: "Heading",
                    title: "Title",
                    items: "Items",
                    image: "Image"
                },
                childOrder: ["heading", "title", "items", "image"],
                arrayControls: {
                    items: {
                        allowAdd: false,
                        allowRemove: false
                    }
                }
            }
        ]
    },
    {
        id: "section-3",
        title: "Sección 3",
        subtitle: "Bloque principal actualmente usado para Contacto.",
        icon: "bi bi-grid-1x2",
        entries: [
            {
                path: ["contact"],
                title: "Sección 3",
                omit: ["actions.*.classes", "actions.*.type"],
                unwrap: true,
                childTitles: {
                    heading: "Heading",
                    subheading: "Subheading",
                    attentionTitle: "Attention Title",
                    actions: "Actions",
                    schedule: "Schedule",
                    support: "Support",
                    registerCard: "Register Card"
                },
                childOrder: ["heading", "subheading", "attentionTitle", "actions", "schedule", "support", "registerCard"],
                nestedTitles: {
                    "registerCard.title": "Title",
                    "registerCard.description": "Description",
                    "registerCard.cta": "Cta",
                    "registerCard.note": "Note"
                },
                nestedOrders: {
                    registerCard: ["title", "description", "cta", "note"]
                },
                arrayControls: {
                    actions: {
                        allowAdd: false,
                        allowRemove: false
                    }
                }
            }
        ]
    },
    {
        id: "footer",
        title: "Footer",
        subtitle: "Mensajes finales y legales.",
        icon: "bi bi-layout-text-sidebar-reverse",
        entries: [
            { path: ["footer"], title: "Footer", unwrap: true }
        ]
    },
    {
        id: "socials",
        title: "Redes Sociales",
        subtitle: "Accesos sociales y elementos flotantes.",
        icon: "bi bi-share",
        entries: [
            { path: ["floatingWhatsapp"], title: "Socials", unwrap: true }
        ]
    }
];

function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function mergeDefaults(base, defaults) {
    const output = deepClone(base);
    Object.keys(defaults).forEach(function (key) {
        const defaultValue = defaults[key];
        if (output[key] === undefined) {
            output[key] = deepClone(defaultValue);
            return;
        }

        if (isObject(defaultValue) && isObject(output[key])) {
            output[key] = mergeDefaults(output[key], defaultValue);
        }
    });
    return output;
}

function isValidContent(content) {
    return isObject(content) &&
        (content.templateId === undefined || content.templateId === TEMPLATE_ID) &&
        isObject(content.meta) &&
        typeof content.meta.title === "string" &&
        isObject(content.theme) &&
        isObject(content.theme.colors) &&
        isObject(content.navbar) &&
        Array.isArray(content.navbar.items) &&
        isObject(content.hero) &&
        typeof content.hero.title === "string" &&
        isObject(content.layout) &&
        Array.isArray(content.layout.sectionOrder) &&
        isObject(content.layout.visibility);
}

function normalizeContent(content) {
    const source = isValidContent(content) ? content : {};
    const output = mergeDefaults(source, OPTIONAL_DEFAULTS);
    output.templateId = TEMPLATE_ID;
    output.templateType = "single-page";
    return output;
}

function getByPath(source, path) {
    return path.split(".").reduce(function (value, key) {
        return value && value[key] !== undefined ? value[key] : undefined;
    }, source);
}

function isBlank(value) {
    return value === undefined || value === null || String(value).trim() === "";
}

function isValidUrlValue(value) {
    if (isBlank(value)) {
        return true;
    }

    const text = String(value).trim();
    if (/^#[-\w]+$/.test(text) || /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(text) || /^tel:\+?[0-9()\-\s]+$/i.test(text)) {
        return true;
    }

    try {
        const parsed = new URL(text);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (error) {
        return false;
    }
}

function supportsCssValue(property, value) {
    if (isBlank(value)) {
        return false;
    }

    if (typeof CSS !== "undefined" && CSS.supports) {
        return CSS.supports(property, String(value));
    }

    return true;
}

function collectUrlFields(value, path, output) {
    if (!value || typeof value !== "object") {
        return;
    }

    Object.keys(value).forEach(function (key) {
        const nextPath = path.concat(key);
        const nextValue = value[key];
        if (key === "url" || key === "href" || key === "link") {
            output.push({
                path: nextPath.join("."),
                value: nextValue
            });
        }

        if (nextValue && typeof nextValue === "object") {
            collectUrlFields(nextValue, nextPath, output);
        }
    });
}

function createIssue(type, path, label, message) {
    return {
        type: type,
        path: path,
        label: label,
        message: message
    };
}

function validateContent(content) {
    const normalized = normalizeContent(content);
    const issues = [];

    [
        ["meta.title", "Meta Title"],
        ["navbar.brandName", "Brand Name"],
        ["hero.title", "Hero Title"],
        ["hero.subtitle", "Hero Subtitle"],
        ["howItWorks.heading", "Seccion 1 Heading"],
        ["benefits.heading", "Seccion 2 Heading"],
        ["contact.heading", "Seccion 3 Heading"],
        ["footer.copy", "Footer Copy"]
    ].forEach(function (item) {
        if (isBlank(getByPath(normalized, item[0]))) {
            issues.push(createIssue("required", item[0], item[1], "Este campo es obligatorio."));
        }
    });

    [
        ["branding.logo.src", "Logo"],
        ["benefits.image.src", "Imagen de Seccion 2"]
    ].forEach(function (item) {
        if (isBlank(getByPath(normalized, item[0]))) {
            issues.push(createIssue("image", item[0], item[1], "Esta imagen es obligatoria."));
        }
    });

    const urlFields = [];
    collectUrlFields(normalized, [], urlFields);
    urlFields.forEach(function (field) {
        if (!isValidUrlValue(field.value)) {
            issues.push(createIssue("url", field.path, field.path, "La URL no tiene un formato valido."));
        }
    });

    const colorRules = {
        text: "color",
        mutedText: "color",
        button: "background",
        buttonText: "color",
        highlightText: "color",
        navbarBackground: "background",
        navbarBrandText: "color",
        navbarLinkText: "color",
        cardBackground: "background",
        sectionOneBackground: "background",
        sectionTwoBackground: "background",
        sectionThreeBackground: "background",
        footerBackground: "background",
        footerText: "color",
        heroBackground: "background"
    };

    Object.keys(colorRules).forEach(function (key) {
        const value = normalized.theme.colors[key];
        if (!supportsCssValue(colorRules[key], value)) {
            issues.push(createIssue("css", "theme.colors." + key, key, "El valor CSS no parece valido."));
        }
    });

    return {
        valid: issues.length === 0,
        issues: issues
    };
}

function renderTemplate(root, content, helpers) {
    helpers.setDocumentMeta(content);
    helpers.applyTheme(content);
    helpers.setTextContent(root, content);
    helpers.setImages(root, content);
    helpers.setLinks(root, content);

    const navContainer = root.querySelector(DOM_HOOKS.navItems);
    if (navContainer) {
        navContainer.innerHTML = content.navbar.items.map(function (item) {
            return '' +
                '<li class="nav-item">' +
                '<a class="nav-link" href="' + item.url + '">' + item.label + "</a>" +
                "</li>";
        }).join("") + (
            '<li class="nav-item ms-lg-2">' +
            '<a class="btn btn-brand text-white px-3" href="' + content.navbar.cta.url + '" target="_blank" rel="noopener">' +
            content.navbar.cta.label +
            "</a>" +
            "</li>"
        );
    }

    const heroStats = root.querySelector(DOM_HOOKS.heroStats);
    if (heroStats) {
        heroStats.innerHTML = content.hero.stats.map(function (stat) {
            return '' +
                '<div class="col-4">' +
                '<div class="h4 fw-bold mb-0">' + stat.value + "</div>" +
                '<div class="small muted">' + stat.label + "</div>" +
                "</div>";
        }).join("");
    }

    const howSteps = root.querySelector(DOM_HOOKS.howSteps);
    if (howSteps) {
        howSteps.innerHTML = content.howItWorks.steps.map(function (step) {
            return '' +
                '<div class="col-md-4">' +
                '<div class="card p-4 h-100 feature-card">' +
                '<div class="fs-2 mb-2"><i class="' + step.icon + '"></i></div>' +
                '<h5 class="fw-semibold">' + step.title + "</h5>" +
                '<p class="muted mb-0">' + step.description + "</p>" +
                "</div>" +
                "</div>";
        }).join("");
    }

    const benefitItems = root.querySelector(DOM_HOOKS.benefitItems);
    if (benefitItems) {
        benefitItems.innerHTML = content.benefits.items.map(function (item) {
            return '' +
                '<li class="d-flex gap-3 py-2">' +
                '<i class="bi bi-check2-circle text-success"></i>' +
                "<span><b>" + item.strong + "</b> " + item.text + "</span>" +
                "</li>";
        }).join("");
    }

    const contactActions = root.querySelector(DOM_HOOKS.contactActions);
    if (contactActions) {
        contactActions.innerHTML = content.contact.actions.map(function (action) {
            var attrs = "";
            if (action.type === "whatsapp") {
                attrs = ' target="_blank" rel="noopener"';
            }

            return '' +
                '<a class="' + action.classes + '" href="' + action.url + '"' + attrs + ">" +
                '<i class="' + action.icon + '"></i> ' + action.label +
                "</a>";
        }).join("");
    }

    helpers.applySectionVisibility(content);
    helpers.applySectionOrder(content);
}

const CARGOXPRESS_TEMPLATE = {
    templateId: TEMPLATE_ID,
    templateType: "single-page",
    version: 1,
    structureSpec: {
        navbar: { count: 1, editable: false },
        hero: { count: 1, editable: false },
        sections: ["howItWorks", "benefits", "contact"],
        footer: { count: 1, editable: false }
    },
    constraints: {
        navbarItems: { min: 1, max: 5 },
        heroStats: { min: 1, max: 6 },
        howItWorksSteps: { min: 1, max: 10 },
        benefitsItems: { min: 1, max: 10 },
        contactActions: { min: 1, max: 5 }
    },
    editableSchema: {
        sections: EDITABLE_SECTIONS
    },
    renderBindings: {
        layoutRoot: DOM_HOOKS.layoutRoot,
        sections: ["hero", "como", "beneficios", "contact", "footer"]
    },
    optionalDefaults: OPTIONAL_DEFAULTS,
    arrayTemplates: ARRAY_TEMPLATES,
    isValidContent: isValidContent,
    normalizeContent: normalizeContent,
    validateContent: validateContent,
    render: renderTemplate
};

export { ARRAY_TEMPLATES, CARGOXPRESS_TEMPLATE, OPTIONAL_DEFAULTS, TEMPLATE_ID };
