import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import Upload from "../../../components/common/Upload";
import { Input } from "../../../components/ui/input";
import { createBanner, updateBanner, getBannerById } from "../../../services/globalContent/banners";

const fieldStyle =
  "w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white";

const PAGES = ["home", "about", "contact", "services", "products", "blog", "faq", "sellers", "product-listing"];


export default function BannerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    page: "",
    title: "",
    file_url: "",
    alt_text: "",
    cta_button_name: "",
    cta_button_link: "",
    sequence: 0,
    status: "active",
  });

  useEffect(() => {
    if (!isEdit) return;
    const fetch = async () => {
      try {
        setPageLoading(true);
        const res = await getBannerById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            page: d.page || "",
            title: d.title || "",
            file_url: d.file_url || "",
            alt_text: d.alt_text || "",
            cta_button_name: d.cta_button_name || "",
            cta_button_link: d.cta_button_link || "",
            sequence: d.sequence ?? 0,
            status: d.status || "active",
          });
        } else {
          toast.error("Banner not found");
          navigate("/global-content/banners");
        }
      } catch {
        toast.error("Failed to load banner");
        navigate("/global-content/banners");
      } finally {
        setPageLoading(false);
      }
    };
    fetch();
  }, [id, isEdit, navigate]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.page) newErrors.page = "Page is required";
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.file_url) newErrors.file_url = "Background image/video is required";
    if (String(form.sequence).trim() !== "" && Number(form.sequence) < 0) {
      newErrors.sequence = "Sequence must be 0 or greater";
    }
    if (form.cta_button_link.trim()) {
      const linkValue = form.cta_button_link.trim();
      const isRelativePath = linkValue.startsWith("/");
      let isValidUrl = false;
      try {
        new URL(linkValue);
        isValidUrl = true;
      } catch (_) {
        isValidUrl = false;
      }
      if (!isRelativePath && !isValidUrl) {
        newErrors.cta_button_link = "CTA button link must be a valid URL or start with /";
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
        title: form.title.trim(),
        alt_text: form.alt_text.trim(),
        cta_button_name: form.cta_button_name.trim(),
        cta_button_link: form.cta_button_link.trim(),
        sequence: Number(form.sequence),
      };
      const res = isEdit ? await updateBanner(id, payload) : await createBanner(payload);
      if (res.success) {
        toast.success(isEdit ? "Banner updated" : "Banner created");
        navigate("/global-content/banners");
      } else {
        toast.error(res.message || "Operation failed");
      }
    } catch (err) {
      const apiErrors = err.response?.data?.error;
      if (apiErrors && typeof apiErrors === "object") {
        setErrors((prev) => ({ ...prev, ...apiErrors }));
      }
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" type="button" onClick={() => navigate("/global-content/banners")} className="rounded-xl border-slate-200">
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            {isEdit ? "Edit Banner" : "Add Banner"}
          </h1>
          <p className="text-slate-500 text-sm">{isEdit ? "Update banner content and settings" : "Create a new page banner"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Banner Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Page <span className="text-red-500">*</span>
              </label>
              <select
                name="page"
                value={form.page}
                onChange={handleChange}
                aria-invalid={errors.page ? "true" : "false"}
                className={`${fieldStyle} ${errors.page ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}`}
              >
                <option value="">Select Page</option>
                {PAGES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " ")}</option>
                ))}
              </select>
              {errors.page && (
                <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                  {errors.page}
                </span>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Banner headline text"
                error={!!errors.title}
                errorMessage={errors.title}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Alt Text</label>
              <Input
                name="alt_text"
                value={form.alt_text}
                onChange={handleChange}
                placeholder="Describe the banner image/video"
                error={!!errors.alt_text}
                errorMessage={errors.alt_text}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Sequence</label>
              <Input
                type="number"
                min="0"
                name="sequence"
                value={form.sequence}
                onChange={handleChange}
                error={!!errors.sequence}
                errorMessage={errors.sequence}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">CTA Button Name</label>
              <Input
                name="cta_button_name"
                value={form.cta_button_name}
                onChange={handleChange}
                placeholder="Get Started, Learn More..."
                error={!!errors.cta_button_name}
                errorMessage={errors.cta_button_name}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">CTA Button Link</label>
              <Input
                name="cta_button_link"
                value={form.cta_button_link}
                onChange={handleChange}
                placeholder="/contact or https://..."
                error={!!errors.cta_button_link}
                errorMessage={errors.cta_button_link}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={`${fieldStyle} cursor-pointer`}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">
            Background Image / Video <span className="text-red-500">*</span>
          </h2>
          <Upload
            value={form.file_url}
            onChange={(url) => {
              setForm((prev) => ({ ...prev, file_url: url }));
              if (errors.file_url) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.file_url;
                  return next;
                });
              }
            }}
            mediaType="both"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            maxSizeKB={500}
            maxSizeMB={50}
          />
          {errors.file_url && (
            <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
              {errors.file_url}
            </span>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/global-content/banners")}>Cancel</Button>
          <Button type="submit" disabled={submitting} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />{isEdit ? "Update Banner" : "Create Banner"}</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
