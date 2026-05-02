const CLOUDINARY_CLOUD_NAME = "demj6h3qz";
const CLOUDINARY_UPLOAD_PRESET = "Prueba";

function isCloudinaryConfigured() {
    return CLOUDINARY_CLOUD_NAME.indexOf("TU_") === -1 && CLOUDINARY_UPLOAD_PRESET.indexOf("TU_") === -1;
}

export { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, isCloudinaryConfigured };
