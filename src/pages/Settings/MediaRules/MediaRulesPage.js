import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Loader2, History, Sliders } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { usePermissionContext } from "../../../context/PermissionContext";
import {
  getMediaRules,
  updateMediaRules,
  getMediaRulesHistory,
} from "../../../services/settings/mediaRulesService";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

export default function MediaRulesPage() {
  const { hasPermission } = usePermissionContext();
  const canUpdate = hasPermission("settings", "rules.update");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    allowed_image_ext: "jpg,jpeg,png,webp,svg",
    max_image_size_kb: 500,
    image_compression_enabled: 1,
    image_quality: 80,
    allowed_video_ext: "mp4,webm,mov",
    max_video_size_mb: 15,
    video_compression_enabled: 1,
    video_quality: 80,
    enable_file_preview: 1,
    auto_compression_before_upload: 1,
    status: "active",
  });

  const [history, setHistory] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getMediaRules();
      if (res.success && res.data) {
        setForm(res.data);
      }

      const histRes = await getMediaRulesHistory();
      if (histRes.success && histRes.data) {
        setHistory(histRes.data);
      }
    } catch (err) {
      toast.error("Failed to load settings configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (checked ? 1 : 0)
          : name === "max_image_size_kb" ||
            name === "image_quality" ||
            name === "max_video_size_mb" ||
            name === "video_quality"
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmitTrigger = (e) => {
    e.preventDefault();

    // Validation
    if (!form.allowed_image_ext.trim()) {
      return toast.error("At least one allowed image extension is required");
    }
    if (!form.allowed_video_ext.trim()) {
      return toast.error("At least one allowed video extension is required");
    }
    if (form.max_image_size_kb <= 0) {
      return toast.error("Maximum image size must be greater than 0");
    }
    if (form.max_video_size_mb <= 0) {
      return toast.error("Maximum video size must be greater than 0");
    }
    if (form.image_quality < 1 || form.image_quality > 100) {
      return toast.error("Image quality percentage must be between 1 and 100");
    }
    if (form.video_quality < 1 || form.video_quality > 100) {
      return toast.error("Video quality percentage must be between 1 and 100");
    }

    setConfirmModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    setConfirmModalOpen(false);
    try {
      setSubmitting(true);
      const res = await updateMediaRules(form);
      if (res.success) {
        toast.success("Media rules settings updated successfully");
        // Reload settings and history log
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update configuration");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          Media Rules & Upload Settings
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Configure global thresholds, formats, compression qualities, and toggles for site-wide media uploads
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Form Card */}
        <form
          onSubmit={handleSubmitTrigger}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-6"
        >
          <div className="border-b pb-4 flex items-center gap-2">
            <Sliders size={20} className="text-[#981B1F]" />
            <h2 className="text-base font-semibold text-slate-700 dark:text-white">
              Rules Configuration
            </h2>
          </div>

          <div className="space-y-6">
            {/* Image section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Image Upload Rule Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image exts */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Allowed Image Extensions (comma-separated) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="allowed_image_ext"
                    value={form.allowed_image_ext}
                    onChange={handleChange}
                    placeholder="jpg,jpeg,png,webp"
                    disabled={!canUpdate}
                    required
                  />
                </div>

                {/* Image size */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Max Image File Size (KB) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="max_image_size_kb"
                    value={form.max_image_size_kb}
                    onChange={handleChange}
                    placeholder="500"
                    disabled={!canUpdate}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image quality */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Image Quality Percentage (1-100%) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="image_quality"
                    value={form.image_quality}
                    onChange={handleChange}
                    placeholder="80"
                    min={1}
                    max={100}
                    disabled={!canUpdate}
                    required
                  />
                </div>

                {/* Compression toggle */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Frontend Image Compression Status
                  </label>
                  <select
                    name="image_compression_enabled"
                    value={form.image_compression_enabled}
                    onChange={(e) => handleSelectChange("image_compression_enabled", e.target.value)}
                    disabled={!canUpdate}
                    className="w-full border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value={1}>Enable Image Compression</option>
                    <option value={0}>Disable Image Compression</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-gray-800" />

            {/* Video section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Video Upload Rule Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Video exts */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Allowed Video Extensions (comma-separated) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="allowed_video_ext"
                    value={form.allowed_video_ext}
                    onChange={handleChange}
                    placeholder="mp4,webm,mov"
                    disabled={!canUpdate}
                    required
                  />
                </div>

                {/* Video size */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Max Video File Size (MB) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="max_video_size_mb"
                    value={form.max_video_size_mb}
                    onChange={handleChange}
                    placeholder="15"
                    disabled={!canUpdate}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Video quality */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Video Compression Quality (1-100%) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="video_quality"
                    value={form.video_quality}
                    onChange={handleChange}
                    placeholder="80"
                    min={1}
                    max={100}
                    disabled={!canUpdate}
                    required
                  />
                </div>

                {/* Video compression toggle */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Frontend Video Compression Status
                  </label>
                  <select
                    name="video_compression_enabled"
                    value={form.video_compression_enabled}
                    onChange={(e) => handleSelectChange("video_compression_enabled", e.target.value)}
                    disabled={!canUpdate}
                    className="w-full border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value={1}>Enable Video Compression</option>
                    <option value={0}>Disable Video Compression</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-gray-800" />

            {/* Common options */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Common Upload Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Enable preview */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    File Preview Status
                  </label>
                  <select
                    name="enable_file_preview"
                    value={form.enable_file_preview}
                    onChange={(e) => handleSelectChange("enable_file_preview", e.target.value)}
                    disabled={!canUpdate}
                    className="w-full border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value={1}>Enable Preview Card</option>
                    <option value={0}>Disable Preview Card</option>
                  </select>
                </div>

                {/* Auto compression */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Auto-Compression
                  </label>
                  <select
                    name="auto_compression_before_upload"
                    value={form.auto_compression_before_upload}
                    onChange={(e) => handleSelectChange("auto_compression_before_upload", e.target.value)}
                    disabled={!canUpdate}
                    className="w-full border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value={1}>Enable Auto Compress</option>
                    <option value={0}>Validate Only</option>
                  </select>
                </div>

                {/* Global Status */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Rules Rule Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    disabled={!canUpdate}
                    className="w-full border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="active">Active (Enforced)</option>
                    <option value="inactive">Inactive (Bypassed)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          {canUpdate && (
            <div className="flex items-center justify-end border-t pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating settings...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Rule Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </form>

        {/* History Log Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-4 h-fit">
          <div className="border-b pb-3 flex items-center gap-2">
            <History size={18} className="text-[#981B1F]" />
            <h2 className="text-base font-semibold text-slate-700 dark:text-white">
              Rules Update History
            </h2>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              No configuration history logs recorded.
            </div>
          ) : (
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 border border-slate-100 dark:border-gray-800 rounded-xl bg-slate-50/50 dark:bg-gray-800/40 space-y-1"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 dark:text-white">
                      {log.updated_by}
                    </span>
                    <span className="text-slate-400">
                      {log.created_at ? new Date(log.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                    <p>Image Max Size: <span className="font-semibold">{log.max_image_size_kb}KB</span></p>
                    <p>Video Max Size: <span className="font-semibold">{log.max_video_size_mb}MB</span></p>
                    <p className="capitalize">Status: <span className={`font-semibold ${log.status === "active" ? "text-green-600" : "text-red-500"}`}>{log.status}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmUpdate}
        title="Update Global Media Rules"
        message="Are you sure you want to save these changes? The new rules will be applied globally across all upload fields immediately."
        confirmText="Yes, Update Rules"
        cancelText="Cancel"
        confirmButtonClass="bg-[#981B1F] hover:bg-[#C3662D] shadow-[#981B1F]/20"
      />
    </div>
  );
}
