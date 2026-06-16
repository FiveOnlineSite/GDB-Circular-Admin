import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import Upload from "../../../components/common/Upload";
import { getSeoById, createSeo, updateSeo } from "../../../services/globalContent/seo";

const PAGES = [
  "home",
  "about",
  "contact",
  "services",
  "products",
  "blog",
  "faq",
  "careers",
  "privacy-policy",
  "terms-conditions",
];

const ROBOTS_OPTIONS = [
  "index, follow",
  "noindex, follow",
  "index, nofollow",
  "noindex, nofollow",
];

const SCHEMA_TYPES = [
  "Organization",
  "WebPage",
  "Article",
  "Product",
  "FAQPage",
  "LocalBusiness",
  "BreadcrumbList",
];

const formStyle =
  "w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white";

export default function SeoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    page: "",
    meta_title: "",
    meta_description: "",
    canonical_url: "",
    robots_tag: "index, follow",
    og_title: "",
    og_description: "",
    og_image: "",
    og_image_alt: "",
    twitter_title: "",
    twitter_description: "",
    twitter_image: "",
    schema_type: "",
    schema_json: "",
    status: "active",
  });

  useEffect(() => {
    if (isEdit) {
      const fetchData = async () => {
        try {
          setPageLoading(true);
          const res = await getSeoById(id);
          if (res.success && res.data) {
            const d = res.data;
            setForm({
              page: d.page || "",
              meta_title: d.meta_title || "",
              meta_description: d.meta_description || "",
              canonical_url: d.canonical_url || "",
              robots_tag: d.robots_tag || "index, follow",
              og_title: d.og_title || "",
              og_description: d.og_description || "",
              og_image: d.og_image || "",
              og_image_alt: d.og_image_alt || "",
              twitter_title: d.twitter_title || "",
              twitter_description: d.twitter_description || "",
              twitter_image: d.twitter_image || "",
              schema_type: d.schema_type || "",
              schema_json: d.schema_json || "",
              status: d.status || "active",
            });
          } else {
            toast.error("SEO entry not found");
            navigate("/global-content/seo");
          }
        } catch (err) {
          toast.error("Failed to load SEO entry");
          navigate("/global-content/seo");
        } finally {
          setPageLoading(false);
        }
      };
      fetchData();
    }
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
    if (!form.page) {
      newErrors.page = "Page is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const res = isEdit
        ? await updateSeo(id, form)
        : await createSeo(form);
      if (res.success) {
        toast.success(isEdit ? "SEO entry updated successfully" : "SEO entry created successfully");
        navigate("/global-content/seo");
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500 font-medium text-sm">Loading SEO data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => navigate("/global-content/seo")}
          className="rounded-xl border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            {isEdit ? "Edit SEO Entry" : "Create SEO Entry"}
          </h1>
          <p className="text-slate-500 text-sm">
            {isEdit
              ? "Update meta tags and SEO settings for this page"
              : "Add meta tags and SEO settings for a new page"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic SEO */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">
            Basic SEO
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Page */}
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Page <span className="text-red-500">*</span>
              </label>
              <select
                name="page"
                value={form.page}
                onChange={handleChange}
                className={`${formStyle} ${errors.page ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}`}
              >
                <option value="">Select Page</option>
                {PAGES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " ")}
                  </option>
                ))}
              </select>
              {errors.page && (
                <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                  {errors.page}
                </span>
              )}
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
                className={formStyle}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              Meta Title
            </label>
            <Input
              name="meta_title"
              value={form.meta_title}
              onChange={handleChange}
              placeholder="Enter meta title (60 chars recommended)"
              maxLength={160}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              Meta Description
            </label>
            <Textarea
              name="meta_description"
              value={form.meta_description}
              onChange={handleChange}
              placeholder="Enter meta description (160 chars recommended)"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Canonical URL
              </label>
              <Input
                name="canonical_url"
                value={form.canonical_url}
                onChange={handleChange}
                placeholder="https://example.com/page"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Robots Tag
              </label>
              <select
                name="robots_tag"
                value={form.robots_tag}
                onChange={handleChange}
                className={formStyle}
              >
                {ROBOTS_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Open Graph */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">
            Open Graph (OG)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                OG Title
              </label>
              <Input
                name="og_title"
                value={form.og_title}
                onChange={handleChange}
                placeholder="Open Graph title"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                OG Image
              </label>
              <Upload
                value={form.og_image}
                onChange={(url) => setForm((prev) => ({ ...prev, og_image: url }))}
                mediaType="image"
                accept="image/*"
                maxSizeKB={500}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              OG Description
            </label>
            <Textarea
              name="og_description"
              value={form.og_description}
              onChange={handleChange}
              placeholder="Open Graph description"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              OG Image Alt Text
            </label>
            <Input
              name="og_image_alt"
              value={form.og_image_alt}
              onChange={handleChange}
              placeholder="Alt text for OG image"
            />
          </div>
        </div>

        {/* Twitter Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">
            Twitter Card
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Twitter Title
              </label>
              <Input
                name="twitter_title"
                value={form.twitter_title}
                onChange={handleChange}
                placeholder="Twitter card title"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Twitter Image
              </label>
              <Upload
                value={form.twitter_image}
                onChange={(url) => setForm((prev) => ({ ...prev, twitter_image: url }))}
                mediaType="image"
                accept="image/*"
                maxSizeKB={500}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              Twitter Description
            </label>
            <Textarea
              name="twitter_description"
              value={form.twitter_description}
              onChange={handleChange}
              placeholder="Twitter card description"
              rows={3}
            />
          </div>
        </div>

        {/* Schema */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">
            Schema Markup
          </h2>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              Schema Type
            </label>
            <select
              name="schema_type"
              value={form.schema_type}
              onChange={handleChange}
              className={formStyle}
            >
              <option value="">Select Schema Type</option>
              {SCHEMA_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              Schema JSON
            </label>
            <Textarea
              name="schema_json"
              value={form.schema_json}
              onChange={handleChange}
              placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Organization"\n}'}
              rows={6}
              className="font-mono text-xs"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/global-content/seo")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: "#981B1F" }}
            className="text-white hover:opacity-90"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "Update Entry" : "Create Entry"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
