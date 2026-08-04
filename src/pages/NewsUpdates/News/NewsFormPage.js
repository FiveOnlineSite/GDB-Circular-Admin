import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, CalendarDays } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import Upload from "../../../components/common/Upload";
import EditPageDeleteAction from "../../../components/common/EditPageDeleteAction";
import { getNewsById, createNews, updateNews } from "../../../services/news/newsService";
import { getCategories } from "../../../services/news/newsCategoryService";

function formatDisplayDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${day}-${month}-${year}`;
}

export default function NewsFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/news-updates/view/");
  const isEdit = Boolean(id) && !isView;
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    category_id: "",
    title: "",
    date: "",
    short_description: "",
    image_url: "",
    image_alt: "",
    logo_url: "",
    external_url: "",
    featured_homepage: 0,
    publish_status: "draft",
    sequence: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getCategories({ limit: "all" });
        if (res.success && res.data) {
          setCategories(res.data);
          if (!isEdit && !isView && res.data.length > 0) {
            setForm((prev) => ({ ...prev, category_id: res.data[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch category tabs", err);
      }
    })();
  }, [isEdit, isView]);

  useEffect(() => {
    if (!isEdit && !isView) return;
    (async () => {
      try {
        setPageLoading(true);
        const res = await getNewsById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            category_id: d.category_id || "",
            title: d.title || "",
            date: d.date ? d.date.split("T")[0] : "",
            short_description: d.short_description || "",
            image_url: d.image_url || "",
            image_alt: d.image_alt || "",
            logo_url: d.logo_url || "",
            external_url: d.external_url || "",
            featured_homepage: d.featured_homepage ?? 0,
            publish_status: d.publish_status || "draft",
            sequence: d.sequence ?? 0,
          });
        } else {
          toast.error("News article details not found");
          navigate("/news-updates");
        }
      } catch {
        toast.error("Failed to load news details");
        navigate("/news-updates");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id, isEdit, isView, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : name === "sequence" || name === "category_id" ? Number(value) : value,
    }));
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
    if (isView) return;

    const newErrors = {};
    if (!form.category_id) newErrors.category_id = "Category Selection is required";
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.date) newErrors.date = "Publish Date is required";
    if (!form.short_description.trim()) newErrors.short_description = "Short Description is required";
    if (!form.image_url) newErrors.image_url = "Cover Image is required";
    if (!form.image_alt.trim()) newErrors.image_alt = "Image Alt Text is required";
    if (!Number.isInteger(Number(form.sequence)) || Number(form.sequence) < 0) newErrors.sequence = "Sequence must be a non-negative integer";

    if (form.external_url) {
      try {
        new URL(form.external_url);
      } catch (_) {
        newErrors.external_url = "External URL format is invalid. Ensure it begins with http:// or https://";
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
        short_description: form.short_description.trim(),
        image_alt: form.image_alt.trim(),
        external_url: form.external_url.trim() || null,
        sequence: Number(form.sequence),
      };
      const res = isEdit ? await updateNews(id, payload) : await createNews(payload);
      if (res.success) {
        toast.success(isEdit ? "Article updated successfully" : "Article created successfully");
        navigate("/news-updates");
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
    return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin" /></div>;
  }

  const pageTitle = isView ? "View News Article" : isEdit ? "Edit News Article" : "Add News Article";

  return (
    <div className="space-y-6 pb-12 w-full p-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" type="button" onClick={() => navigate("/news-updates")} className="rounded-xl border-slate-200">
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{pageTitle}</h1>
          <p className="text-slate-500 text-sm">{isView ? "View details of this news article" : "Provide news parameters, cover photo, status, and features"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Article Specifications</h2>
          <div className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Category Tab <span className="text-red-500">*</span></label>
                <select name="category_id" value={form.category_id} onChange={handleChange} disabled={isView} aria-invalid={errors.category_id ? "true" : "false"} className={`w-full border ${errors.category_id ? "border-red-500 focus:border-red-500 focus:ring-red-500/15" : "border-[#E6E6E6] focus:border-[#981B1F] focus:ring-[#981B1F]/15"} text-[#111111] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-55`}>
                  <option value="">Select Category</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.category_title}</option>)}
                </select>
                {errors.category_id && <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">{errors.category_id}</span>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Article Title <span className="text-red-500">*</span></label>
                <Input name="title" value={form.title} onChange={handleChange} placeholder="e.g. GDB Expands Recycling Plant Capabilities" disabled={isView} error={!!errors.title} errorMessage={errors.title} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Publish Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className={`flex h-10 w-full items-center rounded-md border bg-white px-3 pr-11 text-sm dark:bg-gray-800 ${errors.date ? "border-red-500" : "border-[#E6E6E6]"}`}>
                    <span className={form.date ? "text-[#111111] dark:text-white" : "text-slate-500"}>{form.date ? formatDisplayDate(form.date) : "DD-MM-YYYY"}</span>
                  </div>
                  <input type="date" name="date" value={form.date} onChange={handleChange} disabled={isView} aria-label="Publish Date" className="inquiry-date-input absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed" />
                  <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
                {errors.date && <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">{errors.date}</span>}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">External URL / Read More Link</label>
                <Input name="external_url" value={form.external_url} onChange={handleChange} placeholder="e.g. https://www.recyclingtoday.com/gdb-circular-press" disabled={isView} error={!!errors.external_url} errorMessage={errors.external_url} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Short Description <span className="text-red-500">*</span></label>
              <Textarea name="short_description" value={form.short_description} onChange={handleChange} placeholder="Enter a 2-3 sentence overview..." disabled={isView} rows={3} className="w-full border border-[#E6E6E6] rounded-lg p-3 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-55" />
              {errors.short_description && <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">{errors.short_description}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Sequence</label>
                <Input type="number" name="sequence" value={form.sequence} onChange={handleChange} placeholder="0" disabled={isView} error={!!errors.sequence} errorMessage={errors.sequence} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Publish Status</label>
                <select name="publish_status" value={form.publish_status} onChange={handleChange} disabled={isView} className="w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-55 cursor-pointer">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 bg-slate-50 dark:bg-gray-800/40 p-4 rounded-xl border border-slate-100 dark:border-gray-800 mt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" name="featured_homepage" checked={form.featured_homepage === 1} onChange={handleChange} disabled={isView} className="rounded border-[#E6E6E6] text-[#981B1F] focus:ring-[#981B1F]/15 h-4.5 w-4.5 cursor-pointer disabled:opacity-50" />
                <div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">Featured On Homepage</span>
                  <span className="text-xs text-slate-400 block mt-0.5">If enabled, this article is showcased inside the homepage insights section.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Cover Photo Upload</h2>
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-2">Image File (Max: 500KB) <span className="text-red-500">*</span></label>
            <Upload value={form.image_url} onChange={(url) => {
              setForm((prev) => ({ ...prev, image_url: url }));
              if (errors.image_url) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.image_url;
                  return next;
                });
              }
            }} mediaType="image" accept="image/*" maxSizeKB={500} disabled={isView} />
            {errors.image_url && <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">{errors.image_url}</span>}
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Image Alt Text <span className="text-red-500">*</span></label>
            <Input name="image_alt" value={form.image_alt} onChange={handleChange} placeholder="Describe the image" disabled={isView} error={!!errors.image_alt} errorMessage={errors.image_alt} />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-2">Publisher / Brand Logo</label>
            <Upload
              value={form.logo_url}
              onChange={(url) => {
                setForm((prev) => ({ ...prev, logo_url: url }));
              }}
              mediaType="image"
              accept="image/*"
              maxSizeKB={500}
              disabled={isView}
            />
            <p className="mt-1 text-xs text-slate-500">Optional. This logo will appear at the bottom-right of the news card on the frontend.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <EditPageDeleteAction
            id={isEdit ? id : null}
            permission="news.content.delete"
            endpoint={`/news/${id}`}
            redirectTo="/news-updates"
            title="Delete News Article"
            message="Are you sure you want to delete this news article? This action cannot be undone."
            successMessage="News article deleted"
          />
          <Button type="button" variant="outline" onClick={() => navigate("/news-updates")}>{isView ? "Back" : "Cancel"}</Button>
          {!isView && (
            <Button type="submit" disabled={submitting} className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm transition-colors">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />{isEdit ? "Update Article" : "Save Article"}</>}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
