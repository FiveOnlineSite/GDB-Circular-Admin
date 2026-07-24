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
  facility_name: "",
  facility_type: "",
  address: "",
  phone: "",
  state: "",
  latitude: "",
  longitude: "",
  image_url: "",
  image_alt: "",
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
          facility_name: facility.facility_name || "",
          facility_type: facility.facility_type || "",
          address: facility.address || "",
          phone: facility.phone || "",
          state: facility.state || "",
          latitude: facility.latitude ?? "",
          longitude: facility.longitude ?? "",
          image_url: facility.image_url || "",
          image_alt: facility.image_alt || "",
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
    if (!form.facility_name.trim()) newErrors.facility_name = "Facility Name is required";
    if (!form.facility_type.trim()) newErrors.facility_type = "Facility Type is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!String(form.latitude).trim()) newErrors.latitude = "Latitude is required";
    if (!String(form.longitude).trim()) newErrors.longitude = "Longitude is required";
    if (!form.image_alt.trim()) newErrors.image_alt = "Image Alt Text is required";
    if (!form.image_url) newErrors.image_url = "Image Upload is required";

    const mobileRegex = /^\+?[0-9\s-]{8,15}$/;
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
            <label className="text-sm font-semibold text-slate-600 block mb-1">Facility Name <span className="text-red-500">*</span></label>
            <Input value={form.facility_name} onChange={e=>updateField("facility_name", e.target.value)} error={!!errors.facility_name} errorMessage={errors.facility_name} disabled={isView} />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">Facility Type <span className="text-red-500">*</span></label>
            <Input value={form.facility_type} onChange={e=>updateField("facility_type", e.target.value)} error={!!errors.facility_type} errorMessage={errors.facility_type} disabled={isView} />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">Address <span className="text-red-500">*</span></label>
            <Textarea value={form.address} onChange={e=>updateField("address", e.target.value)} error={!!errors.address} errorMessage={errors.address} disabled={isView} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-1">Phone <span className="text-red-500">*</span></label>
              <Input value={form.phone} onChange={e=>updateField("phone", e.target.value)} error={!!errors.phone} errorMessage={errors.phone} disabled={isView} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-1">State <span className="text-red-500">*</span></label>
              <Input value={form.state} onChange={e=>updateField("state", e.target.value)} error={!!errors.state} errorMessage={errors.state} disabled={isView} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-1">Latitude <span className="text-red-500">*</span></label>
              <Input value={form.latitude} onChange={e=>updateField("latitude", e.target.value)} error={!!errors.latitude} errorMessage={errors.latitude} disabled={isView} />
            </div>
            <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1">Longitude <span className="text-red-500">*</span></label>
                <Input value={form.longitude} onChange={e=>updateField("longitude", e.target.value)} error={!!errors.longitude} errorMessage={errors.longitude} disabled={isView} />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 block mb-1">Image Alt Text <span className="text-red-500">*</span></label>
            <Input value={form.image_alt} onChange={e=>updateField("image_alt", e.target.value)} error={!!errors.image_alt} errorMessage={errors.image_alt} disabled={isView} />
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
