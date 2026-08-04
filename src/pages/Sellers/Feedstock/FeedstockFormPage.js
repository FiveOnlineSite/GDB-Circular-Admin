import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import Upload from "../../../components/common/Upload";
import EditPageDeleteAction from "../../../components/common/EditPageDeleteAction";
import { getFeedstockById, createFeedstock, updateFeedstock } from "../../../services/sellers/feedstockService";

export default function FeedstockFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/sellers/feedstock-catalogue/view/");
  const isEdit = Boolean(id) && !isView;
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    feedstock_category: "LDPE",
    material_name: "",
    short_description: "",
    image_url: "",
    image_alt: "",
    sequence: 0,
    status: "active",
  });

  useEffect(() => {
    if (!isEdit && !isView) return;
    (async () => {
      try {
        setPageLoading(true);
        const res = await getFeedstockById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            feedstock_category: d.feedstock_category || "LDPE",
            material_name: d.material_name || "",
            short_description: d.short_description || "",
            image_url: d.image_url || "",
            image_alt: d.image_alt || "",
            sequence: d.sequence ?? 0,
            status: d.status || "active",
          });
        } else {
          toast.error("Feedstock item not found");
          navigate("/sellers/feedstock-catalogue");
        }
      } catch {
        toast.error("Failed to load feedstock details");
        navigate("/sellers/feedstock-catalogue");
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
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleImageUpload = (url) => {
    setForm((prev) => ({ ...prev, image_url: url }));
    if (errors.image_url) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.image_url;
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;

    const newErrors = {};
    if (!form.material_name.trim()) newErrors.material_name = "Material Name is required";
    if (!form.short_description.trim()) newErrors.short_description = "Short Description is required";
    if (!form.image_url) newErrors.image_url = "Material Image is required";
    if (!form.image_alt.trim()) newErrors.image_alt = "Image Alt Text is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        material_name: form.material_name.trim(),
        short_description: form.short_description.trim(),
        image_alt: form.image_alt.trim(),
        sequence: Number(form.sequence),
      };
      const res = isEdit ? await updateFeedstock(id, payload) : await createFeedstock(payload);
      if (res.success) {
        toast.success(isEdit ? "Feedstock updated successfully" : "Feedstock created successfully");
        navigate("/sellers/feedstock-catalogue");
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
    return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin" /></div>;
  }

  const pageTitle = isView ? "View Feedstock Material" : isEdit ? "Edit Feedstock Material" : "Add Feedstock Material";

  return (
    <div className="space-y-6 pb-12 w-full p-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" type="button" onClick={() => navigate("/sellers/feedstock-catalogue")} className="rounded-xl border-slate-200">
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800  tracking-tight">{pageTitle}</h1>
          <p className="text-slate-500 text-sm">{isView ? "View material details" : "Provide category, description, and image details"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700  border-b pb-3">Material Details</h2>
          <div className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-slate-600  block mb-1">Feedstock Category <span className="text-red-500">*</span></label>
                <select name="feedstock_category" value={form.feedstock_category} onChange={handleChange} disabled={isView} className="w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white    disabled:opacity-55">
                  <option value="LDPE">LDPE</option>
                  <option value="HDPE">HDPE</option>
                  <option value="PP">PP</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600  block mb-1">Material Name <span className="text-red-500">*</span></label>
                <Input name="material_name" value={form.material_name} onChange={handleChange} placeholder="e.g. PP Copolymer Regrind" disabled={isView} error={!!errors.material_name} errorMessage={errors.material_name} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600  block mb-1">Short Description <span className="text-red-500">*</span></label>
              <Textarea name="short_description" value={form.short_description} onChange={handleChange} placeholder="Enter quick summary of the material..." disabled={isView} rows={3} className="w-full border border-[#E6E6E6] rounded-lg p-3 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition    disabled:opacity-55" />
              {errors.short_description && <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">{errors.short_description}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-slate-600  block mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} disabled={isView} className="w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white    disabled:opacity-55">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700  border-b pb-3">Cover Image Upload</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div>
            <label className="text-sm font-semibold text-slate-600  block mb-2">Image (Max: 500KB) <span className="text-red-500">*</span></label>
            <Upload value={form.image_url} onChange={handleImageUpload} mediaType="image" accept="image/*" maxSizeKB={500} disabled={isView} />
            {errors.image_url && <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">{errors.image_url}</span>}
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600  block mb-2">Image Alt Text <span className="text-red-500">*</span></label>
            <Input name="image_alt" value={form.image_alt} onChange={handleChange} placeholder="Describe the feedstock image" disabled={isView} error={!!errors.image_alt} errorMessage={errors.image_alt} />
          </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <EditPageDeleteAction
            id={isEdit ? id : null}
            permission="seller.feedstock.delete"
            endpoint={`/sellers/feedstock/${id}`}
            redirectTo="/sellers/feedstock-catalogue"
            title="Delete Feedstock Material"
            message="Are you sure you want to delete this feedstock material? This action cannot be undone."
            successMessage="Feedstock material deleted"
          />
          <Button type="button" variant="outline" onClick={() => navigate("/sellers/feedstock-catalogue")}>{isView ? "Back" : "Cancel"}</Button>
          {!isView && (
            <Button type="submit" disabled={submitting} className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm transition-colors">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />{isEdit ? "Update Material" : "Save Material"}</>}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
