(function () {
    function getByPath(source, path) {
        return path.split(".").reduce(function (value, key) {
            return value && value[key] !== undefined ? value[key] : undefined;
        }, source);
    }

    function setTextContent(root, content) {
        root.querySelectorAll(window.CARGOXPRESS_HOOKS.text).forEach(function (node) {
            var value = getByPath(content, node.dataset.text);
            if (value !== undefined) {
                node.textContent = value;
            }
        });
    }

    function setImages(root, content) {
        root.querySelectorAll(window.CARGOXPRESS_HOOKS.image).forEach(function (node) {
            var image = getByPath(content, node.dataset.image);
            if (image && image.src) {
                node.src = image.src;
            }
            if (image && image.alt) {
                node.alt = image.alt;
            }
        });
    }

    function setLinks(root, content) {
        root.querySelectorAll(window.CARGOXPRESS_HOOKS.link).forEach(function (node) {
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
        rootStyle.setProperty("--brand", colors.brand);
        rootStyle.setProperty("--accent", colors.accent);
        rootStyle.setProperty("--bg", colors.background);
        rootStyle.setProperty("--text", colors.text);
        rootStyle.setProperty("--button-color", colors.button);
        rootStyle.setProperty("--highlight-text", colors.highlightText);
        rootStyle.setProperty("--hero-background", colors.heroBackground);
    }

    function renderNavItems(content) {
        var container = document.querySelector(window.CARGOXPRESS_HOOKS.navItems);
        if (!container) {
            return;
        }

        var items = content.navbar.items.map(function (item) {
            return '' +
                '<li class="nav-item">' +
                '<a class="nav-link" href="' + item.url + '">' + item.label + "</a>" +
                "</li>";
        }).join("");

        container.innerHTML = items + (
            '<li class="nav-item ms-lg-2">' +
            '<a class="btn btn-brand text-white px-3" href="' + content.navbar.cta.url + '" target="_blank" rel="noopener">' +
            content.navbar.cta.label +
            "</a>" +
            "</li>"
        );
    }

    function renderHeroStats(content) {
        var container = document.querySelector(window.CARGOXPRESS_HOOKS.heroStats);
        if (!container) {
            return;
        }

        container.innerHTML = content.hero.stats.map(function (stat) {
            return '' +
                '<div class="col-4">' +
                '<div class="h4 fw-bold mb-0">' + stat.value + "</div>" +
                '<div class="small muted">' + stat.label + "</div>" +
                "</div>";
        }).join("");
    }

    function renderHowItWorks(content) {
        var container = document.querySelector(window.CARGOXPRESS_HOOKS.howSteps);
        if (!container) {
            return;
        }

        container.innerHTML = content.howItWorks.steps.map(function (step) {
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

    function renderBenefits(content) {
        var container = document.querySelector(window.CARGOXPRESS_HOOKS.benefitItems);
        if (!container) {
            return;
        }

        container.innerHTML = content.benefits.items.map(function (item) {
            return '' +
                '<li class="d-flex gap-3 py-2">' +
                '<i class="bi bi-check2-circle text-success"></i>' +
                "<span><b>" + item.strong + "</b> " + item.text + "</span>" +
                "</li>";
        }).join("");
    }

    function renderContactActions(content) {
        var container = document.querySelector(window.CARGOXPRESS_HOOKS.contactActions);
        if (!container) {
            return;
        }

        container.innerHTML = content.contact.actions.map(function (action) {
            var attrs = '';
            if (action.type === "whatsapp") {
                attrs = ' target="_blank" rel="noopener"';
            }

            return '' +
                '<a class="' + action.classes + '" href="' + action.url + '"' + attrs + ">" +
                '<i class="' + action.icon + '"></i> ' + action.label +
                "</a>";
        }).join("");
    }

    function applySectionVisibility(content) {
        var sections = document.querySelectorAll(window.CARGOXPRESS_HOOKS.section);
        sections.forEach(function (section) {
            var key = section.dataset.section;
            var isVisible = content.layout.visibility[key];
            section.hidden = isVisible === false;
        });
    }

    function applySectionOrder(content) {
        var root = document.querySelector(window.CARGOXPRESS_HOOKS.layoutRoot);
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

    function render(content) {
        var root = document;
        setDocumentMeta(content);
        applyTheme(content);
        setTextContent(root, content);
        setImages(root, content);
        setLinks(root, content);
        renderNavItems(content);
        renderHeroStats(content);
        renderHowItWorks(content);
        renderBenefits(content);
        renderContactActions(content);
        applySectionVisibility(content);
        applySectionOrder(content);
    }

    window.CARGOXPRESS_RENDER = {
        render: render
    };
}());
