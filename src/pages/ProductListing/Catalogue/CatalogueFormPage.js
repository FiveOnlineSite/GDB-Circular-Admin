import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import Upload from "../../../components/common/Upload";
import { Textarea } from "../../../components/ui/textarea";
import { getProductById, createProduct, updateProduct } from "../../../services/productListing";

const ss = "w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white";

const CATEGORIES = ["LDPE", "HDPE", "PP"];

const INIT = { product_category: "", product_name: "", short_description: "", image_url: "", image_alt: "", pdf_url: "", show_on_homepage: false, sequence: 0, status: "active" };

export default function CatalogueFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(INIT);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setPageLoading(true);
        const res = await getProductById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({ product_category: d.product_category || "", product_name: d.product_name || "", short_description: d.short_description || "", image_url: d.image_url || "", image_alt: d.image_alt || "", pdf_url: d.pdf_url || "", show_on_homepage: Boolean(d.show_on_homepage), sequence: d.sequence ?? 0, status: d.status || "active" });
        } else { toast.error("Product not found"); navigate("/product-listing/catalogue"); }
      } catch { toast.error("Failed to load product"); navigate("/product-listing/catalogue"); }
      finally { setPageLoading(false); }
    })();
  }, [id, navigate]);

  const [errors, setErrors] = useState({});

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!form.product_category) newErrors.product_category = "Product category is required";
    if (!form.product_name.trim()) newErrors.product_name = "Product name is required";
    if (!form.image_url) newErrors.image_url = "Product image is required";
    if (!Number.isInteger(Number(form.sequence)) || Number(form.sequence) < 0) newErrors.sequence = "Sequence must be a non-negative integer";
    if (form.pdf_url && !String(form.pdf_url).toLowerCase().includes(".pdf")) newErrors.pdf_url = "Please upload a valid PDF file";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        product_name: form.product_name.trim(),
        short_description: form.short_description.trim(),
        image_alt: form.image_alt.trim(),
        pdf_url: form.pdf_url.trim(),
        sequence: Number(form.sequence),
        show_on_homepage: form.show_on_homepage ? 1 : 0,
      };
      const res = isEdit ? await updateProduct(id, payload) : await createProduct(payload);
      if (res.success) { toast.success(isEdit ? "Product updated" : "Product created"); navigate("/product-listing/catalogue"); }
      else toast.error(res.message || "Operation failed");
    } catch (err) {
      const apiErrors = err.response?.data?.error;
      if (apiErrors && typeof apiErrors === "object") {
        setErrors(prev => ({ ...prev, ...apiErrors }));
      }
      toast.error(err.response?.data?.message || "Operation failed");
    }
    finally { setSubmitting(false); }
  };

  if (pageLoading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin" /></div>;

  const title = isView ? "View Product" : isEdit ? "Edit Product" : "Add Product";

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" type="button" onClick={() => navigate("/product-listing/catalogue")} className="rounded-xl border-slate-200">
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{title}</h1>
          <p className="text-slate-500 text-sm">{isView ? "Product details" : isEdit ? "Update product information" : "Add a new product to the catalogue"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Core Fields */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Product Category <span className="text-red-500">*</span></label>
              <select
                name="product_category"
                value={form.product_category}
                onChange={handle}
                aria-invalid={errors.product_category ? "true" : "false"}
                className={`${ss} ${errors.product_category ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}`}
                disabled={isView}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.product_category && (
                <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                  {errors.product_category}
                </span>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Product Name <span className="text-red-500">*</span></label>
              <Input
                name="product_name"
                value={form.product_name}
                onChange={handle}
                placeholder="e.g. LDPE Virgin Grade"
                disabled={isView}
                error={!!errors.product_name}
                errorMessage={errors.product_name}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Image Alt Text</label>
              <Input
                name="image_alt"
                value={form.image_alt}
                onChange={handle}
                placeholder="Describe the product image"
                disabled={isView}
                error={!!errors.image_alt}
                errorMessage={errors.image_alt}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Sequence</label>
              <Input
                type="number"
                min="0"
                name="sequence"
                value={form.sequence}
                onChange={handle}
                disabled={isView}
                error={!!errors.sequence}
                errorMessage={errors.sequence}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Status</label>
              <select name="status" value={form.status} onChange={handle} className={`${ss} cursor-pointer`} disabled={isView}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" id="show_on_homepage" name="show_on_homepage" checked={form.show_on_homepage} onChange={handle} disabled={isView} className="w-4 h-4 cursor-pointer accent-[#981B1F]" />
              <label htmlFor="show_on_homepage" className="text-sm font-semibold text-slate-600 dark:text-gray-300 cursor-pointer">Show on Homepage</label>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Short Description</label>
            <Textarea name="short_description" value={form.short_description} onChange={handle} rows={3} placeholder="Brief product description..." disabled={isView} />
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">
            Product Image <span className="text-red-500">*</span>
          </h2>
          <Upload
            value={form.image_url}
            onChange={(url) => {
              setForm((p) => ({ ...p, image_url: url }));
              if (errors.image_url) {
                setErrors(prev => {
                  const next = { ...prev };
                  delete next.image_url;
                  return next;
                });
              }
            }}
            mediaType="image"
            accept="image/*"
            maxSizeKB={500}
            disabled={isView}
          />
          {errors.image_url && (
            <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
              {errors.image_url}
            </span>
          )}
        </div>

        {/* PDF Upload */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">
            Know More PDF
          </h2>
          <Upload
            value={form.pdf_url}
            onChange={(url) => {
              setForm((p) => ({ ...p, pdf_url: url }));
              if (errors.pdf_url) {
                setErrors(prev => {
                  const next = { ...prev };
                  delete next.pdf_url;
                  return next;
                });
              }
            }}
            mediaType="document"
            accept="application/pdf"
            compressBeforeUpload={false}
            disabled={isView}
          />
          {errors.pdf_url && (
            <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
              {errors.pdf_url}
            </span>
          )}
        </div>

        {!isView && (
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/product-listing/catalogue")}>Cancel</Button>
            <Button type="submit" disabled={submitting} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />{isEdit ? "Update Product" : "Create Product"}</>}
            </Button>
          </div>
        )}
        {isView && (
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => navigate("/product-listing/catalogue")}>Back to List</Button>
          </div>
        )}
      </form>
    </div>
  );
}
