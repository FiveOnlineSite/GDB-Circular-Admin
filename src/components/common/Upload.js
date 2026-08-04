import React, { useState, useEffect, useRef } from "react";
import { ImageIcon, Video, FileText, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/utils/apiConfig";
import {
  compressImage,
  getFileSizeKB,
} from "../../utils/mediaCompression";
import {
  compressVideo,
  getFileSizeMB,
} from "../../utils/videoCompression";

const STATIC_MAX_IMAGE_SIZE_KB = 500;
const STATIC_MAX_VIDEO_SIZE_MB = 10;
const STATIC_ALLOWED_IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "svg"];
const STATIC_ALLOWED_VIDEO_EXTS = ["mp4", "webm", "mov"];

export default function Upload({
  value = "",
  onChange,
  className = "",
  accept = "image/*,video/mp4,application/pdf",
  compressBeforeUpload = true,
  mediaType = "both", // "image" | "video" | "both" | "document"
  onUploadStart,
  onCompressionStart,
  onCompressionComplete,
  onUploadProgress,
  onError,
  onSuccess,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressing, setCompressing] = useState(false);

  const sessionUploadedUrlsRef = useRef(new Set());
  const latestValueRef = useRef(value);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  const deleteUploadedFile = async (fileUrl) => {
    if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
    try {
      await api.delete("/v1/media/upload", { data: { url: fileUrl } });
    } catch (err) {
      // Best-effort cleanup only.
    }
  };

  const getAllowedImageExts = () => {
    return STATIC_ALLOWED_IMAGE_EXTS;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isSvg = file.type === "image/svg+xml";
    const isVideo = file.type.startsWith("video/");
    const isPdf = file.type === "application/pdf";
    const fileExt = file.name.split(".").pop().toLowerCase();

    // 1. Resolve Rules
    const allowedImageExts = getAllowedImageExts();

    const allowedVideoExts = STATIC_ALLOWED_VIDEO_EXTS;

    const activeMaxImageKB = STATIC_MAX_IMAGE_SIZE_KB;
    const activeMaxVideoMB = STATIC_MAX_VIDEO_SIZE_MB;

    const autoCompress = compressBeforeUpload;
    const imageCompressEnabled = true;
    const videoCompressEnabled = true;
    // 2. Validate based on file type and extensions
    if (isImage) {
      if (mediaType === "video" || mediaType === "document") {
        const err = "Only video or document files are allowed.";
        toast.error(err);
        if (onError) onError(err);
        return;
      }
      if (!allowedImageExts.includes(fileExt)) {
        const err = `Unsupported image type. Allowed: ${allowedImageExts.join(", ").toUpperCase()}`;
        toast.error(err);
        if (onError) onError(err);
        return;
      }
      const initialSizeKB = getFileSizeKB(file);
      if (!autoCompress && initialSizeKB > activeMaxImageKB) {
        const err = `Image size (${initialSizeKB}KB) exceeds limit of ${activeMaxImageKB}KB.`;
        toast.error(err);
        if (onError) onError(err);
        return;
      }
    } else if (isVideo) {
      if (mediaType === "image" || mediaType === "document") {
        const err = "Only image or document files are allowed.";
        toast.error(err);
        if (onError) onError(err);
        return;
      }
      if (!allowedVideoExts.includes(fileExt)) {
        const err = `Unsupported video type. Allowed: ${allowedVideoExts.join(", ").toUpperCase()}`;
        toast.error(err);
        if (onError) onError(err);
        return;
      }
      const initialSizeMB = getFileSizeMB(file);
      if (!autoCompress && initialSizeMB > activeMaxVideoMB) {
        const err = `Video size (${initialSizeMB}MB) exceeds limit of ${activeMaxVideoMB}MB.`;
        toast.error(err);
        if (onError) onError(err);
        return;
      }
    } else if (isPdf) {
      if (mediaType === "image" || mediaType === "video") {
        const err = "PDF uploads are not allowed here.";
        toast.error(err);
        if (onError) onError(err);
        return;
      }
      const sizeMB = getFileSizeMB(file);
      if (sizeMB > 5) {
        const err = "PDF files must be under 5MB.";
        toast.error(err);
        if (onError) onError(err);
        return;
      }
    } else {
      const err = "Unsupported file type.";
      toast.error(err);
      if (onError) onError(err);
      return;
    }

    let fileToUpload = file;
    let uploadFileName = file.name;

    // 3. Perform compression on frontend if enabled
    const imageSizeKB = isImage ? getFileSizeKB(file) : 0;
    const videoSizeMB = isVideo ? getFileSizeMB(file) : 0;

    if (isImage && !isSvg && autoCompress && imageCompressEnabled && imageSizeKB > activeMaxImageKB) {
      setCompressing(true);
      if (onCompressionStart) onCompressionStart();
      try {
        const compressed = await compressImage(file, {
          maxSizeMB: activeMaxImageKB / 1024,
          initialQuality: 1,
        });
        const compSizeKB = getFileSizeKB(compressed);

        if (compSizeKB > activeMaxImageKB) {
          throw new Error(`Compressed image is still larger than allowed limit (${activeMaxImageKB}KB).`);
        }

        fileToUpload = compressed;
        uploadFileName = file.name;
        if (onCompressionComplete) onCompressionComplete(compressed);
      } catch (err) {
        setCompressing(false);
        const errMsg = err.message || "Image compression failed.";
        toast.error(errMsg);
        if (onError) onError(errMsg);
        return;
      }
      setCompressing(false);
    } else if (isVideo && autoCompress && videoCompressEnabled && videoSizeMB > activeMaxVideoMB) {
      setCompressing(true);
      setCompressionProgress(0);
      if (onCompressionStart) onCompressionStart();
      try {
        const compressed = await compressVideo(file, { crf: 18, preset: "slow" }, (progress) => {
          setCompressionProgress(progress);
        });
        const compSizeMB = getFileSizeMB(compressed);

        if (compSizeMB > activeMaxVideoMB) {
          throw new Error(`Compressed video is still larger than allowed limit (${activeMaxVideoMB}MB).`);
        }

        fileToUpload = compressed;
        uploadFileName = file.name;
        if (onCompressionComplete) onCompressionComplete(compressed);
      } catch (err) {
        setCompressing(false);
        const sizeMB = getFileSizeMB(file);
        if (sizeMB <= activeMaxVideoMB) {
          toast.warning("Video compression is not supported. Uploading original file directly.");
          fileToUpload = file;
        } else {
          const errMsg = `Video compression failed, and file size exceeds maximum limit (${activeMaxVideoMB}MB).`;
          toast.error(errMsg);
          if (onError) onError(errMsg);
          return;
        }
      }
      setCompressing(false);
    }

    // 4. Upload file to backend
    setLoading(true);
    setUploadProgress(0);
    if (onUploadStart) onUploadStart();

    const formData = new FormData();
    formData.append("file", fileToUpload, uploadFileName);

    try {
      const res = await api.post("/v1/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
          if (onUploadProgress) onUploadProgress(percent);
        },
      });

      if (res.data && res.data.success) {
        const fileUrl = res.data.data.url;
        const previousValue = latestValueRef.current;
        if (
          previousValue &&
          previousValue !== fileUrl &&
          sessionUploadedUrlsRef.current.has(previousValue)
        ) {
          sessionUploadedUrlsRef.current.delete(previousValue);
          deleteUploadedFile(previousValue);
        }

        sessionUploadedUrlsRef.current.add(fileUrl);
        onChange(fileUrl);
        if (onSuccess) onSuccess(fileUrl);
        toast.success("File uploaded successfully.");
      } else {
        throw new Error(res.data?.message || "Upload failed");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to upload file.";
      toast.error(errMsg);
      if (onError) onError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    const currentValue = latestValueRef.current;
    if (currentValue && sessionUploadedUrlsRef.current.has(currentValue)) {
      sessionUploadedUrlsRef.current.delete(currentValue);
      deleteUploadedFile(currentValue);
    }
    onChange("");
  };

  useEffect(() => {
    const sessionUploadedUrls = sessionUploadedUrlsRef.current;

    return () => {
      const pendingUrls = Array.from(sessionUploadedUrls);
      sessionUploadedUrls.clear();
      pendingUrls.forEach((fileUrl) => {
        deleteUploadedFile(fileUrl);
      });
    };
  }, []);

  const previewSrc = value
    ? value.startsWith("data:")
      ? value
      : `${process.env.REACT_APP_API_URL || ""}${value}`
    : null;

  const showPreview = true;

  const getFileTypeIcon = () => {
    if (mediaType === "video") return <Video className="w-8 h-8 text-slate-300" />;
    if (mediaType === "document") return <FileText className="w-8 h-8 text-slate-300" />;
    return <ImageIcon className="w-8 h-8 text-slate-300" />;
  };

  const maxImageLimitKB = STATIC_MAX_IMAGE_SIZE_KB;
  const maxVideoLimitMB = STATIC_MAX_VIDEO_SIZE_MB;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* File Preview and Details */}
      {previewSrc && showPreview ? (
        <div className="relative border border-slate-200  rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 bg-slate-50 ">
          <div className="shrink-0">
            {value.includes("video") || value.endsWith(".mp4") || value.endsWith(".webm") || value.endsWith(".mov") ? (
              <video src={previewSrc} className="h-24 w-24 object-cover rounded-lg border bg-black" controls muted />
            ) : value.endsWith(".pdf") ? (
              <div className="h-24 w-24 flex items-center justify-center rounded-lg border bg-white text-rose-600">
                <FileText size={40} />
              </div>
            ) : (
              <img src={previewSrc} alt="uploaded preview" className="h-24 w-24 object-contain rounded-lg border bg-white p-1" />
            )}
          </div>

          {!disabled && (
            <button
              onClick={handleClear}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ml-auto"
              title="Remove File"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-200  rounded-xl p-6 text-center hover:border-[#981B1F]/40 transition relative bg-white ">
          {compressing ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <Loader2 className="w-10 h-10 animate-spin text-[#981B1F]" />
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">Compressing Media...</span>
              {compressionProgress > 0 && (
                <div className="w-48 bg-slate-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-[#C3662D] h-2 rounded-full transition-all"
                    style={{ width: `${compressionProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <Loader2 className="w-10 h-10 animate-spin text-[#981B1F]" />
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">Uploading File: {uploadProgress}%</span>
              <div className="w-48 bg-slate-100 rounded-full h-2 mt-2">
                <div
                  className="bg-[#981B1F] h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <label className={`flex flex-col items-center gap-2 cursor-pointer ${disabled ? "pointer-events-none opacity-50" : ""}`}>
              <div className="flex gap-2">
                {getFileTypeIcon()}
              </div>
              <span className="text-sm font-bold text-slate-500">Click to upload {mediaType === "both" ? "media" : mediaType}</span>
              <span className="text-xs text-slate-400 font-medium">
                {mediaType === "image" && `Image formats: ${getAllowedImageExts().join(", ").toUpperCase()} — max ${maxImageLimitKB}KB`}
                {mediaType === "video" && `Video formats: ${STATIC_ALLOWED_VIDEO_EXTS.join(", ").toUpperCase()} — max ${maxVideoLimitMB}MB`}
                {mediaType === "document" && "PDF — max 5MB"}
                {mediaType === "both" && `Images max ${maxImageLimitKB}KB · Videos max ${maxVideoLimitMB}MB · PDFs max 5MB`}
              </span>
              <input
                type="file"
                accept={accept}
                className="sr-only"
                onChange={handleFileChange}
                disabled={disabled}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
