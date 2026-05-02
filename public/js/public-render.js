import {
    applySectionOrder,
    applySectionVisibility,
    applyTheme,
    resolveImageSource,
    setDocumentMeta,
    setImages,
    setLinks,
    setTextContent
} from "./render-helpers.js";
import { getTemplateDefinitionForContent, normalizeContentForTemplate } from "./template-registry.js";

const RENDER_HELPERS = {
    applySectionOrder: applySectionOrder,
    applySectionVisibility: applySectionVisibility,
    applyTheme: applyTheme,
    resolveImageSource: resolveImageSource,
    setDocumentMeta: setDocumentMeta,
    setImages: setImages,
    setLinks: setLinks,
    setTextContent: setTextContent
};

function render(content) {
    var normalizedContent = normalizeContentForTemplate(content);
    var definition = getTemplateDefinitionForContent(normalizedContent);
    definition.render(document, normalizedContent, RENDER_HELPERS);
}

export { render };
