/**
 * Get video file size in MB.
 * @param {File} file
 * @returns {number}
 */
export const getFileSizeMB = (file) => {
  return Number((file.size / (1024 * 1024)).toFixed(2));
};

/**
 * Validate video file type and size.
 * @param {File} file
 * @param {number} maxSizeMB
 * @returns {{valid: boolean, error?: string}}
 */
export const validateVideo = (file, maxSizeMB = 50) => {
  const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"]; // MP4, WEBM, MOV
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Unsupported video type. Allowed types: MP4, WEBM, MOV.",
    };
  }

  const sizeMB = getFileSizeMB(file);
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `Video size (${sizeMB}MB) exceeds the max limit of ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
};

/**
 * Generate a preview URL for a video file.
 * @param {File} file
 * @returns {string}
 */
export const getVideoPreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Compress video using @ffmpeg/ffmpeg.
 * Since ffmpeg.wasm might be unsupported or heavy, this function checks support
 * and throws/falls back if initialization fails.
 * @param {File} file
 * @param {object} options
 * @param {function} onProgress
 * @returns {Promise<File>}
 */
export const compressVideo = async (file, options = {}, onProgress = null) => {
  const defaultOptions = {
    outputFormat: "mp4",
    videoCodec: "libx264",
    crf: 28,
    preset: "veryfast",
    audioBitrate: "128k",
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Check SharedArrayBuffer support (required by ffmpeg.wasm multi-thread or single-thread depending on version)
  if (typeof SharedArrayBuffer === "undefined") {
    throw new Error("SharedArrayBuffer is not supported by your browser. Video compression requires security headers (COOP/COEP).");
  }

  try {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { fetchFile } = await import("@ffmpeg/util");

    const ffmpeg = new FFmpeg();

    if (onProgress) {
      ffmpeg.on("progress", ({ progress }) => {
        onProgress(Math.round(progress * 100));
      });
    }

    await ffmpeg.load();

    const inputName = "input" + getFileExtension(file.name);
    const outputName = `output.${finalOptions.outputFormat}`;

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Run ffmpeg compression command
    // -i input -vcodec libx264 -crf 28 -preset veryfast -ab 128k output.mp4
    await ffmpeg.exec([
      "-i", inputName,
      "-vcodec", finalOptions.videoCodec,
      "-crf", String(finalOptions.crf),
      "-preset", finalOptions.preset,
      "-ab", finalOptions.audioBitrate,
      outputName
    ]);

    const data = await ffmpeg.readFile(outputName);
    const compressedBlob = new Blob([data.buffer], { type: `video/${finalOptions.outputFormat}` });

    return new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + `.${finalOptions.outputFormat}`, {
      type: `video/${finalOptions.outputFormat}`,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("FFmpeg video compression failed:", error);
    throw error;
  }
};

const getFileExtension = (filename) => {
  const ext = filename.split(".").pop();
  return ext ? `.${ext}` : "";
};
