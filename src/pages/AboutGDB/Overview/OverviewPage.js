import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Loader2, Edit2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import Upload from "../../../components/common/Upload";
import { getOverview, updateOverview } from "../../../services/aboutGDB";
import { usePermissionContext } from "../../../context/PermissionContext";

export default function OverviewPage() {
  const { hasPermission } = usePermissionContext();
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    description: "",
    images: [
      { url: "", alt: "" },
      { url: "", alt: "" },
      { url: "", alt: "" },
      { url: "", alt: "" },
      { url: "", alt: "" },
      { url: "", alt: "" },
    ],
    status: "active",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setPageLoading(true);
        const res = await getOverview();
        if (res.success && res.data) {
          const d = res.data;
          const images = d.images && Array.isArray(d.images) ? d.images : Array(6).fill({ url: "", alt: "" });
          const updatedForm = {
            description: d.description || "",
            images: images.length === 6 ? images : [...images, ...Array(6 - images.length).fill({ url: "", alt: "" })],
            status: d.status || "active",
          };
          setForm(updatedForm);
          const hasData = !!(updatedForm.description || updatedForm.images.some(img => img.url));
          setIsEditing(!hasData);
        } else {
          setIsEditing(true);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load overview");
        setIsEditing(true);
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, []);

  const [errors, setErrors] = useState({});

  const handleImageAltChange = (index, alt) => {
    setForm(p => ({
      ...p,
      images: p.images.map((img, i) => i === index ? { ...img, alt } : img)
    }));
    const errKey = `image_alt_${index}`;
    if (errors[errKey]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[errKey];
        return next;
      });
    }
  };

  const handleDescriptionChange = (val) => {
    setForm(p => ({ ...p, description: val }));
    if (errors.description) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.description;
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    }

    form.images.forEach((img, i) => {
      if (!img.url) {
        newErrors[`image_url_${i}`] = "Image is required";
      }
      if (img.url && !img.alt.trim()) {
        newErrors[`image_alt_${i}`] = "Alt text is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const res = await updateOverview({
        description: form.description,
        images: form.images,
        status: form.status,
      });
      if (res.success) {
        toast.success("Overview updated successfully");
        setIsEditing(false);
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
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

  const hasExistingData = !!(form.description || form.images.some((img) => img.url));

  return (
    <div className="space-y-6 pb-12 w-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">About GDB - Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Manage the overview section with description and images</p>
      </div>

      {!isEditing && hasExistingData ? (
        /* Preview Card View */
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-semibold text-slate-700 dark:text-white">Overview Details</h2>
              {hasPermission("about", "overview.update") && (
                <Button
                  variant="outline"
                  className="border-[#981B1F] text-[#981B1F] hover:bg-[#981B1F]/5 gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4" /> Edit Overview
                </Button>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 block uppercase tracking-wider mb-1">Description</span>
              <p className="text-sm text-slate-600 dark:text-gray-305 whitespace-pre-wrap">{form.description || "—"}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 block uppercase tracking-wider mb-1">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${form.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {form.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Images Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Images</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {form.images.map((image, index) => (
                <div key={index} className="border border-slate-100 dark:border-gray-800 rounded-xl p-3 bg-slate-50/50 dark:bg-gray-800/50 space-y-3">
                  <span className="text-xs font-semibold text-slate-400 block uppercase">Image {index + 1}</span>
                  {image.url ? (
                    <img
                      src={image.url.startsWith("data:") ? image.url : `${process.env.REACT_APP_API_URL || ""}${image.url}`}
                      alt={image.alt || `Overview image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border bg-white"
                    />
                  ) : (
                    <div className="w-full h-32 rounded-lg bg-slate-200 dark:bg-gray-800 flex items-center justify-center text-slate-400 text-xs">No image uploaded</div>
                  )}
                  {image.alt && (
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-gray-500 block uppercase tracking-wider">Alt Text</span>
                      <span className="text-xs text-slate-700 dark:text-slate-350">{image.alt}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Form View */
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Description Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Overview Details</h2>

            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Enter overview description"
                rows={6}
                error={!!errors.description}
                errorMessage={errors.description}
              />
              <p className="text-xs text-slate-500 mt-1">Provide a comprehensive description for the overview section</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-2">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">
              Images (Exactly 6 Required) <span className="text-red-500">*</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {form.images.map((image, index) => (
                <div key={index} className="border border-slate-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-600 dark:text-gray-300">
                      Image {index + 1}
                    </label>
                  </div>
                  <Upload
                    value={image.url}
                    onChange={(url) => {
                      setForm(p => ({
                        ...p,
                        images: p.images.map((img, i) => i === index ? { ...img, url: url } : img)
                      }));
                      const errKey = `image_url_${index}`;
                      if (errors[errKey]) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next[errKey];
                          return next;
                        });
                      }
                    }}
                    mediaType="image"
                    accept="image/*"
                    maxSizeKB={500}
                  />
                  {errors[`image_url_${index}`] && (
                    <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                      {errors[`image_url_${index}`]}
                    </span>
                  )}

                  <div className="mt-3">
                    <label className="text-xs font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                      Alt Text <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={image.alt}
                      onChange={(e) => handleImageAltChange(index, e.target.value)}
                      placeholder="Enter alt text for this image"
                      className={`w-full border ${errors[`image_alt_${index}`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-[#E6E6E6] focus:border-[#981B1F] focus:ring-[#981B1F]/15'} rounded-lg p-2 text-sm focus:outline-none focus:ring-2 transition dark:bg-gray-800 dark:text-white`}
                    />
                    {errors[`image_alt_${index}`] && (
                      <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                        {errors[`image_alt_${index}`]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {hasExistingData && (
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={submitting || !hasPermission("about", "overview.update")}
              style={{ backgroundColor: "#981B1F" }}
              className="text-white gap-2 hover:opacity-90"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Overview
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
