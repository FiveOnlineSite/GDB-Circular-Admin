import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Loader2, Save } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import Upload from "../../components/common/Upload";
import { getFacility, createFacility, updateFacility } from "../../services/facilityService";
import { toast } from "sonner";

const INITIAL_FORM = {
  title: "",
  addressLine1: "",
  addressLine2: "",
  phone: "",
  image_url: "",
  is_development: false,
  sequence: 0,
  status: "active",
};

export default function FacilityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isView = location.pathname.includes('/facilities/view');
  const isEdit = Boolean(id) && !isView;

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!(isEdit || isView)) return;

    setLoading(true);
    getFacility(id)
      .then((response) => {
        const facility = response?.data || response || {};
        setForm({
          title: facility.title || facility.facility_name || "",
          addressLine1: facility.addressLine1 || facility.address || "",
          addressLine2: facility.addressLine2 || facility.state || "",
          phone: facility.phone || "",
          image_url: facility.image_url || "",
          is_development: Boolean(facility.is_development ?? facility.isDevelopment),
          sequence: facility.sequence ?? 0,
          status: facility.status || "active",
        });
      })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [id, isEdit, isView]);

  const updateField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;

    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.is_development && !form.addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required";
    if (!form.is_development && !form.addressLine2.trim()) newErrors.addressLine2 = "Address Line 2 is required";
    if (!form.is_development && !form.phone.trim()) newErrors.phone = "Phone is required";
    if (!form.image_url) newErrors.image_url = "Image Upload is required";

    const mobileRegex = /^\+?[\d\s()-]{8,20}$/;
    if (form.phone.trim() && !mobileRegex.test(form.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      if (isEdit) await updateFacility(id, form); else await createFacility(form);
      toast.success('Saved');
      navigate('/facilities');
    } catch (e) {
      const apiErrors = e.response?.data?.error;
      if (apiErrors && typeof apiErrors === "object") {
        setErrors(apiErrors);
      }
      toast.error(e.response?.data?.message || 'Save failed');
    }
    finally { setSubmitting(false); }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{isView ? 'View Facility' : isEdit ? 'Edit Facility' : 'Add Facility'}</h2>
        <p className="text-sm text-gray-500 mt-1">Provide facility details and an image for listings</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 ">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">Title <span className="text-red-500">*</span></label>
            <Input value={form.title} onChange={e=>updateField("title", e.target.value)} error={!!errors.title} errorMessage={errors.title} disabled={isView} />
          </div>

          <label className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-3">
            <input
              type="checkbox"
              checked={form.is_development}
              onChange={(e) => updateField("is_development", e.target.checked)}
              disabled={isView}
              className="h-4 w-4 accent-[#981B1F]"
            />
            <span className="text-sm font-medium text-slate-700">Facility is in development</span>
          </label>

          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">Address Line 1 {!form.is_development && <span className="text-red-500">*</span>}</label>
            <Input value={form.addressLine1} onChange={e=>updateField("addressLine1", e.target.value)} error={!!errors.addressLine1} errorMessage={errors.addressLine1} disabled={isView} />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">Address Line 2 {!form.is_development && <span className="text-red-500">*</span>}</label>
            <Textarea value={form.addressLine2} onChange={e=>updateField("addressLine2", e.target.value)} error={!!errors.addressLine2} errorMessage={errors.addressLine2} disabled={isView} />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">Phone {!form.is_development && <span className="text-red-500">*</span>}</label>
            <Input value={form.phone} onChange={e=>updateField("phone", e.target.value)} error={!!errors.phone} errorMessage={errors.phone} disabled={isView} />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-2">Image Upload <span className="text-red-500">*</span></label>
            <Upload
              value={form.image_url}
              onChange={(url) => updateField("image_url", url)}
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

          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">Sequence</label>
            <Input type="number" value={form.sequence} onChange={e=>setForm(f=>({...f, sequence: Number(e.target.value)}))} disabled={isView} />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            {!isView && (
              <Button type="submit" disabled={submitting || loading}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEdit ? "Update Facility" : "Add Facility"}
                  </>
                )}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={()=>navigate('/facilities')}>{isView ? 'Back' : 'Cancel'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
