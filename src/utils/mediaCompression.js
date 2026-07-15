import imageCompression from "browser-image-compression";

/**
 * Get the file size in KB.
 * @param {File} file
 * @returns {number}
 */
export const getFileSizeKB = (file) => {
  return Number((file.size / 1024).toFixed(2));
};

/**
 * Validate image file type and size.
 * @param {File} file
 * @param {number} maxSizeKB
 * @returns {{valid: boolean, error?: string}}
 */
export const validateImage = (file, maxSizeKB = 500) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Unsupported image type. Allowed types: JPG, JPEG, PNG, WEBP.",
    };
  }

  const sizeKB = getFileSizeKB(file);
  if (sizeKB > maxSizeKB) {
    return {
      valid: false,
      error: `Image size (${sizeKB}KB) exceeds the max limit of ${maxSizeKB}KB.`,
    };
  }

  return { valid: true };
};

/**
 * Compress an image file using browser-image-compression.
 * @param {File} file
 * @param {object} options
 * @returns {Promise<File>}
 */
export const compressImage = async (file, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 1,
    fileType: file.type,
  };

  const finalOptions = { ...defaultOptions, ...options };
  try {
    const compressedFile = await imageCompression(file, finalOptions);
    // Preserving the original name and type
    return new File([compressedFile], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Image compression failed:", error);
    throw error;
  }
};
