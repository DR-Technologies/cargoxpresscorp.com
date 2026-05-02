import { CARGOXPRESS_TEMPLATE, TEMPLATE_ID as DEFAULT_TEMPLATE_ID } from "./templates/cargoxpress-template.js";

const TEMPLATE_REGISTRY = {
    [DEFAULT_TEMPLATE_ID]: CARGOXPRESS_TEMPLATE
};

function getDefaultTemplateDefinition() {
    return CARGOXPRESS_TEMPLATE;
}

function getTemplateDefinition(templateId) {
    return TEMPLATE_REGISTRY[templateId] || getDefaultTemplateDefinition();
}

function getTemplateDefinitionForContent(content) {
    return getTemplateDefinition(content && content.templateId);
}

function isValidContentForTemplate(content, templateId) {
    return getTemplateDefinition(templateId).isValidContent(content);
}

function normalizeContentForTemplate(content, templateId) {
    return getTemplateDefinition(templateId || (content && content.templateId)).normalizeContent(content);
}

function validateContentForTemplate(content, templateId) {
    const definition = getTemplateDefinition(templateId || (content && content.templateId));
    if (definition.validateContent) {
        return definition.validateContent(content);
    }

    return { valid: true, issues: [] };
}

function getArrayTemplateForContent(path, currentValue, content) {
    const definition = getTemplateDefinitionForContent(content);
    if (definition.arrayTemplates && definition.arrayTemplates[path]) {
        return JSON.parse(JSON.stringify(definition.arrayTemplates[path]));
    }

    if (Array.isArray(currentValue) && currentValue.length > 0) {
        const sample = currentValue[0];
        if (sample && typeof sample === "object" && !Array.isArray(sample)) {
            const output = {};
            Object.keys(sample).forEach(function (key) {
                output[key] = typeof sample[key] === "boolean" ? false : "";
            });
            return output;
        }

        return typeof sample === "boolean" ? false : "";
    }

    return "";
}

export {
    DEFAULT_TEMPLATE_ID,
    getArrayTemplateForContent,
    getDefaultTemplateDefinition,
    getTemplateDefinition,
    getTemplateDefinitionForContent,
    isValidContentForTemplate,
    normalizeContentForTemplate,
    validateContentForTemplate
};
