import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Plus, Trash2, Loader2, GripVertical, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import Upload from "../../../components/common/Upload";
import { getAlwaysBuying, updateAlwaysBuying } from "../../../services/sellers/alwaysBuyingService";
import { usePermissionContext } from "../../../context/PermissionContext";

export default function AlwaysBuyingFormPage() {
  const { hasPermission } = usePermissionContext();
  const canUpdate = hasPermission("sellers", "buying.update");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    section_title: "",
    section_description: "",
    file_url: "",
    media_type: "image",
    alt_text: "",
    points: [],
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getAlwaysBuying();
        if (res.success && res.data) {
          const { section, points } = res.data;
          setForm({
            section_title: section.section_title || "",
            section_description: section.section_description || "",
            file_url: section.file_url || "",
            media_type: section.media_type || "image",
            alt_text: section.alt_text || "",
            points: points || [],
          });
        }
      } catch (err) {
        toast.error("Failed to load section data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
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
    if (errors.file_url) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.file_url;
        return next;
      });
    }
  };

  // Points CRUD operations locally
  const handleAddPoint = () => {
    setForm((prev) => ({
      ...prev,
      points: [
        ...prev.points,
        {
          point_title: "",
          sequence: prev.points.length,
          status: "active",
        },
      ],
    }));
    if (errors.points) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.points;
        return next;
      });
    }
  };

  const handleRemovePoint = (index) => {
    setForm((prev) => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== index),
    }));
  };

  const handlePointChange = (index, field, value) => {
    setForm((prev) => {
      const updatedPoints = [...prev.points];
      updatedPoints[index] = {
        ...updatedPoints[index],
        [field]: field === "sequence" ? Number(value) : value,
      };
      return {
        ...prev,
        points: updatedPoints,
      };
    });
    const errorKey = `points.${index}.point_title`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canUpdate) return toast.error("You do not have permission to update this section.");

    const newErrors = {};
    if (!form.section_title.trim()) newErrors.section_title = "Section Title is required";
    if (!form.section_description.trim()) newErrors.section_description = "Section Description is required";
    if (!form.file_url) newErrors.file_url = "Media file is required";
    if (!form.alt_text.trim()) newErrors.alt_text = "Media Alt Text is required";
    if (form.points.length === 0) newErrors.points = "At least one purchasing requirement point is required";

    for (let i = 0; i < form.points.length; i++) {
      if (!form.points[i].point_title.trim()) {
        newErrors[`points.${i}.point_title`] = `Requirement Point #${i + 1} text cannot be empty`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        section_title: form.section_title.trim(),
        section_description: form.section_description.trim(),
        alt_text: form.alt_text.trim(),
        points: form.points.map((pt) => ({
          ...pt,
          point_title: pt.point_title.trim(),
        })),
      };

      const res = await updateAlwaysBuying(payload);
      if (res.success) {
        toast.success("We're Always Buying page content saved successfully");
        // Reload data to get newly generated database IDs for any brand-new points
        const reloadRes = await getAlwaysBuying();
        if (reloadRes.success && reloadRes.data) {
          const { section, points } = reloadRes.data;
          setForm({
            section_title: section.section_title || "",
            section_description: section.section_description || "",
            file_url: section.file_url || "",
            media_type: section.media_type || "image",
            alt_text: section.alt_text || "",
            points: points || [],
          });
        }
      } else {
        toast.error(res.message || "Operation failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
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
    <div className="space-y-6 pb-12 w-full p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          We're Always Buying Section Management
        </h1>
        <p className="text-slate-500 text-sm">
          Update the main buyers section content and manage requirement points listed on the Sellers page
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Section Main Information */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#981B1F]" />
            Main Section Content
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
                placeholder="e.g. We're Always Buying"
                disabled={!canUpdate}
                error={!!errors.section_title}
                errorMessage={errors.section_title}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Section Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                name="section_description"
                value={form.section_description}
                onChange={handleChange}
                placeholder="Describe what feedstock requirements GDB constantly purchases..."
                disabled={!canUpdate}
                rows={4}
                className="w-full border border-[#E6E6E6] rounded-lg p-3 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-55"
                error={!!errors.section_description}
                errorMessage={errors.section_description}
              />
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
              Upload Image or Video (Max Image: 500KB, Max Video: 50MB) <span className="text-red-500">*</span>
            </label>
            <Upload
              value={form.file_url}
              onChange={handleMediaUpload}
              mediaType="both"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              maxSizeKB={500}
              maxSizeMB={50}
              disabled={!canUpdate}
            />
            {errors.file_url && (
              <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                {errors.file_url}
              </span>
            )}
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
              placeholder="Alt text for screen readers"
              disabled={!canUpdate}
              error={!!errors.alt_text}
              errorMessage={errors.alt_text}
            />
          </div>
        </div>

        {/* Purchasing Points Block */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-base font-semibold text-slate-700 dark:text-white flex items-center gap-2">
              <AlertCircle size={18} className="text-[#981B1F]" />
              Purchasing Requirements / Points List
            </h2>
            {canUpdate && (
              <Button
                type="button"
                onClick={handleAddPoint}
                className="bg-[#981B1F] hover:bg-[#C3662D] text-white text-xs h-8"
              >
                <Plus size={14} className="mr-1" />
                Add Point
              </Button>
            )}
          </div>

          {form.points.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              No purchasing requirements added. Add at least one requirement.
              {errors.points && (
                <span className="text-red-500 text-xs font-semibold mt-1.5 block">
                  {errors.points}
                </span>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {form.points.map((point, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 border border-slate-100 dark:border-gray-700 rounded-xl bg-slate-50/50 dark:bg-gray-800/50"
                >
                  <span className="text-slate-400 font-semibold text-sm shrink-0 flex items-center gap-1">
                    <GripVertical size={14} className="hidden md:inline" />
                    #{index + 1}
                  </span>

                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={point.point_title}
                      onChange={(e) => handlePointChange(index, "point_title", e.target.value)}
                      placeholder="e.g. Contamination: Max 2% total paper/label content allowed."
                      disabled={!canUpdate}
                      className={`w-full border ${errors[`points.${index}.point_title`] ? "border-red-500 focus:border-red-500 focus:ring-red-500/15" : "border-[#E6E6E6] focus:border-[#981B1F] focus:ring-[#981B1F]/15"} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 dark:bg-gray-900 dark:border-gray-600 dark:text-white`}
                    />
                    {errors[`points.${index}.point_title`] && (
                      <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                        {errors[`points.${index}.point_title`]}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                    <div className="w-24">
                      <input
                        type="number"
                        value={point.sequence}
                        onChange={(e) => handlePointChange(index, "sequence", e.target.value)}
                        placeholder="Seq"
                        disabled={!canUpdate}
                        className="w-full border border-[#E6E6E6] rounded-lg px-2.5 py-2 text-sm focus:border-[#981B1F] focus:outline-none dark:bg-gray-900 dark:border-gray-600 dark:text-white text-center"
                      />
                    </div>

                    <div className="w-28">
                      <select
                        value={point.status}
                        onChange={(e) => handlePointChange(index, "status", e.target.value)}
                        disabled={!canUpdate}
                        className="w-full border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {canUpdate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePoint(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 shrink-0"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        {canUpdate && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Section Content
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
