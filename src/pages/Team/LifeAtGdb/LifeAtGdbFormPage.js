import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import Upload from "../../../components/common/Upload";
import { getLifeItemById, createLifeItem, updateLifeItem } from "../../../services/team/lifeAtGdbService";

export default function LifeAtGdbFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const isView = location.pathname.includes("/team/life-at-gdb/view/");
  const isEdit = Boolean(id) && !isView;

  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    section_title: "",
    description: "",
    file_url: "",
    media_type: "image",
    alt_text: "",
    sequence: 0,
    status: "active",
  });

  useEffect(() => {
    if (!isEdit && !isView) return;

    (async () => {
      try {
        setPageLoading(true);
        const res = await getLifeItemById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            section_title: d.section_title || "",
            description: d.description || "",
            file_url: d.file_url || "",
            media_type: d.media_type || "image",
            alt_text: d.alt_text || "",
            sequence: d.sequence ?? 0,
            status: d.status || "active",
          });
        } else {
          toast.error("Gallery item not found");
          navigate("/team/life-at-gdb");
        }
      } catch (err) {
        toast.error("Failed to load gallery item details");
        navigate("/team/life-at-gdb");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id, isEdit, isView, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "sequence" ? Number(value) : value,
    }));
  };

  const handleMediaUpload = (url) => {
    const isVideo =
      url.includes("video") ||
      url.endsWith(".mp4") ||
      url.endsWith(".webm") ||
      url.endsWith(".mov");

    setForm((prev) => ({
      ...prev,
      file_url: url,
      media_type: isVideo ? "video" : "image",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isView) return;

    // Validate fields
    if (!form.section_title.trim()) return toast.error("Section Title is required");
    if (!form.file_url) return toast.error("Media file is required");
    if (!form.alt_text.trim()) return toast.error("Media Alt Text is required");

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        section_title: form.section_title.trim(),
        description: form.description.trim() || null,
        alt_text: form.alt_text.trim(),
        sequence: Number(form.sequence),
      };

      const res = isEdit
        ? await updateLifeItem(id, payload)
        : await createLifeItem(payload);

      if (res.success) {
        toast.success(isEdit ? "Gallery item updated successfully" : "Gallery item created successfully");
        navigate("/team/life-at-gdb");
      } else {
        toast.error(res.message || "Operation failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pageTitle = isView ? "View Gallery Item" : isEdit ? "Edit Gallery Item" : "Add Gallery Item";

  return (
    <div className="space-y-6 pb-12 w-full p-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => navigate("/team/life-at-gdb")}
          className="rounded-xl border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-slate-500 text-sm">
            {isView ? "View details of this gallery item" : "Provide gallery element details and upload media"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">
            Item Details
          </h2>

          <div className="grid grid-cols-1 gap-5">
            {/* Title */}
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Section Title <span className="text-red-500">*</span>
              </label>
              <Input
                name="section_title"
                value={form.section_title}
                onChange={handleChange}
                placeholder="e.g. Dynamic Work Culture"
                disabled={isView}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Description
              </label>
              <Textarea
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                placeholder="Enter item description..."
                disabled={isView}
                rows={4}
                className="w-full border border-[#E6E6E6] rounded-lg p-3 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-55"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Sequence */}
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                  Sequence
                </label>
                <Input
                  type="number"
                  name="sequence"
                  value={form.sequence}
                  onChange={handleChange}
                  placeholder="0"
                  disabled={isView}
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={isView}
                  className="w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-55"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Media Block */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">
            Media Upload
          </h2>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-2">
              Upload Image or Video <span className="text-red-500">*</span>
            </label>
            <Upload
              value={form.file_url}
              onChange={handleMediaUpload}
              mediaType="both"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              maxSizeKB={500}
              maxSizeMB={50}
              disabled={isView}
            />
            {form.file_url && (
              <p className="text-xs text-indigo-600 font-semibold mt-2 capitalize">
                Detected Media Type: {form.media_type}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              Media Alt Text <span className="text-red-500">*</span>
            </label>
            <Input
              name="alt_text"
              value={form.alt_text}
              onChange={handleChange}
              placeholder="Provide alt text for screen readers"
              disabled={isView}
              required
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/team/life-at-gdb")}
          >
            {isView ? "Back" : "Cancel"}
          </Button>

          {!isView && (
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? "Update Item" : "Save Item"}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
