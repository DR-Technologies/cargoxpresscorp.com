import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, isCloudinaryConfigured } from "./cloudinary-config.js";

function openCloudinaryUpload(options = {}) {
    if (!isCloudinaryConfigured()) {
        return Promise.reject(new Error("Cloudinary no esta configurado."));
    }

    if (!window.cloudinary || typeof window.cloudinary.createUploadWidget !== "function") {
        return Promise.reject(new Error("El Cloudinary Upload Widget no esta disponible."));
    }

    return new Promise(function (resolve, reject) {
        const widget = window.cloudinary.createUploadWidget({
            cloudName: CLOUDINARY_CLOUD_NAME,
            uploadPreset: CLOUDINARY_UPLOAD_PRESET,
            sources: ["local", "url", "camera"],
            multiple: false,
            cropping: false,
            resourceType: "image",
            folder: options.folder || "cargoxpress",
            clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "gif", "svg"]
        }, function (error, result) {
            if (error) {
                reject(error);
                return;
            }

            if (result && result.event === "success") {
                resolve(result.info.secure_url);
            }
        });

        widget.open();
    });
}

export { openCloudinaryUpload };
